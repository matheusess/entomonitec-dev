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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { toast } from '@/hooks/use-toast';
import { 
  Plus,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  MapPin as LocationIcon,
  Save,
  X,
  Activity,
  Check
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
    department: string;
    phone: string;
    email: string;
    address?: string;
    website?: string;
    neighborhoods: string[];
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
  const [currentTab, setCurrentTab] = useState('basic');

  // Hook para dados do Brasil Aberto
  const {
    estados,
    cidades,
    bairros,
    isLoadingEstados,
    isLoadingCidades,
    isLoadingBairros,
    fetchCidadesByEstado,
    fetchBairrosByCidade
  } = useBrazilianLocations();

  // Form data
  const [formData, setFormData] = useState({
    // Informações básicas
    name: '',
    fullName: '',
    state: '',
    department: 'Secretaria Municipal de Saúde',

    // Contato
    phone: '',
    email: '',
    address: '',
    website: '',

    // Bairros
    neighborhoods: [] as string[],
  });

  // Popular dados quando em modo de edição
  useEffect(() => {
    if (mode === 'edit' && editingOrganization) {
      console.log('🔧 Carregando dados para edição:', editingOrganization);
      
      setFormData({
        name: editingOrganization.name,
        fullName: editingOrganization.fullName,
        state: editingOrganization.state,
        department: editingOrganization.department,
        phone: editingOrganization.phone,
        email: editingOrganization.email,
        address: editingOrganization.address || '',
        website: editingOrganization.website || '',
        neighborhoods: editingOrganization.neighborhoods,
      });
      
      // Carregar cidades do estado
      if (editingOrganization.state) {
        console.log('🏙️ Carregando cidades do estado:', editingOrganization.state);
        fetchCidadesByEstado(editingOrganization.state);
      }
    }
  }, [mode, editingOrganization]);

  // Carregar bairros quando cidades são carregadas (para modo edição)
  useEffect(() => {
    if (mode === 'edit' && cidades.length > 0) {
      // Para edição, vamos carregar bairros das principais cidades do estado
      console.log('🏘️ Carregando bairros das principais cidades para edição');
      
      // Carregar bairros das 3 primeiras cidades (principais)
      const cidadesPrincipais = cidades.slice(0, 3);
      cidadesPrincipais.forEach((cidade, index) => {
        setTimeout(() => {
          console.log(`📍 Carregando bairros da cidade ${cidade.nome}`);
          fetchBairrosByCidade(cidade.id);
        }, index * 500); // Espaçar as requisições
      });
      
      // Definir a primeira cidade como selecionada
      if (cidades[0]) {
        setSelectedCidadeId(cidades[0].id);
      }
    }
  }, [cidades, mode, editingOrganization]);

  const [selectedCidadeId, setSelectedCidadeId] = useState<number | null>(null);
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [isNeighborhoodPopoverOpen, setIsNeighborhoodPopoverOpen] = useState(false);
  const [neighborhoodSearchTerm, setNeighborhoodSearchTerm] = useState('');

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

  // Quando a cidade muda, buscar bairros
  const handleCidadeChange = (cidadeNome: string) => {
    handleInputChange('name', cidadeNome);
    
    const cidade = cidades.find(c => c.nome === cidadeNome);
    if (cidade) {
      setSelectedCidadeId(cidade.id);
      fetchBairrosByCidade(cidade.id);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addNeighborhood = () => {
    if (newNeighborhood.trim() && !formData.neighborhoods.includes(newNeighborhood.trim())) {
      setFormData(prev => ({
        ...prev,
        neighborhoods: [...prev.neighborhoods, newNeighborhood.trim()]
      }));
      setNewNeighborhood('');
    }
  };

  const removeNeighborhood = (index: number) => {
    setFormData(prev => ({
      ...prev,
      neighborhoods: prev.neighborhoods.filter((_, i) => i !== index)
    }));
  };

    // Função para obter TODOS os bairros disponíveis da API Brasil Aberto
  const getAllAvailableNeighborhoods = () => {
    console.log('🔍 getAllAvailableNeighborhoods chamada');
    console.log('📊 Bairros da API:', bairros.length);
    console.log('🏙️ Cidade selecionada:', formData.name);
    console.log('⚙️ Modo:', mode);
    
    // No modo de edição, permitir busca mesmo sem cidade selecionada
    const canShowNeighborhoods = mode === 'edit' || formData.name;
    
    if (!canShowNeighborhoods) {
      console.log('❌ Não pode mostrar bairros - cidade não selecionada');
      return [];
    }
    
    // Filtrar bairros por termo de busca e remover já selecionados
    const filtered = bairros
      .filter(bairro => 
        (bairro.nome || '').toLowerCase().includes(neighborhoodSearchTerm.toLowerCase()) &&
        !formData.neighborhoods.includes(bairro.nome || '')
      )
      .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    
    console.log('✅ Bairros filtrados:', filtered.length);
    return filtered;
  };

  const addNeighborhoodFromSearch = (neighborhoodName: string) => {
    if (!formData.neighborhoods.includes(neighborhoodName)) {
      setFormData(prev => ({
        ...prev,
        neighborhoods: [...prev.neighborhoods, neighborhoodName]
      }));
    }
    setNeighborhoodSearchTerm('');
    setIsNeighborhoodPopoverOpen(false);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Nome da cidade é obrigatório';
    if (!formData.fullName.trim()) return 'Nome completo é obrigatório';
    if (!formData.state) return 'Estado é obrigatório';
    if (!formData.email.trim()) return 'Email é obrigatório';
    if (!formData.phone.trim()) return 'Telefone é obrigatório';
    if (formData.neighborhoods.length === 0) return 'Pelo menos um bairro é obrigatório';
    
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
        department: formData.department,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        website: formData.website,
        neighborhoods: formData.neighborhoods
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
        department: 'Secretaria Municipal de Saúde',
        phone: '',
        email: '',
        address: '',
        website: '',
        neighborhoods: []
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

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="config">Bairros</TabsTrigger>
          </TabsList>

          {/* Tab Básico */}
          <TabsContent value="basic" className="space-y-4">
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
          </TabsContent>

          {/* Tab Bairros */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Bairros da Cidade</span>
                </CardTitle>
                <CardDescription>
                  Adicione os bairros que serão monitorados pelo sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Autocomplete completo de bairros */}
                <div className="space-y-3">
                  <Label>Buscar e Adicionar Bairro</Label>
                  <div className="flex space-x-2">
                    <Popover open={isNeighborhoodPopoverOpen} onOpenChange={setIsNeighborhoodPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isNeighborhoodPopoverOpen}
                          className="flex-1 justify-between"
                          onClick={() => {
                            console.log('🔘 Botão de busca clicado');
                            console.log('📊 Estado atual:', { 
                              isOpen: isNeighborhoodPopoverOpen, 
                              cidade: formData.name,
                              bairros: bairros.length 
                            });
                          }}
                        >
                          {neighborhoodSearchTerm || "Buscar em todos os bairros disponíveis..."}
                          <MapPin className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Digite para buscar bairros..." 
                            value={neighborhoodSearchTerm}
                            onValueChange={setNeighborhoodSearchTerm}
                          />
                          <CommandList className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>
                              <div className="py-4 text-center">
                                <p className="text-sm text-gray-500">
                                  {neighborhoodSearchTerm 
                                    ? `Nenhum bairro encontrado para "${neighborhoodSearchTerm}"`
                                    : "Digite para buscar bairros"
                                  }
                                </p>
                                {neighborhoodSearchTerm && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="mt-2"
                                    onClick={() => {
                                      if (neighborhoodSearchTerm.trim()) {
                                        addNeighborhoodFromSearch(neighborhoodSearchTerm.trim());
                                      }
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Criar "{neighborhoodSearchTerm}"
                                  </Button>
                                )}
                              </div>
                            </CommandEmpty>
                            
                            {/* Lista completa de bairros da API Brasil Aberto */}
                            {(() => {
                              const availableNeighborhoods = getAllAvailableNeighborhoods();
                              
                              return (
                                <>
                                  {/* Bairros da API */}
                                  {availableNeighborhoods.length > 0 && (
                                    <CommandGroup heading={`Bairros de ${formData.name} (${availableNeighborhoods.length})`}>
                                      {availableNeighborhoods.map((bairro) => (
                                        <CommandItem
                                          key={bairro.id}
                                          value={bairro.nome || ''}
                                          onSelect={() => addNeighborhoodFromSearch(bairro.nome || '')}
                                          className="cursor-pointer"
                                        >
                                          <MapPin className="mr-2 h-4 w-4 text-green-500" />
                                          <span className="flex-1">{bairro.nome}</span>
                                          <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                                            Oficial
                                          </Badge>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  )}
                                  
                                  {/* Mostrar mensagem se não há bairros */}
                                  {availableNeighborhoods.length === 0 && !neighborhoodSearchTerm && (
                                    <div className="py-4 text-center text-sm text-gray-500">
                                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                      <p>
                                        {mode === 'edit' && !formData.name 
                                          ? `${isLoadingBairros ? 'Carregando bairros...' : 'Digite para buscar bairros'}`
                                          : formData.name 
                                            ? `${isLoadingBairros ? 'Carregando bairros...' : 'Nenhum bairro encontrado para esta cidade'}`
                                            : 'Selecione uma cidade primeiro para ver os bairros'
                                        }
                                      </p>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    {/* Botão para adicionar manualmente */}
                    <Button 
                      type="button" 
                      size="sm"
                      onClick={() => {
                        if (neighborhoodSearchTerm.trim()) {
                          addNeighborhoodFromSearch(neighborhoodSearchTerm.trim());
                        } else {
                          setIsNeighborhoodPopoverOpen(true);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    🔍 Clique para ver todos os bairros disponíveis ou digite para filtrar
                  </p>
                </div>

                {formData.neighborhoods.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum bairro adicionado ainda</p>
                    <p className="text-sm">Adicione pelo menos um bairro para continuar</p>
                    {selectedCidadeId && isLoadingBairros && (
                      <p className="text-sm text-blue-600 mt-2">Carregando bairros oficiais...</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Bairros Selecionados ({formData.neighborhoods.length})</Label>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, neighborhoods: [] }))}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpar Todos
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.neighborhoods.map((neighborhood, index) => {
                        const isFromAPI = bairros.some(b => b.nome === neighborhood);
                        
                        return (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-2 flex-1">
                              <MapPin className={`h-4 w-4 flex-shrink-0 ${isFromAPI ? 'text-green-500' : 'text-gray-500'}`} />
                              
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {neighborhood}
                              </span>
                              
                              <Badge variant="outline" className={`text-xs flex-shrink-0 ${
                                isFromAPI 
                                  ? 'bg-green-50 text-green-600 border-green-200' 
                                  : 'bg-gray-50 text-gray-600 border-gray-200'
                              }`}>
                                {isFromAPI ? 'Oficial' : 'Personalizado'}
                              </Badge>
                            </div>
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNeighborhood(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2 flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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