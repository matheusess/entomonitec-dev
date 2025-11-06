'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
import { toast } from '@/hooks/use-toast';
import { 
  UserPlus, 
  Users, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Mail, 
  Shield, 
  Activity, 
  Search,
  RefreshCw,
  MoreVertical,
  KeyRound
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserService, ICreateUserData, IUpdateUserData, IUserWithId } from '@/services/userService';
import { UserInviteService, IUserInvite, ICreateInviteData } from '@/services/userInviteService';
import { NeighborhoodService } from '@/services/neighborhoodService';
import { OrganizationService } from '@/services/organizationService';
import logger from '@/lib/logger';

interface UserManagementModalProps {
  organizationId?: string;
  organizationName?: string;
}

type UserFormMode = 'create' | 'edit';

interface UserForm {
  name: string;
  email: string;
  role: 'administrator' | 'supervisor' | 'agent';
  assignedNeighborhoods: string[];
}

export default function UserManagementModal({ organizationId, organizationName }: UserManagementModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<IUserWithId[]>([]);
  const [invites, setInvites] = useState<IUserInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('list');
  
  // Form states
  const [formMode, setFormMode] = useState<UserFormMode>('create');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserForm>({
    name: '',
    email: '',
    role: 'agent',
    assignedNeighborhoods: []
  });

  // Estados para bairros
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState<string[]>([]);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);

  // Alert dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: ''
  });

  // Determinar organização para carregar usuários
  const targetOrgId = organizationId || user?.organizationId;
  const isSuperAdmin = user?.isSuperAdmin;
  
  // Super Admin sempre pode especificar uma organização, usuários normais só veem a própria
  const effectiveOrgId = isSuperAdmin ? organizationId : user?.organizationId;

  // Carregar usuários
  const loadUsers = async () => {
    // Usuários normais só podem ver da própria organização
    if (!isSuperAdmin && !user?.organizationId) return;
    
    setIsLoading(true);
    try {
      logger.log('👥 Carregando usuários...');
      
      let usersList: IUserWithId[];
      if (isSuperAdmin && organizationId) {
        // Super Admin vendo usuários de uma organização específica
        usersList = await UserService.listUsersByOrganization(organizationId);
      } else if (isSuperAdmin && !organizationId) {
        // Super Admin vendo todos os usuários (apenas para relatórios)
        usersList = await UserService.listAllUsers();
      } else if (user?.organizationId) {
        // Usuário normal vendo apenas da própria organização
        usersList = await UserService.listUsersByOrganization(user.organizationId);
      } else {
        usersList = [];
      }
      
      setUsers(usersList);
      logger.log('✅ Usuários carregados:', usersList.length);
    } catch (error) {
      logger.error('❌ Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar usuários quando abrir o modal
  useEffect(() => {
    if (isOpen) {
      logger.log('🔄 Modal aberto, carregando dados...');
      logger.log('🔄 organizationId:', organizationId);
      logger.log('🔄 user?.organizationId:', user?.organizationId);
      logger.log('🔄 effectiveOrgId:', effectiveOrgId);
      
      loadUsers();
      loadInvites();
      loadNeighborhoods();
    }
  }, [isOpen, organizationId, user?.organizationId, effectiveOrgId]);

  // Carregar bairros da organização
  const loadNeighborhoods = async () => {
    logger.log('🏘️ loadNeighborhoods chamada');
    const targetOrgId = effectiveOrgId;
    logger.log('🏘️ targetOrgId:', targetOrgId);
    logger.log('🏘️ organizationId prop:', organizationId);
    logger.log('🏘️ user?.organizationId:', user?.organizationId);
    logger.log('🏘️ isSuperAdmin:', isSuperAdmin);
    
    if (!targetOrgId) {
      logger.log('❌ Sem targetOrgId, saindo...');
      return;
    }

    setIsLoadingNeighborhoods(true);
    try {
      logger.log('🏘️ Buscando organização:', targetOrgId);
      const organization = await OrganizationService.getOrganization(targetOrgId);
      logger.log('🏘️ Organização encontrada:', organization);
      
      if (organization) {
        // Usar city ou name como fallback
        const cityName = organization.city || organization.name;
        logger.log('🏘️ Usando cidade:', cityName, 'Estado:', organization.state);
        
        const neighborhoods = NeighborhoodService.getNeighborhoodsByStateAndCity(
          organization.state, 
          cityName
        );
        
        logger.log('🏘️ Bairros encontrados:', neighborhoods);
        logger.log('🏘️ Total de bairros:', neighborhoods.length);
        
        setAvailableNeighborhoods(neighborhoods);
      } else {
        logger.log('❌ Organização não encontrada');
        // Fallback: usar bairros genéricos para Curitiba
        const fallbackNeighborhoods = NeighborhoodService.getNeighborhoodsByStateAndCity('PR', 'Curitiba');
        logger.log('🏘️ Usando bairros fallback:', fallbackNeighborhoods);
        setAvailableNeighborhoods(fallbackNeighborhoods);
      }
    } catch (error) {
      logger.error('❌ Erro ao carregar bairros:', error);
      // Fallback em caso de erro
      const fallbackNeighborhoods = NeighborhoodService.getNeighborhoodsByStateAndCity('PR', 'Curitiba');
      logger.log('🏘️ Usando bairros fallback após erro:', fallbackNeighborhoods);
      setAvailableNeighborhoods(fallbackNeighborhoods);
    } finally {
      setIsLoadingNeighborhoods(false);
    }
  };

  const loadInvites = async () => {
    if (!organizationId) return;
    
    try {
      const inviteData = await UserInviteService.listInvitesByOrganization(organizationId);
      setInvites(inviteData);
    } catch (error) {
      logger.error('Erro ao carregar convites:', error);
    }
  };

  // Filtrar usuários
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    UserService.getRoleDisplayName(u.role).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Resetar formulário
  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'agent', assignedNeighborhoods: [] });
    setFormMode('create');
    setEditingUserId(null);
  };

  // Validar formulário
  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Nome é obrigatório';
    if (!formData.email.trim()) return 'Email é obrigatório';
    if (!formData.role) return 'Tipo de usuário é obrigatório';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Email inválido';

    // Verificar se email já existe (apenas na criação)
    if (formMode === 'create' && users.some(u => u.email === formData.email)) {
      return 'Este email já está em uso';
    }

    return null;
  };

  // Submeter formulário
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Erro de validação",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    // Determinar organização de destino
    const destinationOrgId = isSuperAdmin ? (organizationId || user?.organizationId) : user?.organizationId;
    
    if (!user?.id || !destinationOrgId) {
      toast({
        title: "Erro",
        description: "Usuário ou organização não encontrados.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (formMode === 'create') {
        // Criar novo usuário
        const inviteData: ICreateInviteData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          organizationId: destinationOrgId,
          organizationName: organizationName || 'Organização',
          invitedByName: user.name || 'Administrador',
          assignedNeighborhoods: formData.assignedNeighborhoods
        };

        await UserInviteService.createInvite(inviteData, user.id);
        
        toast({
          title: "Convite enviado com sucesso!",
          description: `Um convite foi enviado para ${formData.email}.`,
          variant: "default"
        });
      } else if (editingUserId) {
        // Atualizar usuário existente
        const updateData: IUpdateUserData = formData;
        await UserService.updateUser(editingUserId, updateData);
        
        toast({
          title: "Usuário atualizado com sucesso!",
          description: `${formData.name} foi atualizado no sistema.`,
          variant: "default"
        });
      }

      // Recarregar lista e resetar formulário
      await loadUsers();
      resetForm();
      setSelectedTab('list');
      
    } catch (error) {
      logger.error('❌ Erro ao salvar usuário:', error);
      toast({
        title: `Erro ao ${formMode === 'create' ? 'criar' : 'atualizar'} usuário`,
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Editar usuário
  const handleEdit = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) return;

    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role as 'administrator' | 'supervisor' | 'agent',
      assignedNeighborhoods: userToEdit.assignedNeighborhoods || []
    });
    setFormMode('edit');
    setEditingUserId(userId);
    setSelectedTab('form');
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
  const handleDelete = async () => {
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
  const handleResendInvite = async (email: string, userName: string) => {
    try {
      await UserService.sendPasswordReset(email);
      toast({
        title: "Convite reenviado",
        description: `Email de ativação enviado para ${userName}.`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro ao reenviar convite",
        description: "Não foi possível enviar o email.",
        variant: "destructive"
      });
    }
  };

  // Verificar permissões
  const canManageUsers = user?.permissions.includes('users:create') || user?.isSuperAdmin;
  const canEditUsers = user?.permissions.includes('users:update') || user?.isSuperAdmin;
  const canDeleteUsers = user?.permissions.includes('users:delete') || user?.isSuperAdmin;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Limpar estados quando fechar o modal
          resetForm();
          setSelectedTab('list');
        }
      }}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-all duration-200"
          >
            <Users className="h-4 w-4 mr-2" />
            Gerenciar Usuários
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Gerenciar Usuários</span>
            </DialogTitle>
            <DialogDescription>
              {organizationName 
                ? `Usuários da organização ${organizationName} (isolamento total)`
                : isSuperAdmin 
                  ? "Visualização global para suporte EntomonitEc"
                  : "Usuários da sua organização (dados isolados)"
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Lista de Usuários</TabsTrigger>
              <TabsTrigger value="form" disabled={!canManageUsers}>
                {formMode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
              </TabsTrigger>
            </TabsList>

            {/* Lista de Usuários */}
            <TabsContent value="list" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 max-w-sm">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadUsers}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  
                  {canManageUsers && (
                    <Button
                      onClick={() => {
                        resetForm();
                        setSelectedTab('form');
                      }}
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Novo Usuário
                    </Button>
                  )}
                </div>
              </div>

              {isLoading ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map((userItem) => (
                    <Card key={userItem.id} className="hover:shadow-md transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{userItem.name}</CardTitle>
                              <CardDescription className="text-sm">{userItem.email}</CardDescription>
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {userItem.assignedNeighborhoods && userItem.assignedNeighborhoods.length > 0 ? (
                                    userItem.assignedNeighborhoods.map((neighborhood, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="secondary" 
                                        className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                                      >
                                        {neighborhood}
                                      </Badge>
                                    ))
                                  ) : (
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs text-gray-500 border-gray-300"
                                    >
                                      Sem bairro atribuído
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canEditUsers && (
                                <DropdownMenuItem onClick={() => handleEdit(userItem.id)}>
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
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${UserService.getRoleColor(userItem.role)}`}>
                            {UserService.getRoleDisplayName(userItem.role)}
                          </Badge>
                          
                          <div className="flex items-center space-x-2">
                            {userItem.isActive ? (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <UserX className="h-4 w-4 text-red-500" />
                            )}
                            
                            {userItem.mustChangePassword && (
                              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                                Pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {isSuperAdmin && userItem.organizationId && (
                          <div className="mt-2 text-xs text-gray-500">
                            ID Org: {userItem.organizationId}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Formulário de Usuário */}
            <TabsContent value="form" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {formMode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
                  </CardTitle>
                  <CardDescription>
                    {formMode === 'create' 
                      ? 'Adicione um novo usuário ao sistema. Um email de ativação será enviado.'
                      : 'Atualize as informações do usuário.'
                    }
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        disabled={formMode === 'edit'}
                      />
                      {formMode === 'edit' && (
                        <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
                      )}
                    </div>
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
                        <SelectItem value="administrator">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Administrador</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="supervisor">
                          <div className="flex items-center space-x-2">
                            <UserCheck className="h-4 w-4" />
                            <span>Supervisor</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="agent">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Agente de Campo</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="neighborhoods">Bairros Atribuídos</Label>
                    <div className="space-y-2">

                      
                      <Select 
                        value="" 
                        onValueChange={(value) => {
                          if (value && !formData.assignedNeighborhoods.includes(value)) {
                            setFormData(prev => ({
                              ...prev,
                              assignedNeighborhoods: [...prev.assignedNeighborhoods, value]
                            }));
                          }
                        }}
                        disabled={isLoadingNeighborhoods || availableNeighborhoods.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            isLoadingNeighborhoods 
                              ? "Carregando bairros..." 
                              : availableNeighborhoods.length === 0
                                ? "Nenhum bairro disponível"
                                : "Selecione um bairro para adicionar"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {availableNeighborhoods.length === 0 ? (
                            <SelectItem value="" disabled>
                              {isLoadingNeighborhoods ? "Carregando..." : "Nenhum bairro encontrado"}
                            </SelectItem>
                          ) : (
                            availableNeighborhoods
                              .filter(neighborhood => !formData.assignedNeighborhoods.includes(neighborhood))
                              .map(neighborhood => (
                                <SelectItem key={neighborhood} value={neighborhood}>
                                  {neighborhood}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                      
                      {formData.assignedNeighborhoods.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.assignedNeighborhoods.map((neighborhood, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="flex items-center space-x-1"
                            >
                              <span>{neighborhood}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    assignedNeighborhoods: prev.assignedNeighborhoods.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="ml-1 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {formData.role === 'administrator' 
                          ? "Administradores podem acessar todos os bairros da organização"
                          : formData.role === 'supervisor'
                            ? "Supervisores podem acessar todos os bairros atribuídos"
                            : "Agentes só podem acessar os bairros atribuídos"
                        }
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => {
                          resetForm();
                          setSelectedTab('list');
                        }}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Activity className="h-4 w-4 mr-2 animate-spin" />
                        ) : formMode === 'create' ? (
                          <UserPlus className="h-4 w-4 mr-2" />
                        ) : (
                          <Edit className="h-4 w-4 mr-2" />
                        )}
                        {isSubmitting 
                          ? 'Enviando...' 
                          : formMode === 'create' 
                            ? 'Enviar Convite' 
                            : 'Atualizar Usuário'
                        }
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

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
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
