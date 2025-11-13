'use client';

import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { ResendEmailService } from './resendEmailService';
import logger from '@/lib/logger';
// Remover import do crypto - usaremos Math.random para ambiente cliente

export interface IUserInvite {
  id?: string;
  email: string;
  name: string;
  role: 'administrator' | 'supervisor' | 'agent';
  organizationId: string;
  organizationName: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedBy: string;
  invitedByName: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

export interface ICreateInviteData {
  email: string;
  name: string;
  role: 'administrator' | 'supervisor' | 'agent';
  organizationId: string;
  organizationName: string;
  invitedByName: string;
  assignedNeighborhoods?: string[];
}

export class UserInviteService {
  private static readonly COLLECTION_NAME = 'user_invites';
  private static readonly TOKEN_EXPIRY_DAYS = 7; // 7 dias para aceitar

  /**
   * Gera token seguro para convite (compatível com browser)
   */
  private static generateSecureToken(): string {
    // Usar Web Crypto API se disponível, senão fallback para Math.random
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback usando Math.random (menos seguro mas funcional)
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  /**
   * Calcula data de expiração
   */
  private static getExpiryDate(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + this.TOKEN_EXPIRY_DAYS);
    return expiry;
  }

  /**
   * Cria um novo convite
   */
  static async createInvite(inviteData: ICreateInviteData, invitedByUserId: string): Promise<IUserInvite> {
    try {
      logger.log('📧 Criando convite para:', inviteData.email);

      // VALIDAÇÃO: Verificar se já existe convite pendente para este email nesta organização
      const existingInvite = await this.findPendingInvite(inviteData.email, inviteData.organizationId);
      if (existingInvite) {
        throw new Error(`Já existe um convite pendente para ${inviteData.email} nesta organização.`);
      }

      const token = this.generateSecureToken();
      const expiresAt = this.getExpiryDate();

      const firestoreInviteData = {
        email: inviteData.email,
        name: inviteData.name,
        role: inviteData.role,
        organizationId: inviteData.organizationId,
        organizationName: inviteData.organizationName,
        token,
        status: 'pending' as const,
        invitedBy: invitedByUserId,
        invitedByName: inviteData.invitedByName,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt)
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), firestoreInviteData);
      
      // Enviar email de convite
      await this.sendInviteEmail({
        ...inviteData,
        token,
        expiresAt
      });

      logger.log('✅ Convite criado com sucesso:', docRef.id);

