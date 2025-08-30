import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

export interface ICreateUserData {
  name: string;
  email: string;
  role: 'administrator' | 'supervisor' | 'agent';
  organizationId: string;
}

export interface IUpdateUserData {
  name?: string;
  email?: string;
  role?: 'administrator' | 'supervisor' | 'agent';
  isActive?: boolean;
}

export interface IUserWithId {
  id: string;
  name: string;
  email: string;
  role: 'administrator' | 'supervisor' | 'agent' | 'super_admin';
  organizationId: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  mustChangePassword?: boolean;
  lastLoginAt?: Date;
}

export class UserService {
  private static readonly COLLECTION_NAME = 'users';
  
  // TEMPORÁRIO: Removendo instância secundária por questões de compatibilidade
  // TODO: Implementar solução server-side para criação de usuários

  /**
   * Lista usuários de uma organização
   */
  static async listUsersByOrganization(organizationId: string): Promise<IUserWithId[]> {
    try {
      console.log('👥 Carregando usuários da organização:', organizationId);
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('organizationId', '==', organizationId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const users: IUserWithId[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
          organizationId: data.organizationId,
          permissions: data.permissions || [],
          isActive: data.isActive ?? true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          mustChangePassword: data.mustChangePassword,
          lastLoginAt: data.lastLoginAt?.toDate()
        });
      });

      console.log('✅ Usuários carregados:', users.length);
      return users;
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      throw new Error('Falha ao carregar usuários');
    }
  }

  /**
   * Lista todos os usuários (apenas para Super Admin)
   */
  static async listAllUsers(): Promise<IUserWithId[]> {
    try {
      console.log('👥 Carregando todos os usuários (Super Admin)');
      
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const users: IUserWithId[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
          organizationId: data.organizationId || '',
          permissions: data.permissions || [],
          isActive: data.isActive ?? true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          mustChangePassword: data.mustChangePassword,
          lastLoginAt: data.lastLoginAt?.toDate()
        });
      });

      console.log('✅ Todos os usuários carregados:', users.length);
      return users;
    } catch (error) {
      console.error('❌ Erro ao listar todos os usuários:', error);
      throw new Error('Falha ao carregar usuários');
    }
  }

  /**
   * DEPRECATED: Criação direta de usuários foi substituída pelo sistema de convites
   * Use UserInviteService.createInvite() ao invés deste método
   */
  static async createUser(userData: ICreateUserData, createdByUserId: string): Promise<IUserWithId> {
    console.warn('🚨 MÉTODO DEPRECADO: Use UserInviteService.createInvite() ao invés de UserService.createUser()');
    throw new Error('Método createUser foi descontinuado. Use o sistema de convites por email.');
  }

  /**
   * Cria usuário a partir de convite aceito (apenas para /complete-signup)
   * Este método é seguro porque o usuário já está autenticado
   */
  static async createUserFromInvite(
    firebaseUID: string, 
    userData: {
      name: string;
      email: string;
      role: 'administrator' | 'supervisor' | 'agent';
      organizationId: string;
      createdBy: string;
    }
  ): Promise<void> {
    try {
      console.log('📝 Criando documento de usuário a partir de convite aceito');

      const permissions = this.getPermissionsByRole(userData.role);

      const firestoreUserData = {
        uid: firebaseUID,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        organizationId: userData.organizationId,
        permissions,
        isActive: true,
        mustChangePassword: false, // Usuário já definiu senha
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userData.createdBy,
        authProvider: 'email',
        inviteAcceptedAt: Timestamp.now()
      };

      await setDoc(doc(db, this.COLLECTION_NAME, firebaseUID), firestoreUserData);
      console.log('✅ Documento de usuário criado no Firestore:', firebaseUID);
    } catch (error) {
      console.error('❌ Erro ao criar documento de usuário:', error);
      throw error;
    }
  }

  /**
   * Busca um usuário por ID
   */
  static async getUser(userId: string): Promise<IUserWithId | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        email: data.email,
        role: data.role,
        organizationId: data.organizationId,
        permissions: data.permissions || [],
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        mustChangePassword: data.mustChangePassword,
        lastLoginAt: data.lastLoginAt?.toDate()
      };
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      return null;
    }
  }

  /**
   * Atualiza um usuário
   */
  static async updateUser(userId: string, updateData: IUpdateUserData): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      
      const updatePayload: any = {
        ...updateData,
        updatedAt: Timestamp.now()
      };

      // Se mudou o role, atualizar permissões
      if (updateData.role) {
        updatePayload.permissions = this.getPermissionsByRole(updateData.role);
      }

      await updateDoc(docRef, updatePayload);
      
      console.log('✅ Usuário atualizado:', userId);
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      throw new Error('Falha ao atualizar usuário');
    }
  }

  /**
   * Desativa um usuário (soft delete)
   */
  static async deactivateUser(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Usuário desativado:', userId);
    } catch (error) {
      console.error('❌ Erro ao desativar usuário:', error);
      throw new Error('Falha ao desativar usuário');
    }
  }

  /**
   * Remove um usuário permanentemente
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      await deleteDoc(docRef);
      
      console.log('✅ Usuário removido:', userId);
    } catch (error) {
      console.error('❌ Erro ao remover usuário:', error);
      throw new Error('Falha ao remover usuário');
    }
  }

  /**
   * Reativa um usuário
   */
  static async reactivateUser(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        isActive: true,
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Usuário reativado:', userId);
    } catch (error) {
      console.error('❌ Erro ao reativar usuário:', error);
      throw new Error('Falha ao reativar usuário');
    }
  }

  /**
   * Envia email para redefinir senha
   */
  static async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Email de redefinição enviado para:', email);
    } catch (error) {
      console.error('❌ Erro ao enviar email de redefinição:', error);
      throw new Error('Falha ao enviar email de redefinição');
    }
  }

  /**
   * Retorna permissões baseadas no role
   */
  private static getPermissionsByRole(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'administrator': [
        'users:read', 'users:create', 'users:update', 'users:delete',
        'visits:read', 'visits:create', 'visits:update', 'visits:delete',
        'collections:read', 'collections:create', 'collections:update', 'collections:delete',
        'reports:read', 'reports:create', 'reports:update',
        'settings:read', 'settings:update'
      ],
      'supervisor': [
        'users:read', 'users:create', 'users:update',
        'visits:read', 'visits:create', 'visits:update',
        'collections:read', 'collections:create', 'collections:update',
        'reports:read', 'reports:create'
      ],
      'agent': [
        'visits:read', 'visits:create', 'visits:update',
        'collections:read', 'collections:create'
      ]
    };

    return rolePermissions[role] || [];
  }

  /**
   * Verifica se usuário tem permissão
   */
  static hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    return userPermissions.includes('*') || userPermissions.includes(requiredPermission);
  }

  /**
   * Retorna nome amigável do role
   */
  static getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      'super_admin': 'Super Administrador',
      'administrator': 'Administrador',
      'supervisor': 'Supervisor',
      'agent': 'Agente de Campo'
    };

    return roleNames[role] || role;
  }

  /**
   * Retorna cor do badge baseada no role
   */
  static getRoleColor(role: string): string {
    const roleColors: Record<string, string> = {
      'super_admin': 'bg-purple-100 text-purple-800 border-purple-200',
      'administrator': 'bg-blue-100 text-blue-800 border-blue-200',
      'supervisor': 'bg-green-100 text-green-800 border-green-200',
      'agent': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
