import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { VisitForm, LIRAAVisitForm } from '@/types/visits';
import logger from '@/lib/logger';

// Interfaces para os dados do dashboard
export interface DashboardData {
  totalVisits: number;
  routineVisits: number;
  liraaVisits: number;
  criticalAreas: number;
  agentsActive: number;
  larvaePositive: number;
  breedingSitesEliminated: number;
  averageRisk: number;
  coveragePercentage: number;
  samplingQuality: number;
  inconsistentData: number;
  missingSamples: number;
}

export interface NeighborhoodRisk {
  name: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  coverage: number;
  larvaeIndex: number;
  lastUpdate: string;
  priority: number;
  visitedProperties: number;
  totalProperties: number;
  refusedAccess: number;
  incompleteData: number;
  coordinates?: [number, number]; // Coordenadas reais das visitas
}

// Interface para classificação de prioridades baseada na tabela fornecida
export interface PriorityClassification {
  level: number;
  infestationLevel: 'Alto' | 'Médio' | 'Baixo';
  coverageLevel: 'Alto' | 'Médio' | 'Baixo';
  iipCriteria: string;
  coverageCriteria: string;
  diagnosis: string;
  immediateConclusion: string;
  detail: string;
  actions: string;
}

// Interface para dados de visitas de rotina com classificação
export interface RoutineVisitData {
  neighborhood: string;
  totalVisits: number;
  positiveVisits: number;
  completedVisits: number;
  iip: number;
  coverage: number;
  priority: number;
  classification: PriorityClassification;
  lastUpdate: Date;
  coordinates?: [number, number];
}

class FirebaseDashboardService {
  private readonly VISITS_COLLECTION = 'visits';

  /**
   * Busca dados consolidados do dashboard para uma organização
   */
  async getDashboardData(organizationId: string): Promise<DashboardData> {
    try {
      logger.log('🔄 Buscando dados do dashboard para organização:', organizationId);
      logger.log('🌍 Ambiente:', window.location.hostname);
      logger.log('🔐 Firebase Auth:', auth.currentUser ? 'Autenticado' : 'Não autenticado');
      
      // PRIMEIRO: Buscar TODAS as visitas (sem filtro de organização) para debug
      logger.log('🔍 DEBUG: Buscando TODAS as visitas primeiro...');
      const allVisitsQuery = query(
        collection(db, this.VISITS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const allVisitsSnapshot = await getDocs(allVisitsQuery);
      logger.log(`📊 TOTAL de visitas no Firebase: ${allVisitsSnapshot.size}`);
      
      // Log das visitas encontradas
      allVisitsSnapshot.forEach((doc) => {
        const data = doc.data();
        logger.log('📄 Visita encontrada:', {
          id: doc.id,
          type: data.type,
          organizationId: data.organizationId,
          neighborhood: data.neighborhood,
          createdAt: data.createdAt?.toDate()
        });
      });

      // SEGUNDO: Buscar visitas da organização específica
      const visitsQuery = query(
        collection(db, this.VISITS_COLLECTION),
        where('organizationId', '==', organizationId),
        // Remover filtro de tipo para buscar TODAS as visitas (rotina + LIRAa)
        orderBy('createdAt', 'desc'),
        limit(1000)
      );

      const visitsSnapshot = await getDocs(visitsQuery);
      const visits: VisitForm[] = [];

      visitsSnapshot.forEach((doc) => {
        const data = doc.data();
        visits.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as VisitForm);
      });

      logger.log(`✅ ${visits.length} visitas da organização '${organizationId}' carregadas`);
      
      if (visits.length === 0) {
        logger.log('⚠️ NENHUMA visita encontrada para esta organização!');
        logger.log('💡 Verifique se o organizationId das visitas está correto');
      }

      // Processar dados
      const dashboardData = this.processVisitsData(visits);
      
      logger.log('📊 Dados processados:', dashboardData);
      
      return dashboardData;
    } catch (error) {
      logger.error('❌ Erro ao buscar dados do dashboard:', error);
      throw new Error(`Falha ao carregar dados do dashboard: ${error}`);
    }
  }

  /**
   * Busca classificação de risco por bairro
   */
  async getNeighborhoodRisks(organizationId: string): Promise<NeighborhoodRisk[]> {
    try {
      logger.log('🔄 Calculando riscos por bairro para organização:', organizationId);
      
      // Buscar TODAS as visitas (rotina + LIRAa) para análise de bairros
      const visitsQuery = query(
        collection(db, this.VISITS_COLLECTION),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc'),
        limit(500)
      );

      const visitsSnapshot = await getDocs(visitsQuery);
      const visits: VisitForm[] = [];

      visitsSnapshot.forEach((doc) => {
        const data = doc.data();
        visits.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as VisitForm);
      });

      logger.log(`✅ ${visits.length} visitas carregadas para análise de bairros`);

      // Processar dados por bairro
      const neighborhoodRisks = this.processNeighborhoodRisks(visits);
      
      return neighborhoodRisks;
    } catch (error) {
      logger.error('❌ Erro ao buscar riscos por bairro:', error);
      throw new Error(`Falha ao carregar riscos por bairro: ${error}`);
    }
  }