      return {
        id: docRef.id,
        ...inviteData,
        token,
        status: 'pending',
        invitedBy: invitedByUserId,
        createdAt: new Date(),
        expiresAt
      };
    } catch (error: any) {
      logger.error('❌ Erro ao criar convite:', error);
      throw new Error(`Erro ao criar convite: ${error.message}`);
    }
  }

  /**
   * Busca convite por token
   */
  static async getInviteByToken(token: string): Promise<IUserInvite | null> {
    try {
      logger.log('🔍 Buscando convite por token:', token);
      
      // Primeiro, buscar qualquer convite com este token (sem filtro de status)
      const debugQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('token', '==', token)
      );
      
      const debugSnapshot = await getDocs(debugQuery);
      logger.log('🐛 Convites encontrados (qualquer status):', debugSnapshot.size);
      
      if (!debugSnapshot.empty) {
        debugSnapshot.forEach(doc => {
          const data = doc.data();
          logger.log('🐛 Convite encontrado:', {
            id: doc.id,
            email: data.email,
            status: data.status,
            expiresAt: data.expiresAt?.toDate(),
            now: new Date()
          });
        });
      }
      
      // Agora a busca normal apenas com status pending
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('token', '==', token),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        logger.log('❌ Nenhum convite pendente encontrado para este token');
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      // Verificar se não expirou
      const now = new Date();
      const expiresAt = data.expiresAt.toDate();
      
      if (now > expiresAt) {
        // Marcar como expirado
        await this.markAsExpired(doc.id);
        return null;
      }

      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        token: data.token,
        status: data.status,
        invitedBy: data.invitedBy,
        invitedByName: data.invitedByName,
        createdAt: data.createdAt.toDate(),
        expiresAt: data.expiresAt.toDate(),
        acceptedAt: data.acceptedAt?.toDate()
      };
    } catch (error) {
      logger.error('❌ Erro ao buscar convite:', error);
      return null;
    }
  }

  /**
   * Busca convite pendente por email e organização
   */
  private static async findPendingInvite(email: string, organizationId: string): Promise<IUserInvite | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('email', '==', email),
        where('organizationId', '==', organizationId),
        where('status', '==', 'pending')
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
        name: data.name,
        role: data.role,
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        token: data.token,
        status: data.status,
        invitedBy: data.invitedBy,
        invitedByName: data.invitedByName,
        createdAt: data.createdAt.toDate(),
        expiresAt: data.expiresAt.toDate()
      };
    } catch (error) {
      logger.error('❌ Erro ao buscar convite pendente:', error);
      return null;
    }
  }

  /**
   * Marca convite como aceito
   */
  static async markAsAccepted(inviteId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTION_NAME, inviteId), {
        status: 'accepted',
        acceptedAt: Timestamp.now()
      });
      logger.log('✅ Convite marcado como aceito:', inviteId);
    } catch (error) {
      logger.error('❌ Erro ao marcar convite como aceito:', error);
      throw error;
    }
  }

  /**
   * Marca convite como expirado
   */
  private static async markAsExpired(inviteId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTION_NAME, inviteId), {
        status: 'expired'
      });
      logger.log('⏰ Convite marcado como expirado:', inviteId);
    } catch (error) {
      logger.error('❌ Erro ao marcar convite como expirado:', error);
    }
  }

  /**
   * Lista convites de uma organização
   */
  static async listInvitesByOrganization(organizationId: string): Promise<IUserInvite[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          organizationId: data.organizationId,
          organizationName: data.organizationName,
          token: data.token,
          status: data.status,
          invitedBy: data.invitedBy,
          invitedByName: data.invitedByName,
          createdAt: data.createdAt.toDate(),
          expiresAt: data.expiresAt.toDate(),
          acceptedAt: data.acceptedAt?.toDate()
        };
      });
    } catch (error) {
      logger.error('❌ Erro ao listar convites:', error);
      return [];
    }
  }

  /**
   * Envia email de convite usando Resend
   */
  private static async sendInviteEmail(data: ICreateInviteData & { token: string; expiresAt: Date }): Promise<void> {
    try {
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/complete-signup?token=${data.token}`;
      
      // Dados para o email
      const emailData = {
        toEmail: data.email,
        toName: data.name,
        organizationName: data.organizationName,
        invitedByName: data.invitedByName,
        role: data.role,
        inviteUrl,
        expiresAt: data.expiresAt
      };

      try {
        // Enviar email via Resend
        await ResendEmailService.sendInviteEmail(emailData);
        
        logger.log('✅ EMAIL ENVIADO VIA RESEND:');
        logger.log(`Para: ${data.email}`);
        logger.log(`Organização: ${data.organizationName}`);
        logger.log(`Link: ${inviteUrl}`);
        
      } catch (resendError: any) {
        // Se Resend falhar, usar método de console como fallback
        logger.warn('⚠️ Resend não configurado ou falhou, usando simulação:', resendError);
        
        logger.log('📧 EMAIL DE CONVITE (SIMULADO - Configure Resend):');
        logger.log('═══════════════════════════════════════════════');
        logger.log(`Para: ${data.email}`);
        logger.log(`Assunto: Convite para ${data.organizationName} - Sistema EntomoVigilância`);
        logger.log('');
        logger.log(`🎯 LINK DO CONVITE (COPIE E COLE NO NAVEGADOR):`);
        logger.log(`${inviteUrl}`);
        logger.log('');
        logger.log(`👤 Convidado por: ${data.invitedByName}`);
        logger.log(`🏢 Organização: ${data.organizationName}`);
        logger.log(`👔 Cargo: ${this.getRoleDisplayName(data.role)}`);
        logger.log(`⏰ Expira em: ${data.expiresAt.toLocaleDateString('pt-BR')}`);
        logger.log('═══════════════════════════════════════════════');
        logger.log('💡 Para ativar emails reais, configure RESEND_API_KEY no .env.local');
        logger.log('💡 Obtenha sua chave em: https://resend.com/api-keys');
        
        // Re-throw o erro para que o componente possa exibir mensagem ao usuário
        throw resendError;
      }
      
    } catch (error) {
      logger.error('❌ Erro geral ao enviar email:', error);
      throw error;
    }
  }

  /**
   * Helper para nome amigável do cargo
   */
  private static getRoleDisplayName(role: string): string {
    const roles = {
      'administrator': 'Administrador',
      'supervisor': 'Supervisor',
      'agent': 'Agente de Campo'
    };
    return roles[role as keyof typeof roles] || role;
  }

  /**
   * Cancela um convite
   */
  static async cancelInvite(inviteId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTION_NAME, inviteId), {
        status: 'cancelled'
      });
      logger.log('🚫 Convite cancelado:', inviteId);
    } catch (error) {
      logger.error('❌ Erro ao cancelar convite:', error);
      throw error;
    }
  }

  /**
   * Reenvia convite (gera novo token e envia novo email)
   */
  static async resendInvite(inviteId: string): Promise<void> {
    try {
      logger.log('🔄 Reenviando convite:', inviteId);
      
      // 1. Buscar dados do convite atual
      const inviteDoc = await getDoc(doc(db, this.COLLECTION_NAME, inviteId));
      if (!inviteDoc.exists()) {
        throw new Error('Convite não encontrado');
      }
      
      const inviteData = inviteDoc.data();
      
      // 2. Gerar novo token e nova data de expiração
      const newToken = this.generateSecureToken();
      const newExpiresAt = this.getExpiryDate();
      
      // 3. Atualizar convite no banco
      await updateDoc(doc(db, this.COLLECTION_NAME, inviteId), {
        token: newToken,
        expiresAt: Timestamp.fromDate(newExpiresAt),
        status: 'pending',
        updatedAt: Timestamp.now()
      });
      
      logger.log('✅ Token atualizado no banco');
      
      // 4. Enviar novo email com novo token
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/complete-signup?token=${newToken}`;
      
      await this.sendInviteEmail({
        email: inviteData.email,
        name: inviteData.name,
        organizationId: inviteData.organizationId,
        organizationName: inviteData.organizationName,
        invitedByName: inviteData.invitedByName,
        role: inviteData.role,
        token: newToken,
        expiresAt: newExpiresAt
      });
      
      logger.log('✅ Novo email enviado com sucesso');
      
    } catch (error) {
      logger.error('❌ Erro ao reenviar convite:', error);
      throw error;
    }
  }
}
