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
      userId: user.id, // Campo necessário para as regras do Firebase
      organizationId: user.organizationId || '',
      observations: data.observations,
      photos: data.photos || [],
      status: 'completed',
      syncStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      breedingSites: data.breedingSites,
      larvaeFound: data.larvaeFound,
      pupaeFound: data.pupaeFound,
      controlMeasures: data.controlMeasures,
      calculatedRiskLevel: this.calculateRiskLevel(data.breedingSites, data.larvaeFound, data.pupaeFound)
    };

    await this.saveVisitLocally(visit);
    console.log('✅ Visita de rotina criada:', visit.id);
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
      userId: user.id, // Campo necessário para as regras do Firebase
      organizationId: user.organizationId || '',
      observations: data.observations,
      photos: data.photos || [],
      status: 'completed',
      syncStatus: 'pending',
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
      const visit = visits.find(v => v.id === visitId);
      
      if (!visit) {
        throw new Error('Visita não encontrada');
      }

      // Se a visita já foi sincronizada com o Firebase, excluir também de lá
      if (visit.syncStatus === 'synced' && visit.firebaseId) {
        try {
          await firebaseVisitsService.deleteVisit(visit.firebaseId);
          console.log('✅ Visita excluída do Firebase:', visit.firebaseId);
        } catch (firebaseError) {
          console.warn('⚠️ Erro ao excluir do Firebase, mas continuando com exclusão local:', firebaseError);
        }
      }
      
      // Excluir do localStorage
      const updatedVisits = visits.filter(v => v.id !== visitId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedVisits));
      
      // Remover da fila de sincronização
      this.removeFromSyncQueue(visitId);
      
      console.log('✅ Visita excluída localmente:', visitId);
    } catch (error) {
      console.error('❌ Erro ao excluir visita:', error);
      throw error;
    }
  }

  // Sincronizar visitas com o Firebase
  async syncVisits(): Promise<{ success: boolean; synced: number; errors: number; message?: string }> {
    const queue = this.getSyncQueue();
    let synced = 0;
    let errors = 0;

    if (queue.length === 0) {
      return { success: true, synced: 0, errors: 0, message: 'Nenhuma visita pendente para sincronizar' };
    }

    console.log(`🔄 Sincronizando ${queue.length} visitas...`);

    for (const visitId of queue) {
      try {
        const visits = this.getLocalVisits();
        const visit = visits.find(v => v.id === visitId);
        
        if (visit) {
          
          // Marcar como sincronizando
          const syncingVisit = { ...visit, syncStatus: 'syncing' as const };
          this.updateLocalVisit(syncingVisit);
          
          // Tentar salvar no Firebase diretamente
          const firebaseId = await firebaseVisitsService.createVisit(visit);
          
          // Atualizar o ID local com o ID do Firebase e marcar como sincronizada
          const updatedVisit = { 
            ...visit, 
            firebaseId, 
            syncStatus: 'synced' as const,
            updatedAt: new Date()
          };
          this.updateLocalVisit(updatedVisit);
          
          // Remover da fila de sincronização
          this.removeFromSyncQueue(visitId);
          synced++;
          
          console.log(`✅ Visita ${visitId} sincronizada com Firebase: ${firebaseId}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao sincronizar visita ${visitId}:`, error);
        
        // Verificar se é erro de permissão
        const isPermissionError = error instanceof Error && 
          (error.message.includes('permission') || error.message.includes('Permission'));
        
        // Marcar como erro de sincronização
        const visits = this.getLocalVisits();
        const visit = visits.find(v => v.id === visitId);
        if (visit) {
          const errorVisit = { 
            ...visit, 
            syncStatus: 'error' as const,
            syncError: isPermissionError ? 
              'Erro de permissão no Firebase. Verifique as regras de segurança.' :
              (error instanceof Error ? error.message : 'Erro desconhecido'),
            updatedAt: new Date()
          };
          this.updateLocalVisit(errorVisit);
        }
        
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

  // Tentar sincronizar uma visita específica que falhou
  async retrySyncVisit(visitId: string): Promise<boolean> {
    try {
      const visits = this.getLocalVisits();
      const visit = visits.find(v => v.id === visitId);
      
      if (!visit) {
        throw new Error('Visita não encontrada');
      }

      // Verificar conectividade
      const isConnected = await firebaseVisitsService.checkConnectivity();
      if (!isConnected) {
        throw new Error('Sem conexão com o servidor');
      }

      // Marcar como sincronizando
      const syncingVisit = { ...visit, syncStatus: 'syncing' as const };
      this.updateLocalVisit(syncingVisit);

      // Tentar sincronizar
      const firebaseId = await firebaseVisitsService.createVisit(visit);
      
      // Marcar como sincronizada
      const updatedVisit = { 
        ...visit, 
        firebaseId, 
        syncStatus: 'synced' as const,
        syncError: undefined,
        updatedAt: new Date()
      };
      this.updateLocalVisit(updatedVisit);
      
      // Remover da fila se estiver lá
      this.removeFromSyncQueue(visitId);
      
      console.log(`✅ Visita ${visitId} re-sincronizada com sucesso: ${firebaseId}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao re-sincronizar visita ${visitId}:`, error);
      
      // Marcar como erro
      const visits = this.getLocalVisits();
      const visit = visits.find(v => v.id === visitId);
      if (visit) {
        const errorVisit = { 
          ...visit, 
          syncStatus: 'error' as const,
          syncError: error instanceof Error ? error.message : 'Erro desconhecido',
          updatedAt: new Date()
        };
        this.updateLocalVisit(errorVisit);
      }
      
      return false;
    }
  }

  // Limpar dados locais (útil para logout)
  clearLocalData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SYNC_QUEUE_KEY);
  }
}

export const visitsService = new VisitsService();