  /**
   * Processa dados das visitas para gerar métricas do dashboard
   */
  private processVisitsData(visits: VisitForm[]): DashboardData {
    logger.log('🔍 DEBUG: Processando TODAS as visitas para dashboard:', visits.length);
    
    const totalVisits = visits.length;
    let larvaePositive = 0;
    let breedingSitesEliminated = 0;

    // Processar todas as visitas para análise de larvas
    visits.forEach((visit, index) => {
      logger.log(`🔍 DEBUG: Visita ${index + 1}:`, {
        id: visit.id,
        type: visit.type,
        neighborhood: visit.neighborhood,
        larvaeFound: (visit as any).larvaeFound,
        pupaeFound: (visit as any).pupaeFound,
        positiveContainers: (visit as any).positiveContainers,
        larvaeSpecies: (visit as any).larvaeSpecies
      });
      
      // Verificar se tem larvas (diferentes campos para diferentes tipos de visita)
      let hasLarvae = false;
      
      if (visit.type === 'routine') {
        // Visitas de rotina usam larvaeFound/pupaeFound
        hasLarvae = (visit as any).larvaeFound || (visit as any).pupaeFound;
      } else if (visit.type === 'liraa') {
        // Visitas LIRAa usam positiveContainers ou larvaeSpecies
        hasLarvae = (visit as any).positiveContainers > 0 || 
                   ((visit as any).larvaeSpecies && (visit as any).larvaeSpecies.length > 0);
      }
      
      if (hasLarvae) {
        larvaePositive++;
        breedingSitesEliminated++;
      }
    });

    // Calcular agentes ativos (únicos nos últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeAgents = new Set(
      visits
        .filter(v => v.createdAt >= thirtyDaysAgo)
        .map(v => v.agentId)
    );

    // Calcular índice médio municipal (baseado na proporção de visitas com larvas encontradas)
    const averageRisk = totalVisits > 0 ? (larvaePositive / totalVisits) * 100 : 0;

    // Calcular cobertura (visitas concluídas vs total)
    const completedVisits = visits.filter(v => v.status === 'completed').length;
    const coveragePercentage = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;

    // Qualidade amostral (visitas com dados completos)
    const completeDataVisits = visits.filter(visit => 
      visit.neighborhood && 
      visit.location &&
      visit.status === 'completed'
    ).length;
    const samplingQuality = totalVisits > 0 ? (completeDataVisits / totalVisits) * 100 : 0;

    // Dados inconsistentes (visitas com problemas)
    const inconsistentData = visits.filter(v => 
      !v.neighborhood || 
      !v.location || 
      v.status === 'refused'
    ).length;

    // Separar por tipo para retorno
    const routineVisits = visits.filter(v => v.type === 'routine');
    const liraaVisits = visits.filter(v => v.type === 'liraa');

