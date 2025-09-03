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

class FirebaseDashboardService {
  private readonly VISITS_COLLECTION = 'visits';

  /**
   * Busca dados consolidados do dashboard para uma organização
   */
  async getDashboardData(organizationId: string): Promise<DashboardData> {
    try {
      console.log('🔄 Buscando dados do dashboard para organização:', organizationId);
      console.log('🌍 Ambiente:', window.location.hostname);
      console.log('🔐 Firebase Auth:', auth.currentUser ? 'Autenticado' : 'Não autenticado');
      
      // PRIMEIRO: Buscar TODAS as visitas (sem filtro de organização) para debug
      console.log('🔍 DEBUG: Buscando TODAS as visitas primeiro...');
      const allVisitsQuery = query(
        collection(db, this.VISITS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const allVisitsSnapshot = await getDocs(allVisitsQuery);
      console.log(`📊 TOTAL de visitas no Firebase: ${allVisitsSnapshot.size}`);
      
      // Log das visitas encontradas
      allVisitsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Visita encontrada:', {
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

      console.log(`✅ ${visits.length} visitas da organização '${organizationId}' carregadas`);
      
      if (visits.length === 0) {
        console.log('⚠️ NENHUMA visita encontrada para esta organização!');
        console.log('💡 Verifique se o organizationId das visitas está correto');
      }

      // Processar dados
      const dashboardData = this.processVisitsData(visits);
      
      console.log('📊 Dados processados:', dashboardData);
      
      return dashboardData;
    } catch (error) {
      console.error('❌ Erro ao buscar dados do dashboard:', error);
      throw new Error(`Falha ao carregar dados do dashboard: ${error}`);
    }
  }

  /**
   * Busca classificação de risco por bairro
   */
  async getNeighborhoodRisks(organizationId: string): Promise<NeighborhoodRisk[]> {
    try {
      console.log('🔄 Calculando riscos por bairro para organização:', organizationId);
      
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

      console.log(`✅ ${visits.length} visitas carregadas para análise de bairros`);

      // Processar dados por bairro
      const neighborhoodRisks = this.processNeighborhoodRisks(visits);
      
      return neighborhoodRisks;
    } catch (error) {
      console.error('❌ Erro ao buscar riscos por bairro:', error);
      throw new Error(`Falha ao carregar riscos por bairro: ${error}`);
    }
  }

  /**
   * Processa dados das visitas para gerar métricas do dashboard
   */
  private processVisitsData(visits: VisitForm[]): DashboardData {
    console.log('🔍 DEBUG: Processando TODAS as visitas para dashboard:', visits.length);
    
    const totalVisits = visits.length;
    let larvaePositive = 0;
    let breedingSitesEliminated = 0;

    // Processar todas as visitas para análise de larvas
    visits.forEach((visit, index) => {
      console.log(`🔍 DEBUG: Visita ${index + 1}:`, {
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

      console.log(`🔍 DEBUG Bairro ${name}:`, {
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
}

export const firebaseDashboardService = new FirebaseDashboardService();
