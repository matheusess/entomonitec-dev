import { 
  VisitForm, 
  RoutineVisitForm, 
  LIRAAVisitForm, 
  CreateRoutineVisitRequest, 
  CreateLIRAAVisitRequest,
  UpdateVisitRequest,
  VisitResponse,
  VisitsListResponse
} from '@/types/visits';
import { IUser } from '@/types/organization';
import { firebaseVisitsService } from './firebaseVisitsService';

class VisitsService {
  private readonly STORAGE_KEY = 'entomonitec_visits';
  private readonly SYNC_QUEUE_KEY = 'entomonitec_sync_queue';

  // Salvar visita localmente (offline)
  async saveVisitLocally(visit: VisitForm): Promise<void> {
    try {
      const existingVisits = this.getLocalVisits();
      const updatedVisits = [visit, ...existingVisits];
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedVisits));
      
      // Adicionar à fila de sincronização
      this.addToSyncQueue(visit.id);
      
      console.log('Visita salva localmente:', visit.id);
    } catch (error) {
      console.error('Erro ao salvar visita localmente:', error);
      throw error;
    }
  }

  // Obter visitas salvas localmente
  getLocalVisits(): VisitForm[] {
    try {
      const visits = localStorage.getItem(this.STORAGE_KEY);
      return visits ? JSON.parse(visits) : [];
    } catch (error) {
      console.error('Erro ao obter visitas locais:', error);
      return [];
    }
  }

  // Adicionar à fila de sincronização
  private addToSyncQueue(visitId: string): void {
    try {
      const queue = this.getSyncQueue();
      if (!queue.includes(visitId)) {
        queue.push(visitId);
        localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Erro ao adicionar à fila de sincronização:', error);
    }
  }

  // Obter fila de sincronização
  getSyncQueue(): string[] {
    try {
      const queue = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Erro ao obter fila de sincronização:', error);
      return [];
    }
  }

  // Remover da fila de sincronização
  private removeFromSyncQueue(visitId: string): void {
    try {
      const queue = this.getSyncQueue();
      const updatedQueue = queue.filter(id => id !== visitId);
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Erro ao remover da fila de sincronização:', error);
    }
  }

  // Criar visita de rotina
  async createRoutineVisit(data: CreateRoutineVisitRequest, user: IUser): Promise<RoutineVisitForm> {
    const visit: RoutineVisitForm = {
      id: this.generateId(),
      type: 'routine',
      timestamp: new Date(),
      location: data.location,
      neighborhood: data.neighborhood,
      agentName: user.name,
      agentId: user.id,
      organizationId: user.organizationId || '',
      observations: data.observations,
      photos: [],
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      breedingSites: data.breedingSites,
      larvaeFound: data.larvaeFound,
      pupaeFound: data.pupaeFound,
      controlMeasures: data.controlMeasures,
      calculatedRiskLevel: this.calculateRiskLevel(data.breedingSites, data.larvaeFound, data.pupaeFound)
    };

    await this.saveVisitLocally(visit);
    return visit;
  }

  // Criar visita LIRAa
  async createLIRAAVisit(data: CreateLIRAAVisitRequest, user: IUser): Promise<LIRAAVisitForm> {
    const visit: LIRAAVisitForm = {
      id: this.generateId(),
      type: 'liraa',
      timestamp: new Date(),
      location: data.location,
      neighborhood: data.neighborhood,
      agentName: user.name,
      agentId: user.id,
      organizationId: user.organizationId || '',
      observations: data.observations,
      photos: [],
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
      propertyType: data.propertyType,
      inspected: data.inspected,
      refused: data.refused,
      closed: data.closed,
      containers: data.containers,
      positiveContainers: data.positiveContainers,
      larvaeSpecies: data.larvaeSpecies,
      treatmentApplied: data.treatmentApplied,
      eliminationAction: data.eliminationAction,
      liraaIndex: this.calculateLIRAaIndex(data.containers, data.positiveContainers)
    };

    await this.saveVisitLocally(visit);
    return visit;
  }

  // Atualizar visita local
  private updateLocalVisit(updatedVisit: VisitForm): void {
    try {
      const visits = this.getLocalVisits();
      const visitIndex = visits.findIndex(v => v.id === updatedVisit.id);
      
      if (visitIndex !== -1) {
        visits[visitIndex] = updatedVisit;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(visits));
      }
    } catch (error) {
      console.error('Erro ao atualizar visita local:', error);
    }
  }

  // Atualizar visita
  async updateVisit(visitId: string, updates: UpdateVisitRequest): Promise<VisitForm | null> {
    try {
      const visits = this.getLocalVisits();
      const visitIndex = visits.findIndex(v => v.id === visitId);
      
      if (visitIndex === -1) {
        throw new Error('Visita não encontrada');
      }

      const updatedVisit = {
        ...visits[visitIndex],
        ...updates,
        updatedAt: new Date()
      };

      visits[visitIndex] = updatedVisit;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(visits));
      
      // Adicionar à fila de sincronização
      this.addToSyncQueue(visitId);
      
      return updatedVisit;
    } catch (error) {
      console.error('Erro ao atualizar visita:', error);
      throw error;
    }
  }

  // Excluir visita
  async deleteVisit(visitId: string): Promise<void> {
    try {
      const visits = this.getLocalVisits();
      const updatedVisits = visits.filter(v => v.id !== visitId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedVisits));
      
      // Remover da fila de sincronização
      this.removeFromSyncQueue(visitId);
      
      console.log('Visita excluída:', visitId);
    } catch (error) {
      console.error('Erro ao excluir visita:', error);
      throw error;
    }
  }

  // Sincronizar visitas com o Firebase
  async syncVisits(): Promise<{ success: boolean; synced: number; errors: number }> {
    const queue = this.getSyncQueue();
    let synced = 0;
    let errors = 0;

    // Verificar conectividade com Firebase
    const isConnected = await firebaseVisitsService.checkConnectivity();
    if (!isConnected) {
      console.warn('⚠️ Firebase não está acessível, mantendo visitas na fila local');
      return { success: false, synced: 0, errors: queue.length };
    }

    for (const visitId of queue) {
      try {
        const visits = this.getLocalVisits();
        const visit = visits.find(v => v.id === visitId);
        
        if (visit) {
          // Salvar no Firebase
          const firebaseId = await firebaseVisitsService.createVisit(visit);
          
          // Atualizar o ID local com o ID do Firebase
          const updatedVisit = { ...visit, firebaseId };
          this.updateLocalVisit(updatedVisit);
          
          // Remover da fila de sincronização
          this.removeFromSyncQueue(visitId);
          synced++;
          
          console.log(`✅ Visita ${visitId} sincronizada com Firebase: ${firebaseId}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao sincronizar visita ${visitId}:`, error);
        errors++;
      }
    }

    return { success: errors === 0, synced, errors };
  }

  // Calcular nível de risco para visitas de rotina
  private calculateRiskLevel(
    breedingSites: any, 
    larvaeFound: boolean, 
    pupaeFound: boolean
  ): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;
    
    // Pontos por tipo de criadouro
    const breedingSiteScores = {
      waterReservoir: 3,
      tires: 2,
      bottles: 1,
      cans: 1,
      buckets: 2,
      plantPots: 1,
      gutters: 2,
      pools: 4,
      wells: 3,
      tanks: 2,
      drains: 1
    };

    // Calcular pontuação dos criadouros
    Object.entries(breedingSites).forEach(([key, value]) => {
      if (key !== 'others' && value && breedingSiteScores[key as keyof typeof breedingSiteScores]) {
        riskScore += breedingSiteScores[key as keyof typeof breedingSiteScores];
      }
    });

    // Pontos adicionais por presença de larvas/pupas
    if (larvaeFound) riskScore += 2;
    if (pupaeFound) riskScore += 3;

    // Classificar risco
    if (riskScore >= 8) return 'critical';
    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  // Calcular índice LIRAa
  private calculateLIRAaIndex(
    containers: any, 
    positiveContainers: any
  ): number {
    const totalContainers = Object.values(containers).reduce((sum: number, count: any) => sum + count, 0);
    const totalPositive = Object.values(positiveContainers).reduce((sum: number, count: any) => sum + count, 0);
    
    if (totalContainers === 0) return 0;
    
    return (totalPositive / totalContainers) * 100;
  }

  // Gerar ID único
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Obter estatísticas das visitas
  getVisitStats(): {
    total: number;
    routine: number;
    liraa: number;
    pendingSync: number;
  } {
    const visits = this.getLocalVisits();
    const queue = this.getSyncQueue();
    
    return {
      total: visits.length,
      routine: visits.filter(v => v.type === 'routine').length,
      liraa: visits.filter(v => v.type === 'liraa').length,
      pendingSync: queue.length
    };
  }

  // Limpar dados locais (útil para logout)
  clearLocalData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SYNC_QUEUE_KEY);
  }
}

export const visitsService = new VisitsService();
