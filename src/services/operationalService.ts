import { UserService, IUserWithId } from './userService';
import { firebaseVisitsService } from './firebaseVisitsService';
import { VisitForm } from '@/types/visits';
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// Interfaces para dados operacionais
export interface AgentPerformance {
  id: string;
  name: string;
  role: string;
  team: string;
  totalVisits: number;
  routineVisits: number;
  liraaVisits: number;
  avgVisitsPerDay: number;
  completionRate: number;
  qualityScore: number;
  lastActivity: Date;
  status: 'active' | 'inactive' | 'leave';
  weeklyTarget: number;
  monthlyTarget: number;
  assignedNeighborhoods: string[];
  achievements: string[];
  isActiveInOrganization: boolean; // NOVO: indica se ainda está na organização
}

export interface TeamSummary {
  teamName: string;
  totalAgents: number;
  activeAgents: number;
  totalVisits: number;
  averageQuality: number;
  completionRate: number;
  targetAchievement: number;
}

export interface VisitTrend {
  date: string;
  visits: number;
  quality: number;
  agents: number;
}

export class OperationalService {

  /**
   * Busca dados operacionais completos para uma organização
   */
  async getOperationalData(organizationId: string, period: 'week' | 'month' | 'quarter' = 'week'): Promise<{
    agents: AgentPerformance[];
    teams: TeamSummary[];
    visitTrends: VisitTrend[];
  }> {
    try {
      console.log('🔄 Buscando dados operacionais para organização:', organizationId);

      // 1. Buscar usuários ativos da organização
      console.log('🔍 Buscando usuários ativos da organização:', organizationId);
      const activeUsers = await UserService.listUsersByOrganization(organizationId);
      console.log(`👥 ${activeUsers.length} usuários ativos encontrados:`, activeUsers.map(u => ({ id: u.id, name: u.name, role: u.role })));
      
      // 2. Buscar TODAS as visitas da organização
      console.log('🔍 Buscando todas as visitas da organização...');
      const allVisits = await firebaseVisitsService.getVisitsByOrganization(organizationId, 1000);
      console.log(`📊 ${allVisits.length} visitas encontradas no total`);
      
      // 3. Agrupar visitas por agente
      const visitsByAgent = new Map<string, VisitForm[]>();
      allVisits.forEach(visit => {
        if (!visitsByAgent.has(visit.agentId)) {
          visitsByAgent.set(visit.agentId, []);
        }
        visitsByAgent.get(visit.agentId)!.push(visit);
      });
      
      console.log(`👥 ${visitsByAgent.size} agentes únicos encontrados nas visitas`);

      // 4. Criar performance para todos os agentes (ativos + inativos)
      const agentPerformance: AgentPerformance[] = [];
      
      for (const [agentId, visits] of visitsByAgent) {
        try {
          // Verificar se o agente ainda está ativo na organização
          const activeUser = activeUsers.find(u => u.id === agentId);
          const isActiveInOrganization = !!activeUser;
          
          console.log(`🔍 Processando agente: ${visits[0]?.agentName || agentId} (${agentId}) - Ativo: ${isActiveInOrganization}`);
          
          // Criar dados do agente (usar dados do usuário ativo ou dados da visita)
          const agentData = activeUser || {
            id: agentId,
            name: visits[0]?.agentName || `Agente ${agentId}`,
            email: '',
            role: 'agent' as const,
            organizationId,
            assignedNeighborhoods: [],
            permissions: [],
            isActive: false,
            createdAt: visits[0]?.createdAt || new Date(),
            updatedAt: visits[0]?.updatedAt || new Date()
          };
          
          const agentMetrics = this.calculateAgentMetrics(agentData, visits, period, !isActiveInOrganization);
          agentPerformance.push(agentMetrics);
        } catch (userError) {
          console.error(`❌ Erro ao processar agente ${agentId}:`, userError);
        }
      }

      // 3. Calcular resumos de equipe
      const teams = this.calculateTeamSummary(agentPerformance);

      // 4. Calcular tendências de visitas (simplificado para debug)
      const visitTrends = await this.calculateVisitTrends(organizationId, period);

      console.log('✅ Dados operacionais carregados:', {
        agents: agentPerformance.length,
        teams: teams.length,
        trends: visitTrends.length
      });

      return {
        agents: agentPerformance,
        teams,
        visitTrends
      };
    } catch (error) {
      console.error('❌ Erro ao buscar dados operacionais:', error);
      console.error('Stack trace:', error);
      throw new Error(`Falha ao carregar dados operacionais: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Calcula métricas de performance de um agente
   */
  private calculateAgentMetrics(user: IUserWithId, visits: VisitForm[], period: string, isInactiveInOrganization: boolean = false): AgentPerformance {
    const now = new Date();
    const periodStart = this.getPeriodStart(period);
    
    // Filtrar visitas do período
    const periodVisits = visits.filter(visit => visit.createdAt >= periodStart);
    
    // Calcular métricas básicas
    const totalVisits = periodVisits.length;
    const routineVisits = periodVisits.filter(v => v.type === 'routine').length;
    const liraaVisits = periodVisits.filter(v => v.type === 'liraa').length;
    const completedVisits = periodVisits.filter(v => v.status === 'completed').length;
    
    // Calcular taxa de conclusão
    const completionRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;
    
    // Calcular qualidade baseada em critérios específicos
    const qualityScore = this.calculateQualityScore(periodVisits);
    
    // Calcular média de visitas por dia
    const daysInPeriod = Math.max(1, Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)));
    const avgVisitsPerDay = Math.round((totalVisits / daysInPeriod) * 10) / 10;
    
    // Determinar equipe baseada em lógica simples
    const team = this.determineTeam(user.assignedNeighborhoods || [], user.role);
    
    // Calcular última atividade
    const lastActivity = visits.length > 0 
      ? visits[0].createdAt 
      : user.lastLoginAt || user.createdAt;
    
    // Determinar status
    const status = this.determineStatus(user, lastActivity);
    
    // Calcular conquistas
    const achievements = this.calculateAchievements(periodVisits, completionRate, qualityScore);
    
    // Definir metas baseadas no role
    const { weeklyTarget, monthlyTarget } = this.getTargetsByRole(user.role);

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      team,
      totalVisits,
      routineVisits,
      liraaVisits,
      avgVisitsPerDay,
      completionRate,
      qualityScore,
      lastActivity,
      status: isInactiveInOrganization ? 'leave' : status,
      weeklyTarget,
      monthlyTarget,
      assignedNeighborhoods: user.assignedNeighborhoods || [],
      achievements,
      isActiveInOrganization: !isInactiveInOrganization
    };
  }

  /**
   * Calcula score de qualidade baseado em critérios específicos
   */
  private calculateQualityScore(visits: VisitForm[]): number {
    if (visits.length === 0) return 0;

    let totalScore = 0;
    let validVisits = 0;

    visits.forEach(visit => {
      let visitScore = 5; // Base score

      // Critérios de qualidade
      if (visit.status === 'completed') visitScore += 2;
      if (visit.observations && visit.observations.length > 10) visitScore += 1;
      if (visit.photos && visit.photos.length > 0) visitScore += 1;
      
      // Critérios específicos por tipo de visita
      if (visit.type === 'routine') {
        const routineVisit = visit as any;
        if (routineVisit.larvaeFound !== undefined) visitScore += 0.5;
        if (routineVisit.controlMeasures && routineVisit.controlMeasures.length > 0) visitScore += 0.5;
      } else if (visit.type === 'liraa') {
        const liraaVisit = visit as any;
        if (liraaVisit.containers && Object.values(liraaVisit.containers).some((v: any) => v > 0)) visitScore += 0.5;
        if (liraaVisit.larvaeSpecies && liraaVisit.larvaeSpecies.length > 0) visitScore += 0.5;
      }

      totalScore += Math.min(visitScore, 10); // Cap at 10
      validVisits++;
    });

    return validVisits > 0 ? Math.round((totalScore / validVisits) * 10) / 10 : 0;
  }

  /**
   * Determina equipe baseada em bairros atribuídos e role
   */
  private determineTeam(assignedNeighborhoods: string[], role: string): string {
    // Lógica simples baseada em bairros
    if (assignedNeighborhoods.length === 0) {
      return 'Sem Equipe';
    }

    // Mapeamento simples de bairros para equipes
    const teamMapping: { [key: string]: string } = {
      'Centro': 'Equipe Centro',
      'Centro Cívico': 'Equipe Centro',
      'Batel': 'Equipe Sul',
      'Bigorrilho': 'Equipe Sul',
      'Campo Comprido': 'Equipe Sul',
      'Cajuru': 'Equipe Norte',
      'Boa Vista': 'Equipe Norte',
      'Abranches': 'Equipe Leste',
      'Bacacheri': 'Equipe Leste'
    };

    // Encontrar equipe mais comum
    const teamCount: { [key: string]: number } = {};
    assignedNeighborhoods.forEach(neighborhood => {
      const team = teamMapping[neighborhood] || 'Equipe Geral';
      teamCount[team] = (teamCount[team] || 0) + 1;
    });

    const mostCommonTeam = Object.keys(teamCount).reduce((a, b) => 
      teamCount[a] > teamCount[b] ? a : b, 'Equipe Geral'
    );

    return mostCommonTeam;
  }

  /**
   * Determina status do agente
   */
  private determineStatus(user: IUserWithId, lastActivity: Date): 'active' | 'inactive' | 'leave' {
    if (!user.isActive) return 'leave';
    
    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceActivity <= 7) return 'active';
    if (daysSinceActivity <= 30) return 'inactive';
    return 'leave';
  }

  /**
   * Calcula conquistas do agente
   */
  private calculateAchievements(visits: VisitForm[], completionRate: number, qualityScore: number): string[] {
    const achievements: string[] = [];

    if (completionRate >= 95) achievements.push('Meta de Conclusão');
    if (qualityScore >= 9) achievements.push('Qualidade Excelente');
    if (visits.length >= 50) achievements.push('Alta Produtividade');
    if (visits.length >= 100) achievements.push('Super Produtividade');
    if (completionRate >= 90 && qualityScore >= 8) achievements.push('Performance Completa');

    return achievements;
  }

  /**
   * Obtém metas baseadas no role
   */
  private getTargetsByRole(role: string): { weeklyTarget: number; monthlyTarget: number } {
    switch (role) {
      case 'agent':
        return { weeklyTarget: 35, monthlyTarget: 140 };
      case 'supervisor':
        return { weeklyTarget: 20, monthlyTarget: 80 };
      case 'administrator':
        return { weeklyTarget: 10, monthlyTarget: 40 };
      default:
        return { weeklyTarget: 20, monthlyTarget: 80 };
    }
  }

  /**
   * Calcula resumo por equipe
   */
  private calculateTeamSummary(agents: AgentPerformance[]): TeamSummary[] {
    const teamGroups: { [teamName: string]: AgentPerformance[] } = {};

    agents.forEach(agent => {
      if (!teamGroups[agent.team]) {
        teamGroups[agent.team] = [];
      }
      teamGroups[agent.team].push(agent);
    });

    return Object.keys(teamGroups).map(teamName => {
      const teamAgents = teamGroups[teamName];
      const activeAgents = teamAgents.filter(a => a.status === 'active').length;
      const totalVisits = teamAgents.reduce((sum, agent) => sum + agent.totalVisits, 0);
      const averageQuality = teamAgents.reduce((sum, agent) => sum + agent.qualityScore, 0) / teamAgents.length;
      const completionRate = teamAgents.reduce((sum, agent) => sum + agent.completionRate, 0) / teamAgents.length;
      const targetAchievement = teamAgents.reduce((sum, agent) => sum + (agent.completionRate * 0.9), 0) / teamAgents.length;

      return {
        teamName,
        totalAgents: teamAgents.length,
        activeAgents,
        totalVisits,
        averageQuality: Math.round(averageQuality * 10) / 10,
        completionRate: Math.round(completionRate),
        targetAchievement: Math.round(targetAchievement)
      };
    });
  }

  /**
   * Calcula tendências de visitas (versão simplificada para debug)
   */
  private async calculateVisitTrends(organizationId: string, period: string): Promise<VisitTrend[]> {
    try {
      console.log('📈 Calculando tendências de visitas...');
      
      // Por enquanto, retornar dados mockados para evitar erros
      const trends: VisitTrend[] = [
        { date: '01/01', visits: 0, quality: 0, agents: 0 },
        { date: '02/01', visits: 0, quality: 0, agents: 0 },
        { date: '03/01', visits: 0, quality: 0, agents: 0 },
        { date: '04/01', visits: 0, quality: 0, agents: 0 },
        { date: '05/01', visits: 0, quality: 0, agents: 0 },
        { date: '06/01', visits: 0, quality: 0, agents: 0 },
        { date: '07/01', visits: 0, quality: 0, agents: 0 }
      ];
      
      console.log('✅ Tendências calculadas (versão simplificada)');
      return trends;
    } catch (error) {
      console.error('❌ Erro ao calcular tendências:', error);
      return [];
    }
  }

  /**
   * Obtém data de início do período
   */
  private getPeriodStart(period: string): Date {
    const now = new Date();
    
    switch (period) {
      case 'week':
        return startOfWeek(now, { weekStartsOn: 1 }); // Segunda-feira
      case 'month':
        return startOfMonth(now);
      case 'quarter':
        const quarterStart = new Date(now);
        quarterStart.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
        return quarterStart;
      default:
        return subDays(now, 7);
    }
  }
}

export const operationalService = new OperationalService();
