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
import { db, auth } from '@/lib/firebase';
import { firebasePhotoService } from './firebasePhotoService';
import logger from '@/lib/logger';
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
  async createVisit(visit: VisitForm): Promise<{ id: string; photos: string[] }> {
    try {
      const photos = visit.photos || [];
      const existingPhotoUrls = photos.filter(photo => photo.startsWith('http'));
      const base64Photos = photos.filter(photo => photo.startsWith('data:'));

      // Primeiro, criar a visita para obter o ID
      const visitData = {
        ...visit,
        photos: existingPhotoUrls,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), visitData);
      logger.log('✅ Visita criada no Firebase:', docRef.id);
      
      // Se há fotos em base64, fazer upload para o Storage
      if (base64Photos.length > 0) {
        try {
          logger.log('📸 Fazendo upload de fotos para o Storage...');
          
          // Converter base64 para File objects
          const photoFiles = await this.convertBase64ToFiles(base64Photos);
          
          // Fazer upload das fotos
          const uploadResults = await firebasePhotoService.uploadPhotos(photoFiles, docRef.id);
          
          // Atualizar a visita com as URLs das fotos
          const photoUrls = uploadResults.map(result => result.url);
          const allPhotoUrls = [
            ...existingPhotoUrls,
            ...photoUrls
          ];
          
          await updateDoc(docRef, {
            photos: allPhotoUrls,
            updatedAt: serverTimestamp()
          });
          
          logger.log('✅ Fotos enviadas para o Storage:', photoUrls.length);
          
          return { id: docRef.id, photos: allPhotoUrls };
        } catch (photoError) {
          logger.error('⚠️ Erro no upload das fotos, mas visita foi salva:', photoError);
          // Não falhar a criação da visita se o upload de fotos falhar
          return { id: docRef.id, photos: existingPhotoUrls };
        }
      }
      
      return { id: docRef.id, photos: existingPhotoUrls };
    } catch (error) {
      logger.error('❌ Erro ao sincronizar visita:', error);
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
      
      logger.log('✅ Visita atualizada no Firebase:', visitId);
    } catch (error) {
      logger.error('❌ Erro ao atualizar visita no Firebase:', error);
      throw new Error(`Falha ao atualizar visita: ${error}`);
    }
  }

  // Excluir visita do Firebase
  async deleteVisit(visitId: string): Promise<void> {
    try {
      const visitRef = doc(db, this.COLLECTION_NAME, visitId);
      await deleteDoc(visitRef);
      
      logger.log('✅ Visita excluída do Firebase:', visitId);
    } catch (error) {
      logger.error('❌ Erro ao excluir visita do Firebase:', error);
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

      logger.log(`✅ ${visits.length} visitas carregadas do Firebase`);
      return visits;
    } catch (error) {
      logger.error('❌ Erro ao buscar visitas do Firebase:', error);
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

      logger.log(`✅ ${visits.length} visitas do agente carregadas do Firebase`);
      return visits;
    } catch (error) {
      logger.error('❌ Erro ao buscar visitas do agente no Firebase:', error);
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

      logger.log(`✅ ${visits.length} visitas do período carregadas do Firebase`);
      return visits;
    } catch (error) {
      logger.error('❌ Erro ao buscar visitas do período no Firebase:', error);
      throw new Error(`Falha ao carregar visitas do período: ${error}`);
    }
  }

  // Verificar conectividade com Firebase
  async checkConnectivity(): Promise<boolean> {
    try {
      const testQuery = query(collection(db, this.COLLECTION_NAME), limit(1));
      await getDocs(testQuery);
      return true;
    } catch (error) {
      logger.warn('Firebase offline:', (error as Error).message);
      return false;
    }
  }

  // Converter base64 para File objects
  private async convertBase64ToFiles(base64Photos: string[]): Promise<File[]> {
    return Promise.all(
      base64Photos.map(async (base64, index) => {
        // Extrair o tipo MIME e os dados
        const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new Error('Formato base64 inválido');
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        
        // Converter base64 para blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        
        // Criar File object
        const fileName = `visita-foto-${index + 1}-${Date.now()}.${mimeType.split('/')[1]}`;
        return new File([blob], fileName, { type: mimeType });
      })
    );
  }
}

export const firebaseVisitsService = new FirebaseVisitsService();
