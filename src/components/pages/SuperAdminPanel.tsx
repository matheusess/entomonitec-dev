'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';

import { OrganizationService, IOrganization } from '@/services/organizationService';
import { UserService } from '@/services/userService';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Users, 
  Eye, 
  Settings, 
  Plus,
  Search,
  Shield,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Activity,
  Database,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import CreateOrganizationModal from '@/components/modals/CreateOrganizationModal';
import logger from '@/lib/logger';

export default function SuperAdminPanel() {
  const { user, switchOrganization } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [realOrganizations, setRealOrganizations] = useState<IOrganization[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  
  // Estatísticas dinâmicas
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeOrganizations, setActiveOrganizations] = useState<number>(0);
  const [totalDataSize, setTotalDataSize] = useState<string>('0 MB');
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Estatísticas de período (para mostrar variação)
  const [newUsersThisWeek, setNewUsersThisWeek] = useState<number>(0);
  const [newOrgsThisMonth, setNewOrgsThisMonth] = useState<number>(0);


  // Carregar organizações reais do Firebase
  const loadOrganizations = async () => {
    setIsLoadingOrganizations(true);
    try {
      logger.log('📋 Carregando organizações do Firebase...');
      const organizations = await OrganizationService.listOrganizations();
      setRealOrganizations(organizations);
      logger.log('✅ Organizações carregadas:', organizations.length);
    } catch (error) {
      logger.error('❌ Erro ao carregar organizações:', error);
      // Em caso de erro, continua com organizações vazias
      setRealOrganizations([]);
    } finally {
      setIsLoadingOrganizations(false);
    }
  };

  // Carregar estatísticas dinâmicas
  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      logger.log('📊 Carregando estatísticas do sistema...');
      
      // 1. Carregar todos os usuários
      const allUsers = await UserService.listAllUsers();
      
      // 2. Filtrar usuários que NÃO são super_admin
      const nonSuperAdminUsers = allUsers.filter(user => {
        // Verificar por role
        if (user.role === 'super_admin') return false;
        // Verificar por email (domínio entomonitec)
        if (OrganizationService.isSuperAdmin(user.email)) return false;
        return true;
      });
      
      setTotalUsers(nonSuperAdminUsers.length);
      logger.log('✅ Total de usuários (não super_admin):', nonSuperAdminUsers.length);
      
      // 3. Calcular novos usuários esta semana
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newUsersWeek = nonSuperAdminUsers.filter(user => 
        user.createdAt && new Date(user.createdAt) >= oneWeekAgo
      ).length;
      setNewUsersThisWeek(newUsersWeek);
      
      // 4. Calcular organizações ativas
      const activeOrgs = realOrganizations.filter(org => org.isActive === true).length;
      setActiveOrganizations(activeOrgs);
      
      // 5. Calcular novas organizações este mês
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const newOrgsMonth = realOrganizations.filter(org => 
        org.createdAt && new Date(org.createdAt) >= oneMonthAgo
      ).length;
      setNewOrgsThisMonth(newOrgsMonth);
      
      // 6. Calcular dados totais (estimativa baseada em visitas e organizações)
      try {
        // Buscar amostra de visitas para estimar tamanho médio
        const visitsQuery = query(
          collection(db, 'visits'),
          orderBy('createdAt', 'desc'),
          limit(50) // Amostra menor para performance
        );
        const visitsSnapshot = await getDocs(visitsQuery);
        
        // Calcular tamanho médio real das visitas na amostra
        let totalSampleSize = 0;
        visitsSnapshot.forEach((doc) => {
          const data = doc.data();
          // Estimar tamanho do documento (JSON stringificado)
          const docSize = JSON.stringify(data).length;
          totalSampleSize += docSize;
        });
        
        const avgVisitSize = visitsSnapshot.size > 0 
          ? totalSampleSize / visitsSnapshot.size 
          : 7 * 1024; // Fallback: 7KB por visita
        
        // Estimar total de visitas (usar amostra como base)
        // Se temos 50 visitas na amostra, estimamos que há mais
        // Para uma estimativa melhor, poderíamos fazer uma query count, mas isso é mais lento
        const estimatedTotalVisits = visitsSnapshot.size > 0 
          ? Math.max(visitsSnapshot.size, 100) // Mínimo 100 para estimativa
          : 0;
        
        // Calcular tamanho estimado total
        // Incluir também organizações e usuários
        const organizationsSize = realOrganizations.length * 2 * 1024; // ~2KB por org
        const usersSize = nonSuperAdminUsers.length * 1 * 1024; // ~1KB por usuário
        const visitsSize = estimatedTotalVisits * avgVisitSize;
        
        const totalEstimatedBytes = organizationsSize + usersSize + visitsSize;
        
        // Converter para formato legível
        const formatBytes = (bytes: number): string => {
          if (bytes === 0) return '0 MB';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          const size = bytes / Math.pow(k, i);
          return `${size.toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
        };
        
        setTotalDataSize(formatBytes(totalEstimatedBytes));
        logger.log('✅ Tamanho estimado dos dados:', {
          total: formatBytes(totalEstimatedBytes),
          visits: formatBytes(visitsSize),
          organizations: formatBytes(organizationsSize),
          users: formatBytes(usersSize)
        });
      } catch (error) {
        logger.error('❌ Erro ao calcular tamanho dos dados:', error);
        setTotalDataSize('N/A');
      }
      
      logger.log('✅ Estatísticas carregadas:', {
        totalUsers: nonSuperAdminUsers.length,
        activeOrganizations: activeOrgs,
        newUsersThisWeek: newUsersWeek,
        newOrgsThisMonth: newOrgsMonth
      });
      
    } catch (error) {
      logger.error('❌ Erro ao carregar estatísticas:', error);
      setTotalUsers(0);
      setActiveOrganizations(0);
      setTotalDataSize('0 MB');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Carregar organizações na inicialização e quando refreshTrigger mudar
  useEffect(() => {
    loadOrganizations();
  }, [refreshTrigger]);

  // Carregar estatísticas quando organizações forem carregadas
  useEffect(() => {
    if (realOrganizations.length > 0 || refreshTrigger > 0) {
      loadStats();
    }
  }, [realOrganizations, refreshTrigger]);

  const handleOrganizationCreated = () => {
    // Força re-render para mostrar nova organização
    setRefreshTrigger(prev => prev + 1);
  };

  // Usar apenas organizações reais do Firebase
  const allOrganizations = realOrganizations.map(org => ({ ...org, isMock: false }));

  // Filtrar organizações combinadas
  const filteredOrganizations = allOrganizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewAsOrganization = async (orgId: string) => {
    try {
      await switchOrganization(orgId);
      // Redirecionar para dashboard da organização
      window.location.href = '/dashboard';
    } catch (error) {
      logger.error('Erro ao trocar organização:', error);
    }
  };

  const handleViewOrganizationDetails = (org: IOrganization) => {
    // Usar slug salvo ou gerar como fallback
    const slug = org.slug || OrganizationService.generateSlug(org.name);
    router.push(`/organizations/${slug}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Super Admin</h1>
          <p className="text-gray-600 mt-1">Gerenciamento global do sistema EntomoVigilância</p>
        </div>
        <div className="flex space-x-3">
          <CreateOrganizationModal onOrganizationCreated={handleOrganizationCreated} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2 border-blue-300 bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-blue-700">Total Organizações</CardTitle>
            <Building2 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-bold text-blue-900">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                allOrganizations.length
              )}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {newOrgsThisMonth > 0 ? `+${newOrgsThisMonth} novos este mês` : 'Sem novas este mês'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-green-700">Total Usuários</CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-bold text-green-900">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalUsers
              )}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {newUsersThisWeek > 0 ? `+${newUsersThisWeek} novos esta semana` : 'Sem novos esta semana'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-purple-700">Organizações Ativas</CardTitle>
            <Activity className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-bold text-purple-900">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                activeOrganizations
              )}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {allOrganizations.length > 0 
                ? `${Math.round((activeOrganizations / allOrganizations.length) * 100)}% ativas`
                : '0% ativas'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300 bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-orange-700">Dados Totais</CardTitle>
            <Database className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-bold text-orange-900">
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalDataSize
              )}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              {totalDataSize === 'Calculando...' ? 'Calculando tamanho...' : 'Dados do sistema'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Buscar organizações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Organizações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-all duration-200 border-2 border-blue-200 hover:border-blue-300 bg-white">
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    {org.isMock ? (
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                        MOCK
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                        REAL
                      </Badge>
                    )}
                  </div>
                  <Badge variant={org.isActive ? "default" : "secondary"}>
                    {org.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <CardDescription className="mt-2">{org.fullName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {org.state}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {org.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {org.phone}
                </div>
                
                <div className="flex space-x-2 pt-3">
                <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewAsOrganization(org.id)}
                    className="border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Como
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleViewOrganizationDetails(org)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600 hover:border-blue-700 transition-all duration-200"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                  
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}