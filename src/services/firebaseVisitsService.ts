import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  VisitForm, 
  RoutineVisitForm, 
  LIRAAVisitForm, 
  CreateRoutineVisitRequest, 
  CreateLIRAAVisitRequest,
  UpdateVisitRequest
} from '@/types/visits';
import { IUser } from '@/types/organization';

class FirebaseVisitsService {
  private readonly COLLECTION_NAME = 'visits';

  // Criar visita no Firebase
  async createVisit(visit: VisitForm): Promise<string> {
    try {
      const visitData = {
        ...visit,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), visitData);
      console.log('✅ Visita criada no Firebase:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar visita no Firebase:', error);
      throw new Error(`Falha ao salvar visita: ${error}`);
    }
  }

  // Atualizar visita no Firebase
  async updateVisit(visitId: string, updates: UpdateVisitRequest): Promise<void> {
    try {
      const visitRef = doc(db, this.COLLECTION_NAME, visitId);
      await updateDoc(visitRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Visita atualizada no Firebase:', visitId);
    } catch (error) {
      console.error('❌ Erro ao atualizar visita no Firebase:', error);
      throw new Error(`Falha ao atualizar visita: ${error}`);
    }
  }

  // Excluir visita do Firebase
  async deleteVisit(visitId: string): Promise<void> {
    try {
      const visitRef = doc(db, this.COLLECTION_NAME, visitId);
      await deleteDoc(visitRef);
      
      console.log('✅ Visita excluída do Firebase:', visitId);
    } catch (error) {
      console.error('❌ Erro ao excluir visita do Firebase:', error);
      throw new Error(`Falha ao excluir visita: ${error}`);
    }
  }

  // Buscar visitas por organização
  async getVisitsByOrganization(organizationId: string, limitCount: number = 100): Promise<VisitForm[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const visits: VisitForm[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        visits.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as VisitForm);
      });

      console.log(`✅ ${visits.length} visitas carregadas do Firebase`);
      return visits;
    } catch (error) {
      console.error('❌ Erro ao buscar visitas do Firebase:', error);
      throw new Error(`Falha ao carregar visitas: ${error}`);
    }
  }

  // Buscar visitas por agente
  async getVisitsByAgent(agentId: string, limitCount: number = 100): Promise<VisitForm[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('agentId', '==', agentId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const visits: VisitForm[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        visits.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as VisitForm);
      });

      console.log(`✅ ${visits.length} visitas do agente carregadas do Firebase`);
      return visits;
    } catch (error) {
      console.error('❌ Erro ao buscar visitas do agente no Firebase:', error);
      throw new Error(`Falha ao carregar visitas do agente: ${error}`);
    }
  }

  // Buscar visitas por período
  async getVisitsByPeriod(
    organizationId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<VisitForm[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('organizationId', '==', organizationId),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const visits: VisitForm[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        visits.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as VisitForm);
      });

      console.log(`✅ ${visits.length} visitas do período carregadas do Firebase`);
      return visits;
    } catch (error) {
      console.error('❌ Erro ao buscar visitas do período no Firebase:', error);
      throw new Error(`Falha ao carregar visitas do período: ${error}`);
    }
  }

  // Verificar conectividade com Firebase
  async checkConnectivity(): Promise<boolean> {
    try {
      console.log('🔍 Verificando conectividade com Firebase...');
      
      // Tentar uma operação simples para verificar conectividade
      const testQuery = query(collection(db, this.COLLECTION_NAME), limit(1));
      await getDocs(testQuery);
      
      console.log('✅ Firebase está acessível');
      return true;
    } catch (error) {
      console.error('❌ Firebase não está acessível:', error);
      
      // Verificar se é um erro de configuração
      if (error instanceof Error) {
        if (error.message.includes('Firebase')) {
          console.error('🔧 Erro de configuração do Firebase');
        } else if (error.message.includes('permission')) {
          console.error('🚫 Erro de permissão no Firebase');
        } else if (error.message.includes('network')) {
          console.error('🌐 Erro de rede');
        }
      }
      
      return false;
    }
  }
}

export const firebaseVisitsService = new FirebaseVisitsService();
