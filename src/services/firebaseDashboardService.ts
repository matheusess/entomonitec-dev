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
      
      // Buscar visitas LIRAA (que têm dados de recipientes e larvas)
      const liraaQuery = query(
        collection(db, this.VISITS_COLLECTION),
        where('organizationId', '==', organizationId),
        where('type', '==', 'liraa'),
        orderBy('createdAt', 'desc'),
        limit(500)
      );

      const liraaSnapshot = await getDocs(liraaQuery);
      const liraaVisits: LIRAAVisitForm[] = [];

      liraaSnapshot.forEach((doc) => {
        const data = doc.data();
        liraaVisits.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as LIRAAVisitForm);
      });

      console.log(`✅ ${liraaVisits.length} visitas LIRAA carregadas para análise de bairros`);

      // Processar dados por bairro
      const neighborhoodRisks = this.processNeighborhoodRisks(liraaVisits);
      
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
    const totalVisits = visits.length;
    const routineVisits = visits.filter(v => v.type === 'routine').length;
    const liraaVisits = visits.filter(v => v.type === 'liraa').length;
    
    // Calcular larvas positivas das visitas LIRAA
    const liraaVisitsData = visits.filter(v => v.type === 'liraa') as LIRAAVisitForm[];
    let larvaePositive = 0;
    let breedingSitesEliminated = 0;
    let totalContainers = 0;
    let positiveContainers = 0;

    liraaVisitsData.forEach(visit => {
      if (visit.containers && visit.positiveContainers) {
        // Somar todos os recipientes
        const containers = visit.containers;
        const positive = visit.positiveContainers;
        
        Object.keys(containers).forEach(key => {
          totalContainers += containers[key as keyof typeof containers] || 0;
          positiveContainers += positive[key as keyof typeof positive] || 0;
        });

        // Se tem larvas positivas, incrementar contador
        const hasPositiveLarvae = Object.values(positive).some(count => count > 0);
        if (hasPositiveLarvae) {
          larvaePositive++;
        }

        // Contar recipientes eliminados (assumindo que são os que tinham larvas)
        breedingSitesEliminated += Object.values(positive).reduce((sum, count) => sum + count, 0);
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

    // Calcular índice médio de risco (baseado na proporção de recipientes positivos)
    const averageRisk = totalContainers > 0 ? (positiveContainers / totalContainers) * 100 : 0;

    // Calcular cobertura (visitas concluídas vs total)
    const completedVisits = visits.filter(v => v.status === 'completed').length;
    const coveragePercentage = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;

    // Qualidade amostral (visitas com dados completos)
    const completeDataVisits = liraaVisitsData.filter(visit => 
      visit.containers && 
      visit.positiveContainers && 
      visit.neighborhood && 
      visit.location
    ).length;
    const samplingQuality = liraaVisits > 0 ? (completeDataVisits / liraaVisits) * 100 : 0;

    // Dados inconsistentes (visitas com problemas)
    const inconsistentData = visits.filter(v => 
      !v.neighborhood || 
      !v.location || 
      v.status === 'refused'
    ).length;

    return {
      totalVisits,
      routineVisits,
      liraaVisits,
      criticalAreas: this.calculateCriticalAreas(liraaVisitsData),
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
   * Calcula áreas críticas baseado no índice de infestação
   */
  private calculateCriticalAreas(liraaVisits: LIRAAVisitForm[]): number {
    const neighborhoods = new Map<string, { positive: number; total: number }>();

    liraaVisits.forEach(visit => {
      if (!visit.neighborhood || !visit.containers || !visit.positiveContainers) return;

      const neighborhood = visit.neighborhood;
      if (!neighborhoods.has(neighborhood)) {
        neighborhoods.set(neighborhood, { positive: 0, total: 0 });
      }

      const data = neighborhoods.get(neighborhood)!;
      const totalContainers = Object.values(visit.containers).reduce((sum, count) => sum + count, 0);
      const positiveContainers = Object.values(visit.positiveContainers).reduce((sum, count) => sum + count, 0);

      data.total += totalContainers;
      data.positive += positiveContainers;
    });

    // Contar bairros com índice > 4% (considerado crítico pelo MS)
    let criticalAreas = 0;
    neighborhoods.forEach((data) => {
      if (data.total > 0) {
        const index = (data.positive / data.total) * 100;
        if (index > 4) {
          criticalAreas++;
        }
      }
    });

    return criticalAreas;
  }

  /**
   * Processa riscos por bairro
   */
  private processNeighborhoodRisks(liraaVisits: LIRAAVisitForm[]): NeighborhoodRisk[] {
    const neighborhoods = new Map<string, {
      visits: LIRAAVisitForm[];
      totalContainers: number;
      positiveContainers: number;
      completedVisits: number;
      refusedVisits: number;
      lastUpdate: Date;
    }>();

    // Agrupar visitas por bairro
    liraaVisits.forEach(visit => {
      if (!visit.neighborhood) return;

      const neighborhood = visit.neighborhood;
      if (!neighborhoods.has(neighborhood)) {
        neighborhoods.set(neighborhood, {
          visits: [],
          totalContainers: 0,
          positiveContainers: 0,
          completedVisits: 0,
          refusedVisits: 0,
          lastUpdate: visit.createdAt
        });
      }

      const data = neighborhoods.get(neighborhood)!;
      data.visits.push(visit);

      if (visit.containers && visit.positiveContainers) {
        data.totalContainers += Object.values(visit.containers).reduce((sum, count) => sum + count, 0);
        data.positiveContainers += Object.values(visit.positiveContainers).reduce((sum, count) => sum + count, 0);
      }

      if (visit.status === 'completed') data.completedVisits++;
      if (visit.status === 'refused') data.refusedVisits++;
      if (visit.createdAt > data.lastUpdate) data.lastUpdate = visit.createdAt;
    });

    // Converter para array de NeighborhoodRisk
    const risks: NeighborhoodRisk[] = [];
    
    neighborhoods.forEach((data, name) => {
      const larvaeIndex = data.totalContainers > 0 
        ? (data.positiveContainers / data.totalContainers) * 100 
        : 0;

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
        incompleteData: data.visits.length - data.completedVisits - data.refusedVisits
      });
    });

    // Ordenar por prioridade (risco alto primeiro)
    return risks.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calcula nível de risco baseado no índice de larvas
   * CRITÉRIOS DO MINISTÉRIO DA SAÚDE (MS):
   * 
   * - CRÍTICO (≥4%): Situação de emergência, requer ação imediata
   * - ALTO (2-3.9%): Situação de alerta, intervenção necessária  
   * - MÉDIO (1-1.9%): Situação de atenção, monitoramento intensivo
   * - BAIXO (<1%): Situação satisfatória, manter vigilância
   * 
   * Fonte: Diretrizes Nacionais para Prevenção e Controle de Epidemias de Dengue - MS
   */
  private calculateRiskLevel(larvaeIndex: number): 'low' | 'medium' | 'high' | 'critical' {
    if (larvaeIndex >= 4) return 'critical';    // ≥4% = CRÍTICO
    if (larvaeIndex >= 2) return 'high';        // 2-3.9% = ALTO  
    if (larvaeIndex >= 1) return 'medium';      // 1-1.9% = MÉDIO
    return 'low';                               // <1% = BAIXO
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
