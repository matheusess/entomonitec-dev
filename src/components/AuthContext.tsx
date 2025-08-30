import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { IUser, IOrganization } from '@/types/organization';
import { OrganizationService } from '@/services/organizationService';
import { toast } from '@/hooks/use-toast';
import { mockUsers, mockOrganizations, mockUserToUser, getOrganizationById } from '@/lib/mockAuth';

export type UserRole = 'agent' | 'supervisor' | 'administrator' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  organization?: IOrganization;
  permissions: string[];
  isSuperAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  availableOrganizations: IOrganization[];
  switchOrganization: (orgId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableOrganizations, setAvailableOrganizations] = useState<IOrganization[]>([]);

  // Carrega dados do usuário do Firestore
  const loadUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    console.log('🔍 loadUserData iniciado para:', firebaseUser.email);
    
    try {
      console.log('📡 Buscando no Firestore - UID:', firebaseUser.uid);
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      console.log('📄 Documento existe no Firestore:', userSnap.exists());
      
      if (!userSnap.exists()) {
        console.warn('Usuário não encontrado no Firestore, usando dados mockados como fallback');
        
        // Fallback para dados mockados
        const mockUser = mockUsers[firebaseUser.email || ''];
        if (mockUser) {
          console.log('✅ Usando dados mockados para:', firebaseUser.email);
          
          // Se for super admin, carregar todas as organizações mockadas
          if (mockUser.isSuperAdmin) {
            setAvailableOrganizations(mockOrganizations);
          }
          
          return mockUserToUser(mockUser);
        }
        
        console.error('Usuário não encontrado nem no Firestore nem nos dados mockados');
        console.log('🔧 Criando usuário padrão para:', firebaseUser.email);
        
        // Verificar se é super admin pelo email
        const isSuperAdmin = OrganizationService.isSuperAdmin(firebaseUser.email || '');
        
        // Criar usuário padrão para evitar loops
        const defaultUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          email: firebaseUser.email || '',
          role: isSuperAdmin ? 'super_admin' : 'agent',
          organizationId: isSuperAdmin ? '' : 'fazenda-rio-grande-pr', // Super admin não tem org específica
          organization: isSuperAdmin ? undefined : mockOrganizations[0],
          permissions: isSuperAdmin ? ['*'] : ['visits:create', 'visits:view_own', 'collections:create', 'collections:view_own'],
          isSuperAdmin
        };
        
        return defaultUser;
      }

      const userData = userSnap.data() as IUser;
      const isSuperAdmin = OrganizationService.isSuperAdmin(userData.email);
      
      // Carregar dados da organização
      let organization: IOrganization | undefined;
      if (!isSuperAdmin && userData.organizationId) {
        organization = await OrganizationService.getOrganization(userData.organizationId) || undefined;
      }

      // Se for super admin, carregar todas as organizações
      if (isSuperAdmin) {
        const allOrgs = await OrganizationService.listOrganizations();
        setAvailableOrganizations(allOrgs);
      }

      return {
        id: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        role: isSuperAdmin ? 'super_admin' : userData.role,
        organizationId: userData.organizationId,
        organization,
        permissions: userData.permissions,
        isSuperAdmin
      };
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      
      // Em caso de erro, tentar dados mockados como último recurso
      const mockUser = mockUsers[firebaseUser.email || ''];
      if (mockUser) {
        console.log('🔄 Erro no Firebase, usando dados mockados para:', firebaseUser.email);
        return mockUserToUser(mockUser);
      }
      
      console.log('🔧 Erro no Firebase, criando usuário padrão para:', firebaseUser.email);
      
      // Verificar se é super admin pelo email
      const isSuperAdmin = OrganizationService.isSuperAdmin(firebaseUser.email || '');
      
      // Criar usuário padrão para evitar loops
      const defaultUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
        email: firebaseUser.email || '',
        role: isSuperAdmin ? 'super_admin' : 'agent',
        organizationId: isSuperAdmin ? '' : 'fazenda-rio-grande-pr', // Super admin não tem org específica
        organization: isSuperAdmin ? undefined : mockOrganizations[0],
        permissions: isSuperAdmin ? ['*'] : ['visits:create', 'visits:view_own', 'collections:create', 'collections:view_own'],
        isSuperAdmin
      };
      
      return defaultUser;
    }
  };

  useEffect(() => {
    let isSubscribed = true; // Flag para evitar setState após unmount
    
    // Firebase Auth ativo - conecta com Firestore
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isSubscribed) {
        console.log('⚠️ Componente desmontado, ignorando auth change');
        return;
      }
      
      console.log('🔄 Firebase Auth State Changed:', firebaseUser?.email || 'null');
      console.log('📊 Estado atual - isLoading:', isLoading, 'user:', user?.email || 'null');
      
      setIsLoading(true);
      
      if (firebaseUser) {
        try {
          console.log('🔍 Carregando dados do usuário...');
          const userData = await loadUserData(firebaseUser);
          
          if (isSubscribed) { // Só atualiza se ainda estiver montado
            console.log('✅ User data loaded:', userData?.email, 'role:', userData?.role);
            console.log('📋 User permissions:', userData?.permissions);
            console.log('🏢 User organization:', userData?.organization?.name);
            setUser(userData);
          } else {
            console.log('⚠️ Componente foi desmontado durante loadUserData');
          }
        } catch (error) {
          if (isSubscribed) {
            console.error('❌ Error loading user data:', error);
            console.log('🔄 Tentando criar usuário padrão...');
            setUser(null);
          }
        }
      } else {
        if (isSubscribed) {
          console.log('🚪 User logged out - limpando estados');
          setUser(null);
          setAvailableOrganizations([]);
        }
      }
      
      if (isSubscribed) {
        console.log('✅ Finalizando auth change - setIsLoading(false)');
        setIsLoading(false);
      }
    });

    return () => {
      isSubscribed = false; // Marca como desmontado
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Firebase Auth real - conecta com Authentication + Firestore
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged vai carregar os dados do usuário automaticamente
      
      // Toast de sucesso
      toast({
        variant: 'success',
        title: '🎉 Login realizado com sucesso!',
        description: 'Bem-vindo ao Sistema de Vigilância Entomológica',
        duration: 3000,
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro no login:', error);
      setIsLoading(false);
      
      // Toast de erro
      let errorMessage = 'Erro desconhecido. Tente novamente.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado. Verifique o e-mail informado.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta. Tente novamente.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido. Verifique o formato do e-mail.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Conta desabilitada. Entre em contato com o administrador.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Credenciais inválidas. Verifique e-mail e senha.';
          break;
      }
      
      toast({
        variant: 'destructive',
        title: '❌ Erro no login',
        description: errorMessage,
        duration: 5000,
      });
      
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      
      // Limpar estados locais primeiro
      setUser(null);
      setAvailableOrganizations([]);
      setIsLoading(false);
      
      // Depois fazer logout do Firebase
      await signOut(auth);
      
      console.log('✅ Logout realizado com sucesso');
      
      // Toast de logout
      toast({
        variant: 'info',
        title: '👋 Logout realizado',
        description: 'Você foi desconectado com sucesso. Até mais!',
        duration: 3000,
      });
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      
      // Mesmo com erro, limpar estados locais
      setUser(null);
      setAvailableOrganizations([]);
      setIsLoading(false);
      
      toast({
        variant: 'destructive',
        title: '❌ Erro no logout',
        description: 'Ocorreu um erro ao sair. Você foi desconectado localmente.',
        duration: 4000,
      });
    }
  };

  const switchOrganization = async (orgId: string) => {
    if (!user?.isSuperAdmin) {
      throw new Error('Apenas super admins podem trocar de organização');
    }

    setIsLoading(true);
    try {
      // Firebase Firestore real
      const organization = await OrganizationService.getOrganization(orgId);
      
      if (organization) {
        setUser(prev => prev ? {
          ...prev,
          organizationId: orgId,
          organization
        } : null);
      }
    } catch (error) {
      console.error('Erro ao trocar organização:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      availableOrganizations, 
      switchOrganization 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
