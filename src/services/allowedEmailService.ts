'use client';

import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc
} from 'firebase/firestore';

export interface IAllowedEmail {
  id?: string;
  email: string;
  organizationId: string;
  organizationName: string;
  allowedRoles: ('administrator' | 'supervisor' | 'agent')[];
  addedBy: string;
  addedByName: string;
  createdAt: Date;
  isActive: boolean;
  notes?: string;
}

export interface ICreateAllowedEmailData {
  email: string;
  organizationId: string;
  organizationName: string;
  allowedRoles: ('administrator' | 'supervisor' | 'agent')[];
  addedByName: string;
  notes?: string;
}

export class AllowedEmailService {
  private static readonly COLLECTION_NAME = 'allowed_emails';

  /**
   * Adiciona email à whitelist de uma organização
   */
  static async addAllowedEmail(emailData: ICreateAllowedEmailData, addedByUserId: string): Promise<IAllowedEmail> {
    try {
      console.log('➕ Adicionando email à whitelist:', emailData.email);

      // Verificar se já existe
      const existing = await this.findByEmail(emailData.email, emailData.organizationId);
      if (existing) {
        throw new Error(`Email ${emailData.email} já está na lista de emails permitidos desta organização.`);
      }

      const firestoreData = {
        email: emailData.email.toLowerCase().trim(),
        organizationId: emailData.organizationId,
        organizationName: emailData.organizationName,
        allowedRoles: emailData.allowedRoles,
        addedBy: addedByUserId,
        addedByName: emailData.addedByName,
        createdAt: Timestamp.now(),
        isActive: true,
        notes: emailData.notes || ''
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), firestoreData);
      
      console.log('✅ Email adicionado à whitelist:', docRef.id);

      return {
        id: docRef.id,
        ...emailData,
        email: emailData.email.toLowerCase().trim(),
        addedBy: addedByUserId,
        createdAt: new Date(),
        isActive: true
      };
    } catch (error: any) {
      console.error('❌ Erro ao adicionar email à whitelist:', error);
      throw new Error(`Erro ao adicionar email: ${error.message}`);
    }
  }

  /**
   * Lista emails permitidos de uma organização
   */
  static async listByOrganization(organizationId: string): Promise<IAllowedEmail[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('organizationId', '==', organizationId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          organizationId: data.organizationId,
          organizationName: data.organizationName,
          allowedRoles: data.allowedRoles,
          addedBy: data.addedBy,
          addedByName: data.addedByName,
          createdAt: data.createdAt.toDate(),
          isActive: data.isActive,
          notes: data.notes
        };
      });
    } catch (error) {
      console.error('❌ Erro ao listar emails permitidos:', error);
      return [];
    }
  }

  /**
   * Verifica se email está permitido para uma organização
   */
  static async isEmailAllowed(email: string, organizationId: string): Promise<boolean> {
    try {
      const allowedEmail = await this.findByEmail(email, organizationId);
      return allowedEmail !== null && allowedEmail.isActive;
    } catch (error) {
      console.error('❌ Erro ao verificar email permitido:', error);
      return false;
    }
  }

  /**
   * Busca email específico na whitelist
   */
  private static async findByEmail(email: string, organizationId: string): Promise<IAllowedEmail | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('email', '==', email.toLowerCase().trim()),
        where('organizationId', '==', organizationId),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        email: data.email,
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        allowedRoles: data.allowedRoles,
        addedBy: data.addedBy,
        addedByName: data.addedByName,
        createdAt: data.createdAt.toDate(),
        isActive: data.isActive,
        notes: data.notes
      };
    } catch (error) {
      console.error('❌ Erro ao buscar email:', error);
      return null;
    }
  }

  /**
   * Remove email da whitelist
   */
  static async removeAllowedEmail(emailId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, emailId));
      console.log('🗑️ Email removido da whitelist:', emailId);
    } catch (error) {
      console.error('❌ Erro ao remover email:', error);
      throw error;
    }
  }

  /**
   * Obtém roles permitidos para um email
   */
  static async getAllowedRoles(email: string, organizationId: string): Promise<string[]> {
    try {
      const allowedEmail = await this.findByEmail(email, organizationId);
      return allowedEmail ? allowedEmail.allowedRoles : [];
    } catch (error) {
      console.error('❌ Erro ao obter roles permitidos:', error);
      return [];
    }
  }

  /**
   * Lista todos os emails permitidos (Super Admin only)
   */
  static async listAllAllowedEmails(): Promise<IAllowedEmail[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          organizationId: data.organizationId,
          organizationName: data.organizationName,
          allowedRoles: data.allowedRoles,
          addedBy: data.addedBy,
          addedByName: data.addedByName,
          createdAt: data.createdAt.toDate(),
          isActive: data.isActive,
          notes: data.notes
        };
      });
    } catch (error) {
      console.error('❌ Erro ao listar todos os emails:', error);
      return [];
    }
  }
}
