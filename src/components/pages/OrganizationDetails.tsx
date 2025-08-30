'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Building2, 
  Users, 
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Shield,
  UserPlus,
  Edit,
  Trash2,
  MoreVertical,
  Activity,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  KeyRound,
  Settings
} from 'lucide-react';
import { OrganizationService, IOrganization } from '@/services/organizationService';
import { UserService, IUserWithId, ICreateUserData } from '@/services/userService';
import { UserInviteService, IUserInvite, ICreateInviteData } from '@/services/userInviteService';
import CreateOrganizationModal from '@/components/modals/CreateOrganizationModal';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface OrganizationDetailsProps {
  organizationId: string;
  onBack: () => void;
}

interface UserForm {
  name: string;
  email: string;
  role: 'administrator' | 'supervisor' | 'agent';
}

export default function OrganizationDetails({ organizationId, onBack }: OrganizationDetailsProps) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<IOrganization | null>(null);
  const [users, setUsers] = useState<IUserWithId[]>([]);
  const [invites, setInvites] = useState<IUserInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // User form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserForm>({
    name: '',
    email: '',
    role: 'agent'
  });

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: ''
  });

  // Carregar dados da organização
  const loadOrganization = async () => {
    try {
      console.log('🏢 Carregando organização:', organizationId);
      const orgData = await OrganizationService.getOrganization(organizationId);
      setOrganization(orgData);
    } catch (error) {
      console.error('❌ Erro ao carregar organização:', error);
      toast({
        title: "Erro ao carregar organização",
        description: "Não foi possível carregar os dados da organização.",
        variant: "destructive"
      });
    }
  };

  // Carregar usuários da organização
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      console.log('👥 Carregando usuários da organização:', organizationId);
      const usersList = await UserService.listUsersByOrganization(organizationId);
      setUsers(usersList);
      console.log('✅ Usuários carregados:', usersList.length);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Carregar convites pendentes da organização
  const loadInvites = async () => {
    try {
      console.log('📧 Carregando convites da organização:', organizationId);
      const invitesList = await UserInviteService.listInvitesByOrganization(organizationId);
      setInvites(invitesList);
      console.log('✅ Convites carregados:', invitesList.length);
    } catch (error) {
      console.error('❌ Erro ao carregar convites:', error);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        loadOrganization(),
        loadUsers(),
        loadInvites()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [organizationId]);

  // Filtrar usuários
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    UserService.getRoleDisplayName(u.role).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar convites
  const filteredInvites = invites.filter(invite =>
    invite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invite.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    UserService.getRoleDisplayName(invite.role).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validar formulário
  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Nome é obrigatório';
    if (!formData.email.trim()) return 'Email é obrigatório';
    if (!formData.role) return 'Tipo de usuário é obrigatório';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Email inválido';

    // Verificar se email já está em uso por usuário existente
    if (users.some(u => u.email === formData.email)) {
      return 'Este email já está em uso por um usuário existente';
    }

    // Verificar se já existe convite pendente para este email
    if (invites.some(invite => invite.email === formData.email && invite.status === 'pending')) {
      return 'Já existe um convite pendente para este email';
    }

    return null;
  };

  // Criar convite para usuário
  const handleCreateUser = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Erro de validação",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    if (!user?.id || !organization) {
      toast({
        title: "Erro",
        description: "Dados necessários não encontrados.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const inviteData: ICreateInviteData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        organizationId,
        organizationName: organization.fullName,
        invitedByName: user.name
      };

      await UserInviteService.createInvite(inviteData, user.id);
      
      toast({
        title: "Convite enviado com sucesso!",
        description: `Um convite foi enviado para ${formData.email}. O usuário receberá um email para completar o cadastro.`,
        variant: "default"
      });

      // Resetar formulário e recarregar
      setFormData({ name: '', email: '', role: 'agent' });
      setShowUserForm(false);
      await Promise.all([loadUsers(), loadInvites()]);
      
    } catch (error) {
      console.error('❌ Erro ao enviar convite:', error);
      toast({
        title: "Erro ao enviar convite",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmar exclusão
  const handleDeleteConfirm = (userId: string, userName: string) => {
    setDeleteDialog({
      isOpen: true,
      userId,
      userName
    });
  };

  // Deletar usuário
  const handleDeleteUser = async () => {
    if (!deleteDialog.userId) return;

    try {
      await UserService.deactivateUser(deleteDialog.userId);
      
      toast({
        title: "Usuário removido",
        description: `${deleteDialog.userName} foi desativado do sistema.`,
        variant: "default"
      });

      await loadUsers();
    } catch (error) {
      toast({
        title: "Erro ao remover usuário",
        description: "Não foi possível remover o usuário.",
        variant: "destructive"
      });
    }

    setDeleteDialog({ isOpen: false, userId: null, userName: '' });
  };

  // Reenviar convite
  const handleResendInvite = async (email: string, name: string) => {
    try {
      // Para convites, encontrar o ID do convite
      const invite = invites.find(i => i.email === email && i.status === 'pending');
      if (invite?.id) {
        await UserInviteService.resendInvite(invite.id);
        toast({
          title: "Convite reenviado",
          description: `Novo convite enviado para ${name} (${email}).`,
          variant: "default"
        });
        await loadInvites();
      } else {
        // Para usuários existentes, implementar reset de senha futuramente
        toast({
          title: "Em desenvolvimento",
          description: "Funcionalidade de redefinição de senha em desenvolvimento.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao reenviar convite:', error);
      toast({
        title: "Erro ao reenviar convite",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  // Cancelar convite
  const handleCancelInvite = async (inviteId: string, name: string) => {
    try {
      await UserInviteService.cancelInvite(inviteId);
      toast({
        title: "Convite cancelado",
        description: `Convite para ${name} foi cancelado com sucesso.`,
        variant: "default"
      });
      await loadInvites();
    } catch (error) {
      console.error('❌ Erro ao cancelar convite:', error);
      toast({
        title: "Erro ao cancelar convite",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };



  // Verificar permissões
  const canManageUsers = user?.permissions.includes('users:create') || user?.isSuperAdmin;
  const canEditUsers = user?.permissions.includes('users:update') || user?.isSuperAdmin;
  const canDeleteUsers = user?.permissions.includes('users:delete') || user?.isSuperAdmin;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Activity className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Carregando dados da organização...</span>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600">Organização não encontrada</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Building2 className="h-8 w-8" />
              <span>{organization.name}</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                REAL
              </Badge>
            </h1>
            <p className="text-gray-600 mt-1">{organization.fullName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <CreateOrganizationModal 
            mode="edit"
            editingOrganization={organization ? {
              id: organization.id,
              name: organization.name,
              fullName: organization.fullName,
              state: organization.state,
              department: organization.department,
              phone: organization.phone,
              email: organization.email,
              address: organization.address,
              website: organization.website,
              neighborhoods: organization.neighborhoods
            } : null}
            onOrganizationCreated={() => {
              loadOrganization();
            }}
            trigger={
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Organização */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Informações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{organization.state}</span>
              </div>
              
              {organization.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{organization.email}</span>
                </div>
              )}
              
              {organization.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{organization.phone}</span>
                </div>
              )}
              
              {organization.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a 
                    href={organization.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {organization.website}
                  </a>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Criado em {organization.createdAt.toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Bairros ({organization.neighborhoods.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {organization.neighborhoods.slice(0, 5).map((neighborhood, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {neighborhood}
                    </Badge>
                  ))}
                  {organization.neighborhoods.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{organization.neighborhoods.length - 5} mais
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Usuários */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Usuários ({users.length})</span>
                </CardTitle>
                
                {canManageUsers && (
                  <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Convidar Usuário
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Convidar Usuário</DialogTitle>
                        <DialogDescription>
                          Envie um convite para um novo usuário da organização {organization.name}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nome Completo *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="João Silva"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="joao@municipio.gov.br"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="role">Tipo de Usuário *</Label>
                          <Select value={formData.role} onValueChange={(value: 'administrator' | 'supervisor' | 'agent') => 
                            setFormData(prev => ({ ...prev, role: value }))
                          }>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="administrator">Administrador</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="agent">Agente de Campo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowUserForm(false);
                              setFormData({ name: '', email: '', role: 'agent' });
                            }}
                            disabled={isSubmitting}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleCreateUser}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Activity className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Mail className="h-4 w-4 mr-2" />
                            )}
                            {isSubmitting ? 'Enviando convite...' : 'Enviar Convite'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadUsers();
                    loadInvites();
                  }}
                  disabled={isLoadingUsers}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="users" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Usuários ({users.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="invites" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Convites ({invites.filter(i => i.status === 'pending').length})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-6">
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Activity className="h-6 w-6 animate-spin mr-2" />
                      <span>Carregando usuários...</span>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum usuário encontrado</p>
                      {searchTerm && (
                        <p className="text-sm">Tente ajustar sua busca</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredUsers.map((userItem) => (
                        <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{userItem.name}</p>
                                <Badge className={`text-xs ${UserService.getRoleColor(userItem.role)}`}>
                                  {UserService.getRoleDisplayName(userItem.role)}
                                </Badge>
                                {userItem.mustChangePassword && (
                                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                    Pendente
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{userItem.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {userItem.isActive ? (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <UserX className="h-4 w-4 text-red-500" />
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canEditUsers && (
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleResendInvite(userItem.email, userItem.name)}>
                                  <KeyRound className="h-4 w-4 mr-2" />
                                  Redefinir Senha
                                </DropdownMenuItem>
                                {canDeleteUsers && userItem.id !== user?.id && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteConfirm(userItem.id, userItem.name)}
                                      className="text-red-600"
                                    >
                                      <UserX className="h-4 w-4 mr-2" />
                                      Desativar
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="invites" className="mt-6">
                  {filteredInvites.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum convite encontrado</p>
                      {searchTerm && (
                        <p className="text-sm">Tente ajustar sua busca</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredInvites.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <Mail className="h-5 w-5 text-orange-600" />
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{invite.name}</p>
                                <Badge className={`text-xs ${UserService.getRoleColor(invite.role)}`}>
                                  {UserService.getRoleDisplayName(invite.role)}
                                </Badge>
                                <Badge 
                                  variant={invite.status === 'pending' ? 'outline' : 'secondary'}
                                  className={`text-xs ${
                                    invite.status === 'pending' ? 'text-orange-600 border-orange-200' :
                                    invite.status === 'accepted' ? 'text-green-600 border-green-200' :
                                    'text-gray-600 border-gray-200'
                                  }`}
                                >
                                  {invite.status === 'pending' ? 'Pendente' :
                                   invite.status === 'accepted' ? 'Aceito' : 
                                   invite.status === 'expired' ? 'Expirado' : 'Cancelado'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{invite.email}</p>
                              <p className="text-xs text-gray-500">
                                Criado em {invite.createdAt.toLocaleDateString('pt-BR')} por {invite.invitedByName}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {invite.status === 'pending' && canManageUsers && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleResendInvite(invite.email, invite.name)}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reenviar Convite
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleCancelInvite(invite.id!, invite.name)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Cancelar Convite
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => 
        setDeleteDialog({ ...deleteDialog, isOpen: open })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar <strong>{deleteDialog.userName}</strong>? 
              O usuário não conseguirá mais acessar o sistema, mas seus dados serão preservados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