    return {
      totalVisits,
      routineVisits: routineVisits.length,
      liraaVisits: liraaVisits.length,
      criticalAreas: this.calculateCriticalAreas(visits),
      agentsActive: activeAgents.size,
      larvaePositive,
      breedingSitesEliminated,
      averageRisk: Math.round(averageRisk * 100) / 100,
      coveragePercentage: Math.round(coveragePercentage * 100) / 100,
      samplingQuality: Math.round(samplingQuality * 100) / 100,
      inconsistentData,
      missingSamples: totalVisits - completedVisits
    };
  }

  /**
   * Calcula áreas críticas baseado nas visitas com larvas
   */
  private calculateCriticalAreas(visits: VisitForm[]): number {
    const neighborhoods = new Map<string, { positive: number; total: number }>();

    visits.forEach(visit => {
      if (!visit.neighborhood) return;

      const neighborhood = visit.neighborhood;
      if (!neighborhoods.has(neighborhood)) {
        neighborhoods.set(neighborhood, { positive: 0, total: 0 });
      }

      const data = neighborhoods.get(neighborhood)!;
      data.total += 1; // Cada visita conta como 1

      // Verificar se tem larvas (diferentes campos para diferentes tipos de visita)
      let hasLarvae = false;
      
      if (visit.type === 'routine') {
        // Visitas de rotina usam larvaeFound/pupaeFound
        hasLarvae = (visit as any).larvaeFound || (visit as any).pupaeFound;
      } else if (visit.type === 'liraa') {
        // Visitas LIRAa usam positiveContainers ou larvaeSpecies
        hasLarvae = (visit as any).positiveContainers > 0 || 
                   ((visit as any).larvaeSpecies && (visit as any).larvaeSpecies.length > 0);
      }
      
      if (hasLarvae) {
        data.positive += 1;
      }
    });

    // Contar bairros com mais de 50% de visitas positivas (considerado crítico)
    let criticalAreas = 0;
    neighborhoods.forEach((data) => {
      if (data.total > 0) {
        const index = (data.positive / data.total) * 100;
        if (index > 50) { // Mais de 50% das visitas com larvas
          criticalAreas++;
        }
      }
    });

    return criticalAreas;
  }

  /**
   * Processa riscos por bairro
   */
  private processNeighborhoodRisks(visits: VisitForm[]): NeighborhoodRisk[] {
    const neighborhoods = new Map<string, {
      visits: VisitForm[];
      totalVisits: number;
      positiveVisits: number;
      completedVisits: number;
      refusedVisits: number;
      lastUpdate: Date;
    }>();

    // Agrupar visitas por bairro
    visits.forEach(visit => {
      if (!visit.neighborhood) return;

      const neighborhood = visit.neighborhood;
      if (!neighborhoods.has(neighborhood)) {
        neighborhoods.set(neighborhood, {
          visits: [],
          totalVisits: 0,
          positiveVisits: 0,
          completedVisits: 0,
          refusedVisits: 0,
          lastUpdate: visit.createdAt
        });
      }

      const data = neighborhoods.get(neighborhood)!;
      data.visits.push(visit);
      data.totalVisits += 1;

      // Verificar se tem larvas (diferentes campos para diferentes tipos de visita)
      let hasLarvae = false;
      
      if (visit.type === 'routine') {
        // Visitas de rotina usam larvaeFound/pupaeFound
        hasLarvae = (visit as any).larvaeFound || (visit as any).pupaeFound;
      } else if (visit.type === 'liraa') {
        // Visitas LIRAa usam positiveContainers ou larvaeSpecies
        hasLarvae = (visit as any).positiveContainers > 0 || 
                   ((visit as any).larvaeSpecies && (visit as any).larvaeSpecies.length > 0);
      }
      
      if (hasLarvae) {
        data.positiveVisits += 1;
      }

      if (visit.status === 'completed') data.completedVisits++;
      if (visit.status === 'refused') data.refusedVisits++;
      if (visit.createdAt > data.lastUpdate) data.lastUpdate = visit.createdAt;
    });

    // Converter para array de NeighborhoodRisk
    const risks: NeighborhoodRisk[] = [];
    
    neighborhoods.forEach((data, name) => {
      const larvaeIndex = data.totalVisits > 0 
        ? (data.positiveVisits / data.totalVisits) * 100 
        : 0;

      // Calcular coordenadas médias das visitas reais
      const validVisits = data.visits.filter(visit => visit.location?.latitude && visit.location?.longitude);
      let coordinates: [number, number] | undefined;
      
      if (validVisits.length > 0) {
        const avgLat = validVisits.reduce((sum, visit) => sum + visit.location!.latitude, 0) / validVisits.length;
        const avgLng = validVisits.reduce((sum, visit) => sum + visit.location!.longitude, 0) / validVisits.length;
        coordinates = [avgLat, avgLng];
      }

      logger.log(`🔍 DEBUG Bairro ${name}:`, {
        totalVisits: data.totalVisits,
        positiveVisits: data.positiveVisits,
        larvaeIndex: larvaeIndex,
        visits: data.visits.length,
        validCoordinates: validVisits.length,
        coordinates: coordinates
      });

      const riskLevel = this.calculateRiskLevel(larvaeIndex);
      const coverage = data.visits.length > 0 
        ? (data.completedVisits / data.visits.length) * 100 
        : 0;

      risks.push({
        name,
        riskLevel,
        coverage: Math.round(coverage * 100) / 100,
        larvaeIndex: Math.round(larvaeIndex * 100) / 100,
        lastUpdate: data.lastUpdate.toISOString(),
        priority: this.calculatePriority(riskLevel, coverage),
        visitedProperties: data.completedVisits,
        totalProperties: data.visits.length,
        refusedAccess: data.refusedVisits,
        incompleteData: data.visits.length - data.completedVisits - data.refusedVisits,
        coordinates
      });
    });

    // Ordenar por prioridade (risco alto primeiro)
    return risks.sort((a, b) => b.priority - a.priority);
  }

    /**
   * Calcula nível de risco baseado no índice de larvas para visitas de rotina
   * CRITÉRIOS PARA VISITAS DE ROTINA:
   * 
   * - CRÍTICO (≥80%): Mais de 80% das visitas com larvas - situação crítica
   * - ALTO (60-79%): 60-79% das visitas com larvas - situação de alerta
   * - MÉDIO (40-59%): 40-59% das visitas com larvas - situação de atenção
   * - BAIXO (<40%): Menos de 40% das visitas com larvas - situação controlada
   */
  private calculateRiskLevel(larvaeIndex: number): 'low' | 'medium' | 'high' | 'critical' {
    if (larvaeIndex >= 80) return 'critical';   // ≥80% = CRÍTICO
    if (larvaeIndex >= 60) return 'high';       // 60-79% = ALTO
    if (larvaeIndex >= 40) return 'medium';     // 40-59% = MÉDIO
    return 'low';                               // <40% = BAIXO
  }

  /**
   * Calcula prioridade baseada no risco e cobertura
   */
  private calculatePriority(riskLevel: string, coverage: number): number {
    const riskWeight = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    }[riskLevel] || 1;

    const coverageWeight = coverage < 50 ? 2 : coverage < 80 ? 1.5 : 1;

    return riskWeight * coverageWeight;
  }

  /**
   * Classifica prioridade baseada na tabela fornecida (1-9)
   * Baseado em IIP e Cobertura para visitas de rotina
   */
  private classifyPriority(iip: number, coverage: number): PriorityClassification {
    // Determinar nível de infestação
    const infestationLevel: 'Alto' | 'Médio' | 'Baixo' = 
      iip >= 4 ? 'Alto' : iip >= 1 ? 'Médio' : 'Baixo';
    
    // Determinar nível de cobertura
    const coverageLevel: 'Alto' | 'Médio' | 'Baixo' = 
      coverage >= 80 ? 'Alto' : coverage >= 50 ? 'Médio' : 'Baixo';

    // Classificar baseado na tabela
    if (infestationLevel === 'Alto' && coverageLevel === 'Alto') {
      return {
        level: 1,
        infestationLevel: 'Alto',
        coverageLevel: 'Alto',
        iipCriteria: '>= 4%',
        coverageCriteria: '>= 80%',
        diagnosis: 'Infestação confirmada',
        immediateConclusion: 'Ação necessária',
        detail: 'O resultado mostra uma infestação moderada detectada com boa qualidade de amostragem. O dado é consistente e permite um diagnóstico confiável da situação. O local já exige resposta concreta e planejamento de contenção. Executar ações de controle e intensificar o monitoramento da área.',
        actions: 'Intensificar ações imediatas de controle vetorial: visitas domiciliares semanais, eliminação mecânica de criadouros, aplicação de larvicidas e mobilização social. Ativar plano de contingência local.'
      };
    }
    
    if (infestationLevel === 'Alto' && coverageLevel === 'Médio') {
      return {
        level: 2,
        infestationLevel: 'Alto',
        coverageLevel: 'Médio',
        iipCriteria: '>= 4%',
        coverageCriteria: '>= 50%; < 80%',
        diagnosis: 'Risco eminente',
        immediateConclusion: 'Ampliar amostragem e agir',
        detail: 'A área apresenta um número relevante de focos, com amostragem de cobertura moderada. O cenário já exige atenção, mas ainda possui margem de incerteza quanto à extensão total da infestação. Ampliar a cobertura da coleta e iniciar medidas de controle proporcionais.',
        actions: 'Aumentar cobertura de visitas para atingir 80%+, reforçar inspeção em áreas críticas, intensificar campanhas educativas e ações de bloqueio vetorial (UBV portátil/costais).'
      };
    }
    
    if (infestationLevel === 'Alto' && coverageLevel === 'Baixo') {
      return {
        level: 3,
        infestationLevel: 'Alto',
        coverageLevel: 'Baixo',
        iipCriteria: '>= 4%',
        coverageCriteria: '< 50%',
        diagnosis: 'Subdimensionamento',
        immediateConclusion: 'Alto risco oculto',
        detail: 'Apesar da presença significativa de focos, a coleta foi insuficiente para representar com confiança a situação. Isso indica alto risco de subdimensionamento da infestação, dificultando o planejamento de resposta adequada. Refazer a coleta com urgência e avaliar reforço nas ações de campo.',
        actions: 'Melhorar imediatamente a cobertura de visitas (meta 80%), reavaliar amostragem e logística das equipes, usar apoio intersetorial (agentes comunitários, mutirões). Risco de infestação real estar subnotificado.'
      };
    }
    
    if (infestationLevel === 'Médio' && coverageLevel === 'Baixo') {
      return {
        level: 4,
        infestationLevel: 'Médio',
        coverageLevel: 'Baixo',
        iipCriteria: '>= 1%; <4%',
        coverageCriteria: '< 50%',
        diagnosis: 'Ocorrência moderada',
        immediateConclusion: 'Necessidade de nova amostragem',
        detail: 'Foram detectados poucos focos, mas com amostragem bastante limitada. Esse cenário compromete a confiabilidade do resultado e dificulta estimar corretamente a real extensão da infestação. Há possibilidade de que a ocorrência esteja subestimada. Repetir a coleta com maior abrangência e revisar o nível de risco da área.',
        actions: 'Deve-se ampliar a amostragem para confirmar a real situação, aumentando o número de visitas em áreas ainda não contempladas, aplicar larvicida nos focos encontrados, reforçar a orientação comunitária sobre eliminação de criadouros e manter monitoramento semanal até que a cobertura mínima de 80% seja atingida.'
      };
    }
    
    if (infestationLevel === 'Médio' && coverageLevel === 'Médio') {
      return {
        level: 5,
        infestationLevel: 'Médio',
        coverageLevel: 'Médio',
        iipCriteria: '>= 1%; <4%',
        coverageCriteria: '>= 50%; < 80%',
        diagnosis: 'Infestação moderada',
        immediateConclusion: 'Atenção ao reforço da coleta',
        detail: 'O número de focos é moderado e a amostragem razoável. Isso pode indicar um início de infestação, mas o dado ainda tem margem de incerteza. Não se pode afirmar que o problema está restrito sem uma coleta mais robusta. Reforçar a amostragem e iniciar ações preventivas no local.',
        actions: 'É necessário expandir a cobertura das visitas para alcançar pelo menos 80%, priorizando áreas com maior concentração de focos, intensificar campanhas educativas porta a porta, avaliar a necessidade de aplicação de inseticida UBV (fumacê) em pontos críticos e manter monitoramento quinzenal com relatórios regulares para os gestores locais'
      };
    }
    
    if (infestationLevel === 'Baixo' && coverageLevel === 'Baixo') {
      return {
        level: 6,
        infestationLevel: 'Baixo',
        coverageLevel: 'Baixo',
        iipCriteria: '< 1%',
        coverageCriteria: '< 50%',
        diagnosis: 'Amostragem insuficiente',
        immediateConclusion: 'Risco não pode ser descartado',
        detail: 'Poucos focos encontrados na área, mas a amostragem realizada está muito abaixo do nível mínimo recomendado. Isso significa que o dado é insuficiente para qualquer conclusão sobre a situação real da área. É fundamental reforçar a cobertura amostral para permitir uma avaliação confiável e evitar falsa sensação de segurança.',
        actions: 'Priorizar aumento de cobertura para reduzir viés, organizar mutirões, envolver lideranças comunitárias e revisar planejamento territorial.'
      };
    }
    
    if (infestationLevel === 'Médio' && coverageLevel === 'Alto') {
      return {
        level: 7,
        infestationLevel: 'Médio',
        coverageLevel: 'Alto',
        iipCriteria: '>= 1%; <4%',
        coverageCriteria: '>= 80%',
        diagnosis: 'Risco de infestação',
        immediateConclusion: 'Iniciar medidas preventivas',
        detail: 'O índice de infestação associado à amostragem adequada, revelam que o dado é confiável para indicar um risco de infestação. Este é um momento favorável para intervir precocemente e evitar a progressão do problema. Iniciar medidas de contenção e manter vigilância contínua.',
        actions: 'Implementar medidas preventivas imediatas: eliminar criadouros potenciais, intensificar educação em saúde, realizar mutirões comunitários e inspecionar pontos estratégicos (borracharias, ferros-velhos, depósitos).'
      };
    }
    
    if (infestationLevel === 'Baixo' && coverageLevel === 'Médio') {
      return {
        level: 8,
        infestationLevel: 'Baixo',
        coverageLevel: 'Médio',
        iipCriteria: '< 1%',
        coverageCriteria: '>= 50%; < 80%',
        diagnosis: 'Confiabilidade moderada',
        immediateConclusion: 'Manter monitoramento',
        detail: 'O baixo número de focos registrado, com uma amostragem de cobertura intermediária sugerem baixa ocorrência, mas ainda não é plenamente confiável. A área não apresenta indícios de infestação ativa, mas o grau de certeza sobre isso ainda é limitado. Ampliar a amostragem nas próximas rodadas para consolidar o diagnóstico.',
        actions: 'Ampliar cobertura para reforçar confiabilidade, manter inspeções regulares, e orientar moradores sobre eliminação de recipientes. Ações de monitoramento contínuo.'
      };
    }
    
    // Baixo + Alto (nível 9)
    return {
      level: 9,
      infestationLevel: 'Baixo',
      coverageLevel: 'Alto',
      iipCriteria: '< 1%',
      coverageCriteria: '>= 80%',
      diagnosis: 'Satisfatório',
      immediateConclusion: 'Situação controlada',
      detail: 'Poucos focos identificados e a amostragem atingiu um patamar considerado satisfatório em termos de cobertura. O dado é confiável e indica que, neste momento, não há sinais de ocorrência no local. Ainda assim, áreas sem focos devem ser acompanhadas regularmente para garantir manutenção da situação. Manter o monitoramento periódico da área.',
      actions: 'Manter rotina de visitas, vigilância contínua, ações educativas e monitoramento quinzenal.'
    };
  }

  /**
   * Busca dados de visitas de rotina com classificação de prioridades
   */
  async getRoutineVisitData(organizationId: string): Promise<RoutineVisitData[]> {
    try {
      logger.log('🔄 Buscando dados de visitas de rotina para classificação:', organizationId);
      
      // Buscar apenas visitas de rotina
      const visitsQuery = query(
        collection(db, this.VISITS_COLLECTION),
        where('organizationId', '==', organizationId),
        where('type', '==', 'routine'),
        orderBy('createdAt', 'desc'),
        limit(500)
      );

      const visitsSnapshot = await getDocs(visitsQuery);
      const visits: VisitForm[] = [];

      visitsSnapshot.forEach((doc) => {
        const data = doc.data();
        visits.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as VisitForm);
      });

      logger.log(`✅ ${visits.length} visitas de rotina carregadas`);

      // Agrupar por bairro
      const neighborhoods = new Map<string, {
        visits: VisitForm[];
        totalVisits: number;
        positiveVisits: number;
        completedVisits: number;
        lastUpdate: Date;
        coordinates: [number, number][];
      }>();

      visits.forEach(visit => {
        if (!visit.neighborhood) return;

        const neighborhood = visit.neighborhood;
        if (!neighborhoods.has(neighborhood)) {
          neighborhoods.set(neighborhood, {
            visits: [],
            totalVisits: 0,
            positiveVisits: 0,
            completedVisits: 0,
            lastUpdate: visit.createdAt,
            coordinates: []
          });
        }

        const data = neighborhoods.get(neighborhood)!;
        data.visits.push(visit);
        data.totalVisits += 1;

        // Verificar se tem larvas (visitas de rotina usam larvaeFound/pupaeFound)
        const hasLarvae = (visit as any).larvaeFound || (visit as any).pupaeFound;
        if (hasLarvae) {
          data.positiveVisits += 1;
        }

        if (visit.status === 'completed') data.completedVisits++;
        if (visit.createdAt > data.lastUpdate) data.lastUpdate = visit.createdAt;
        
        if (visit.location?.latitude && visit.location?.longitude) {
          data.coordinates.push([visit.location.latitude, visit.location.longitude]);
        }
      });

      // Converter para RoutineVisitData com classificação
      const routineData: RoutineVisitData[] = [];
      
      neighborhoods.forEach((data, name) => {
        const iip = data.totalVisits > 0 ? (data.positiveVisits / data.totalVisits) * 100 : 0;
        const coverage = data.totalVisits > 0 ? (data.completedVisits / data.totalVisits) * 100 : 0;
        
        const classification = this.classifyPriority(iip, coverage);
        
        // Calcular coordenadas médias
        let avgCoordinates: [number, number] | undefined;
        if (data.coordinates.length > 0) {
          const avgLat = data.coordinates.reduce((sum, coord) => sum + coord[0], 0) / data.coordinates.length;
          const avgLng = data.coordinates.reduce((sum, coord) => sum + coord[1], 0) / data.coordinates.length;
          avgCoordinates = [avgLat, avgLng];
        }

        routineData.push({
          neighborhood: name,
          totalVisits: data.totalVisits,
          positiveVisits: data.positiveVisits,
          completedVisits: data.completedVisits,
          iip: Math.round(iip * 100) / 100,
          coverage: Math.round(coverage * 100) / 100,
          priority: classification.level,
          classification,
          lastUpdate: data.lastUpdate,
          coordinates: avgCoordinates
        });
      });

      // Ordenar por prioridade (menor número = maior prioridade)
      return routineData.sort((a, b) => a.priority - b.priority);
    } catch (error) {
      logger.error('❌ Erro ao buscar dados de visitas de rotina:', error);
      throw new Error(`Falha ao carregar dados de visitas de rotina: ${error}`);
    }
  }
}

export const firebaseDashboardService = new FirebaseDashboardService();
