'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { mockOrganizations } from '@/lib/mockAuth';
import { OrganizationService, IOrganization } from '@/services/organizationService';
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
  Trash2
} from 'lucide-react';
import CreateOrganizationModal from '@/components/modals/CreateOrganizationModal';

export default function SuperAdminPanel() {
  const { user, switchOrganization } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [realOrganizations, setRealOrganizations] = useState<IOrganization[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);


  // Carregar organizações reais do Firebase
  const loadOrganizations = async () => {
    setIsLoadingOrganizations(true);
    try {
      console.log('📋 Carregando organizações do Firebase...');
      const organizations = await OrganizationService.listOrganizations();
      setRealOrganizations(organizations);
      console.log('✅ Organizações carregadas:', organizations.length);
    } catch (error) {
      console.error('❌ Erro ao carregar organizações:', error);
      // Em caso de erro, continua com organizações vazias
      setRealOrganizations([]);
    } finally {
      setIsLoadingOrganizations(false);
    }
  };

  // Carregar organizações na inicialização e quando refreshTrigger mudar
  useEffect(() => {
    loadOrganizations();
  }, [refreshTrigger]);

  const handleOrganizationCreated = () => {
    // Força re-render para mostrar nova organização
    setRefreshTrigger(prev => prev + 1);
  };

  // Combinar organizações reais e mockadas
  const allOrganizations = [
    // Organizações reais do Firebase (sem tag MOCK)
    ...realOrganizations.map(org => ({ ...org, isMock: false })),
    // Organizações mockadas (com tag MOCK)
    ...mockOrganizations.map(org => ({ 
      ...org, 
      slug: OrganizationService.generateSlug(org.name),
      isMock: true 
    }))
  ];

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
      console.error('Erro ao trocar organização:', error);
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
            <div className="text-2xl font-bold text-blue-900">{allOrganizations.length}</div>
            <p className="text-xs text-blue-600 mt-1">+2 novos este mês</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-green-700">Total Usuários</CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-bold text-green-900">6</div>
            <p className="text-xs text-green-600 mt-1">+5 novos esta semana</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-purple-700">Organizações Ativas</CardTitle>
            <Activity className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-bold text-purple-900">2</div>
            <p className="text-xs text-purple-600 mt-1">100% ativas</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300 bg-white hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
            <CardTitle className="text-sm font-medium text-orange-700">Dados Totais</CardTitle>
            <Database className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-2xl font-bold text-orange-900">2.4TB</div>
            <p className="text-xs text-orange-600 mt-1">+180GB este mês</p>
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