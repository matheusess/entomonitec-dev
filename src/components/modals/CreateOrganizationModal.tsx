'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


import { toast } from '@/hooks/use-toast';
import { 
  Plus,
  Building2,
  Phone,
  Mail,
  Globe,
  Save,
  Activity
} from 'lucide-react';
import { useBrazilianLocations } from '@/hooks/useBrazilianLocations';
import { OrganizationService, CreateOrganizationData } from '@/services/organizationService';

interface CreateOrganizationModalProps {
  onOrganizationCreated?: () => void;
  editingOrganization?: {
    id: string;
    name: string;
    fullName: string;
    state: string;
    city: string;
    department: string;
    phone: string;
    email: string;
    address?: string;
    website?: string;
  } | null;
  mode?: 'create' | 'edit';
  trigger?: React.ReactNode;
}

export default function CreateOrganizationModal({ 
  onOrganizationCreated, 
  editingOrganization, 
  mode = 'create',
  trigger
}: CreateOrganizationModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hook para dados do Brasil Aberto
  const {
    estados,
    cidades,
    isLoadingEstados,
    isLoadingCidades,
    fetchCidadesByEstado
  } = useBrazilianLocations();

  // Form data
  const [formData, setFormData] = useState({
    // Informações básicas
    name: '',
    fullName: '',
    state: '',
    city: '',
    department: 'Secretaria Municipal de Saúde',

    // Contato
    phone: '',
    email: '',
    address: '',
    website: '',
  });

  // Popular dados quando em modo de edição
  useEffect(() => {
    if (mode === 'edit' && editingOrganization) {
      console.log('🔧 Carregando dados para edição:', editingOrganization);
      
      setFormData({
        name: editingOrganization.name,
        fullName: editingOrganization.fullName,
        state: editingOrganization.state,
        city: editingOrganization.name, // Assumindo que name é a cidade
        department: editingOrganization.department,
        phone: editingOrganization.phone,
        email: editingOrganization.email,
        address: editingOrganization.address || '',
        website: editingOrganization.website || '',
      });
      
      // Carregar cidades do estado
      if (editingOrganization.state) {
        console.log('🏙️ Carregando cidades do estado:', editingOrganization.state);
        fetchCidadesByEstado(editingOrganization.state);
      }
    }
  }, [mode, editingOrganization]);

  const [selectedCidadeId, setSelectedCidadeId] = useState<number | null>(null);

  // Função para aplicar máscara de telefone brasileiro
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const limitedNumbers = numbers.slice(0, 11);
    
    if (limitedNumbers.length === 0) {
      return '';
    } else if (limitedNumbers.length <= 2) {
      return `(${limitedNumbers}`;
    } else if (limitedNumbers.length <= 6) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else if (limitedNumbers.length <= 10) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  // Quando o estado muda, buscar cidades
  const handleEstadoChange = (estadoSigla: string) => {
    handleInputChange('state', estadoSigla);
    handleInputChange('name', '');
    setSelectedCidadeId(null);
    fetchCidadesByEstado(estadoSigla);
  };

  // Quando a cidade muda
  const handleCidadeChange = (cidadeNome: string) => {
    handleInputChange('name', cidadeNome);
    handleInputChange('city', cidadeNome);
    
    const cidade = cidades.find(c => c.nome === cidadeNome);
    if (cidade) {
      setSelectedCidadeId(cidade.id);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Nome da cidade é obrigatório';
    if (!formData.fullName.trim()) return 'Nome completo é obrigatório';
    if (!formData.state) return 'Estado é obrigatório';
    if (!formData.email.trim()) return 'Email é obrigatório';
    if (!formData.phone.trim()) return 'Telefone é obrigatório';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Email inválido';
    
    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) return 'Telefone deve ter pelo menos 10 dígitos';
    if (phoneNumbers.length > 11) return 'Telefone não pode ter mais de 11 dígitos';
    
    return null;
  };

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

    setIsLoading(true);
    
    try {
      console.log(`🏢 ${mode === 'edit' ? 'Editando' : 'Criando'} organização:`, formData);
      
      // Preparar dados para o Firebase
      const organizationData: CreateOrganizationData = {
        name: formData.name,
        fullName: formData.fullName,
        state: formData.state,
        city: formData.city,
        department: formData.department,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        website: formData.website
      };

      if (mode === 'edit' && editingOrganization) {
        // Atualizar organização existente
        await OrganizationService.updateOrganization(editingOrganization.id, organizationData);
        
        toast({
          title: "Organização atualizada com sucesso!",
          description: `${formData.fullName} foi atualizada no sistema.`,
          variant: "default"
        });
      } else {
        // Criar nova organização
        await OrganizationService.createOrganization(organizationData);
        
        toast({
          title: "Organização criada com sucesso!",
          description: `${formData.fullName} foi adicionada ao sistema.`,
          variant: "default"
        });
      }
      
      // Limpar formulário
      setIsOpen(false);
      setFormData({
        name: '',
        fullName: '',
        state: '',
        city: '',
        department: 'Secretaria Municipal de Saúde',
        phone: '',
        email: '',
        address: '',
        website: ''
      });
      
      // Notificar o painel para atualizar
      if (onOrganizationCreated) {
        onOrganizationCreated();
      }
      
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      toast({
        title: "Erro ao criar organização",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700 border-2 border-blue-600 hover:border-blue-700 text-white transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Nova Organização
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Organização' : 'Criar Nova Organização'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? `Atualize as informações da organização ${editingOrganization?.name}` 
              : 'Configure uma nova organização para o sistema EntomoVigilância'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Informações da Organização</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Select value={formData.state} onValueChange={handleEstadoChange} disabled={isLoadingEstados}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingEstados ? "Carregando estados..." : "Selecione o estado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map(estado => (
                          <SelectItem key={estado.sigla} value={estado.sigla || ''}>
                            {estado.nome} ({estado.sigla})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="name">Cidade *</Label>
                    <Select
                      value={formData.name}
                      onValueChange={handleCidadeChange}
                      disabled={!formData.state || isLoadingCidades}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !formData.state
                            ? "Selecione um estado primeiro"
                            : isLoadingCidades
                              ? "Carregando cidades..."
                              : "Selecione a cidade"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {cidades.map(cidade => (
                          <SelectItem key={cidade.id} value={cidade.nome || ''}>
                            {cidade.nome}
                          </SelectItem>
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
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Prefeitura Municipal de [Cidade]"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Secretaria Municipal de Saúde"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Informações de Contato</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="saude@cidade.gov.br"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone/Celular *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(11) 99999-4444 ou (11) 3333-4444"
                      maxLength={15}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Fixo: (11) 3333-4444 • Celular: (11) 99999-4444
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Rua das Flores, 123 - Centro"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://cidade.gov.br"
                  />
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Botões */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'edit' ? 'Salvando...' : 'Criando...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'edit' ? 'Salvar Alterações' : 'Criar Organização'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}