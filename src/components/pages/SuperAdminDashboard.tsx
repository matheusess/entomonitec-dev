'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { IOrganization, ICreateOrganizationRequest, IUser } from '@/types/organization';
import { OrganizationService } from '@/services/organizationService';
import { 
  Building2, 
  Users, 
  Plus, 
  Settings, 
  Eye,
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user, availableOrganizations, switchOrganization } = useAuth();
  const { toast } = useToast();
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ICreateOrganizationRequest>({
    name: '',
    fullName: '',
    state: '',
    city: '',
    department: '',
    phone: '',
    email: '',
    address: '',
    website: ''
  });

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const orgs = await OrganizationService.listOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar organizações',
        variant: 'destructive'
      });
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.id) throw new Error('Usuário não encontrado');
      
      const result = await OrganizationService.createOrganization(formData);
      
      toast({
        title: 'Sucesso!',
        description: `Organização ${formData.name} criada com sucesso`,
      });

      // Reset form
      setFormData({
        name: '',
        fullName: '',
        state: '',
        city: '',
        department: '',
        phone: '',
        email: '',
        address: '',
        website: ''
      });
      setShowCreateForm(false);
      
      // Recarregar lista
      await loadOrganizations();

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar organização',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleSwitchOrganization = async (orgId: string) => {
    try {
      await switchOrganization(orgId);
      setSelectedOrg(orgId);
      toast({
        title: 'Organização Alterada',
        description: `Visualizando como: ${organizations.find(o => o.id === orgId)?.name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao trocar organização',
        variant: 'destructive'
      });
    }
  };

  if (!user?.isSuperAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
        <p className="text-gray-600 mt-2">Esta área é restrita a super administradores.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Super Admin</h1>
          <p className="text-gray-600">Gerenciamento de organizações e usuários do sistema</p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Super Admin
        </Badge>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organizations">Organizações</TabsTrigger>
          <TabsTrigger value="create">Criar Organização</TabsTrigger>
          <TabsTrigger value="switch">Trocar Visualização</TabsTrigger>
        </TabsList>

        {/* Lista de Organizações */}
        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organizações Cadastradas ({organizations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {organizations.map((org) => (
                  <div key={org.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{org.name}</h3>
                        <p className="text-sm text-gray-600">{org.fullName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {org.state}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(org.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={org.isActive ? 'default' : 'secondary'}>
                          {org.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSwitchOrganization(org.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Departamento:</span>
                        <p className="text-gray-600">{org.department}</p>
                      </div>

                      <div>
                        <span className="font-medium">Contato:</span>
                        <p className="text-gray-600">{org.phone || org.email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium">LIRAa:</span>
                        <p className="text-gray-600">Habilitado</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Criar Organização */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Nova Organização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrganization} className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Cidade *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Fazenda Rio Grande"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fullName">Nome Completo da Organização *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Ex: Prefeitura Municipal de Fazenda Rio Grande"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="department">Departamento/Secretaria *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Ex: Secretaria Municipal de Saúde"
                    required
                  />
                </div>

                {/* Contato */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações de Contato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          phone: e.target.value
                        }))}
                        placeholder="(41) 3699-7000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Email de Contato</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          email: e.target.value
                        }))}
                        placeholder="saude@municipio.gov.br"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: e.target.value
                      }))}
                      placeholder="Rua das Flores, 123 - Centro"
                    />
                  </div>
                </div>



                {/* Website (opcional) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações Adicionais</h3>
                  <div>
                    <Label htmlFor="website">Website (opcional)</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        website: e.target.value
                      }))}
                      placeholder="https://saude.municipio.gov.br"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Criando...' : 'Criar Organização'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trocar Visualização */}
        <TabsContent value="switch">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Trocar Visualização de Organização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Como super admin, você pode visualizar o sistema na perspectiva de qualquer organização:
                </p>
                
                <div className="grid gap-3">
                  {organizations.map((org) => (
                    <div 
                      key={org.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedOrg === org.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => handleSwitchOrganization(org.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{org.name} - {org.state}</h3>
                          <p className="text-sm text-gray-600">{org.fullName}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          {selectedOrg === org.id ? 'Selecionado' : 'Selecionar'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

