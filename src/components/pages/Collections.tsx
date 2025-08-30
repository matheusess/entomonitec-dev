import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { 
  Bug, 
  Calendar as CalendarIcon, 
  Save, 
  Plus,
  FileText,
  Droplets,
  Eye,
  TrendingUp,
  AlertTriangle,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MosquitoSpecies {
  id: string;
  name: string;
  scientificName: string;
  count: number;
  stage: 'egg' | 'larva' | 'pupa' | 'adult';
}

interface CollectionForm {
  date: Date;
  time: string;
  visitId: string;
  trapId: string;
  location: string;
  neighborhood: string;
  waterPresent: boolean;
  waterLevel: 'none' | 'low' | 'medium' | 'high';
  debris: string[];
  mosquitoSpecies: MosquitoSpecies[];
  totalCount: number;
  infestationLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  larvaeCount: number;
  pupaeCount: number;
  adultCount: number;
  observations: string;
  actionsTaken: string[];
  nextVisitDate: Date | null;
  sampleCollected: boolean;
  labAnalysisRequired: boolean;
}

interface SavedCollection extends CollectionForm {
  id: string;
  agentName: string;
  createdAt: Date;
  status: 'pending' | 'processed' | 'completed';
}

export default function Collections() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedCollections, setSavedCollections] = useState<SavedCollection[]>([]);
  
  const [form, setForm] = useState<CollectionForm>({
    date: new Date(),
    time: new Date().toTimeString().slice(0, 5),
    visitId: '',
    trapId: '',
    location: '',
    neighborhood: '',
    waterPresent: false,
    waterLevel: 'none',
    debris: [],
    mosquitoSpecies: [],
    totalCount: 0,
    infestationLevel: 'none',
    larvaeCount: 0,
    pupaeCount: 0,
    adultCount: 0,
    observations: '',
    actionsTaken: [],
    nextVisitDate: null,
    sampleCollected: false,
    labAnalysisRequired: false
  });

  const neighborhoods = [
    'Centro', 'Vila Nova', 'Jardim das Flores', 'Bairro Industrial', 
    'Residencial Norte', 'Vila São José', 'Jardim América', 'Setor Leste'
  ];

  const debrisTypes = [
    'Folhas', 'Galhos', 'Lixo urbano', 'Entulho', 'Água parada', 'Recipientes', 'Pneus', 'Garrafas'
  ];

  const commonSpecies = [
    { name: 'Aedes aegypti', scientificName: 'Aedes aegypti' },
    { name: 'Aedes albopictus', scientificName: 'Aedes albopictus' },
    { name: 'Culex quinquefasciatus', scientificName: 'Culex quinquefasciatus' },
    { name: 'Anopheles darlingi', scientificName: 'Anopheles darlingi' }
  ];

  const actionOptions = [
    'Remoção de criadouros', 'Aplicação de larvicida', 'Orientação aos moradores', 
    'Limpeza do local', 'Substituição da armadilha', 'Coleta de amostra'
  ];

  const infestationLevels = [
    { value: 'none', label: 'Ausente', color: 'bg-gray-500' },
    { value: 'low', label: 'Baixo', color: 'bg-success' },
    { value: 'medium', label: 'Médio', color: 'bg-info' },
    { value: 'high', label: 'Alto', color: 'bg-warning' },
    { value: 'critical', label: 'Crítico', color: 'bg-critical' }
  ];

  const addSpecies = () => {
    const newSpecies: MosquitoSpecies = {
      id: Math.random().toString(36).substring(7),
      name: '',
      scientificName: '',
      count: 0,
      stage: 'larva'
    };
    setForm(prev => ({
      ...prev,
      mosquitoSpecies: [...prev.mosquitoSpecies, newSpecies]
    }));
  };

  const updateSpecies = (id: string, field: keyof MosquitoSpecies, value: any) => {
    setForm(prev => ({
      ...prev,
      mosquitoSpecies: prev.mosquitoSpecies.map(species =>
        species.id === id ? { ...species, [field]: value } : species
      )
    }));
  };

  const removeSpecies = (id: string) => {
    setForm(prev => ({
      ...prev,
      mosquitoSpecies: prev.mosquitoSpecies.filter(species => species.id !== id)
    }));
  };

  const calculateTotalCount = () => {
    const total = form.mosquitoSpecies.reduce((sum, species) => sum + species.count, 0);
    setForm(prev => ({ ...prev, totalCount: total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newCollection: SavedCollection = {
        ...form,
        id: Math.random().toString(36).substring(7),
        agentName: user?.name || '',
        createdAt: new Date(),
        status: 'pending'
      };

      setSavedCollections(prev => [newCollection, ...prev]);
      
      // Reset form
      setForm({
        date: new Date(),
        time: new Date().toTimeString().slice(0, 5),
        visitId: '',
        trapId: '',
        location: '',
        neighborhood: '',
        waterPresent: false,
        waterLevel: 'none',
        debris: [],
        mosquitoSpecies: [],
        totalCount: 0,
        infestationLevel: 'none',
        larvaeCount: 0,
        pupaeCount: 0,
        adultCount: 0,
        observations: '',
        actionsTaken: [],
        nextVisitDate: null,
        sampleCollected: false,
        labAnalysisRequired: false
      });

      toast({
        title: "Coleta registrada com sucesso!",
        description: "Os dados da coleta foram salvos no sistema.",
      });

      setActiveTab('history');
    } catch (error) {
      toast({
        title: "Erro ao salvar coleta",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInfestationBadge = (level: string) => {
    const infestationLevel = infestationLevels.find(l => l.value === level);
    return (
      <Badge className={infestationLevel?.color}>
        {infestationLevel?.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: 'bg-yellow-500' },
      processed: { label: 'Processado', color: 'bg-blue-500' },
      completed: { label: 'Concluído', color: 'bg-green-500' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
          <Bug className="h-8 w-8 text-primary" />
          <span>Registro de Coletas</span>
        </h1>
        <p className="text-muted-foreground">
          Registre coletas entomológicas com dados de infestação e análise detalhada
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nova Coleta</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Histórico ({savedCollections.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5" />
                      <span>Informações Básicas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data da Coleta</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(form.date, "dd/MM/yyyy", { locale: ptBR })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={form.date}
                              onSelect={(date) => date && setForm(prev => ({ ...prev, date }))}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="time">Horário</Label>
                        <Input
                          id="time"
                          type="time"
                          value={form.time}
                          onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="trapId">ID da Armadilha</Label>
                        <Input
                          id="trapId"
                          value={form.trapId}
                          onChange={(e) => setForm(prev => ({ ...prev, trapId: e.target.value }))}
                          placeholder="ARM-001"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Select value={form.neighborhood} onValueChange={(value) => setForm(prev => ({ ...prev, neighborhood: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o bairro" />
                          </SelectTrigger>
                          <SelectContent>
                            {neighborhoods.map(neighborhood => (
                              <SelectItem key={neighborhood} value={neighborhood}>
                                {neighborhood}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Localização Específica</Label>
                      <Input
                        id="location"
                        value={form.location}
                        onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Descrição detalhada do local"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Environmental Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Droplets className="h-5 w-5" />
                      <span>Condições Ambientais</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="waterPresent"
                          checked={form.waterPresent}
                          onCheckedChange={(checked) => setForm(prev => ({ ...prev, waterPresent: checked as boolean }))}
                        />
                        <Label htmlFor="waterPresent">Presença de água</Label>
                      </div>

                      {form.waterPresent && (
                        <div className="space-y-2">
                          <Label>Nível da água</Label>
                          <Select value={form.waterLevel} onValueChange={(value: any) => setForm(prev => ({ ...prev, waterLevel: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baixo</SelectItem>
                              <SelectItem value="medium">Médio</SelectItem>
                              <SelectItem value="high">Alto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Tipos de detritos encontrados</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {debrisTypes.map(debris => (
                            <div key={debris} className="flex items-center space-x-2">
                              <Checkbox
                                id={debris}
                                checked={form.debris.includes(debris)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setForm(prev => ({ ...prev, debris: [...prev.debris, debris] }));
                                  } else {
                                    setForm(prev => ({ ...prev, debris: prev.debris.filter(d => d !== debris) }));
                                  }
                                }}
                              />
                              <Label htmlFor={debris} className="text-sm">{debris}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mosquito Count Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Resumo da Contagem</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="larvaeCount">Larvas</Label>
                        <Input
                          id="larvaeCount"
                          type="number"
                          min="0"
                          value={form.larvaeCount}
                          onChange={(e) => setForm(prev => ({ ...prev, larvaeCount: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pupaeCount">Pupas</Label>
                        <Input
                          id="pupaeCount"
                          type="number"
                          min="0"
                          value={form.pupaeCount}
                          onChange={(e) => setForm(prev => ({ ...prev, pupaeCount: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="adultCount">Adultos</Label>
                        <Input
                          id="adultCount"
                          type="number"
                          min="0"
                          value={form.adultCount}
                          onChange={(e) => setForm(prev => ({ ...prev, adultCount: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Nível de Infestação</Label>
                      <Select value={form.infestationLevel} onValueChange={(value: any) => setForm(prev => ({ ...prev, infestationLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {infestationLevels.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                                <span>{level.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Species Identification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bug className="h-5 w-5" />
                      <span>Identificação de Espécies</span>
                    </CardTitle>
                    <CardDescription>
                      Registre as espécies identificadas e suas quantidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {form.mosquitoSpecies.map((species, index) => (
                      <div key={species.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Espécie {index + 1}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSpecies(species.id)}
                          >
                            Remover
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          <Select
                            value={species.name}
                            onValueChange={(value) => {
                              const selected = commonSpecies.find(s => s.name === value);
                              if (selected) {
                                updateSpecies(species.id, 'name', selected.name);
                                updateSpecies(species.id, 'scientificName', selected.scientificName);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a espécie" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonSpecies.map(spec => (
                                <SelectItem key={spec.name} value={spec.name}>
                                  {spec.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="grid grid-cols-2 gap-2">
                            <Select
                              value={species.stage}
                              onValueChange={(value: any) => updateSpecies(species.id, 'stage', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Estágio" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="egg">Ovo</SelectItem>
                                <SelectItem value="larva">Larva</SelectItem>
                                <SelectItem value="pupa">Pupa</SelectItem>
                                <SelectItem value="adult">Adulto</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Input
                              type="number"
                              min="0"
                              placeholder="Quantidade"
                              value={species.count}
                              onChange={(e) => {
                                updateSpecies(species.id, 'count', parseInt(e.target.value) || 0);
                                calculateTotalCount();
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSpecies}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Espécie
                    </Button>
                  </CardContent>
                </Card>

                {/* Actions and Next Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Realizadas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Ações tomadas no local</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {actionOptions.map(action => (
                          <div key={action} className="flex items-center space-x-2">
                            <Checkbox
                              id={action}
                              checked={form.actionsTaken.includes(action)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setForm(prev => ({ ...prev, actionsTaken: [...prev.actionsTaken, action] }));
                                } else {
                                  setForm(prev => ({ ...prev, actionsTaken: prev.actionsTaken.filter(a => a !== action) }));
                                }
                              }}
                            />
                            <Label htmlFor={action} className="text-sm">{action}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sampleCollected"
                          checked={form.sampleCollected}
                          onCheckedChange={(checked) => setForm(prev => ({ ...prev, sampleCollected: checked as boolean }))}
                        />
                        <Label htmlFor="sampleCollected">Amostra coletada</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="labAnalysisRequired"
                          checked={form.labAnalysisRequired}
                          onCheckedChange={(checked) => setForm(prev => ({ ...prev, labAnalysisRequired: checked as boolean }))}
                        />
                        <Label htmlFor="labAnalysisRequired">Análise laboratorial</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observations">Observações</Label>
                      <Textarea
                        id="observations"
                        value={form.observations}
                        onChange={(e) => setForm(prev => ({ ...prev, observations: e.target.value }))}
                        placeholder="Observações detalhadas sobre a coleta, condições encontradas, etc."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Limpar Formulário
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-32">
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Salvar Coleta</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {savedCollections.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma coleta registrada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece registrando sua primeira coleta entomológica
                </p>
                <Button onClick={() => setActiveTab('new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeira Coleta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {savedCollections.map((collection) => (
                <Card key={collection.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <h3 className="font-medium text-lg flex items-center space-x-2">
                          <span>{collection.neighborhood}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{collection.trapId}</span>
                        </h3>
                        <p className="text-sm text-muted-foreground">{collection.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(collection.date, "dd/MM/yyyy", { locale: ptBR })} às {collection.time}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {getInfestationBadge(collection.infestationLevel)}
                        {getStatusBadge(collection.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">Total de mosquitos:</span>
                        <p className="font-medium">{collection.totalCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Larvas:</span>
                        <p className="font-medium">{collection.larvaeCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pupas:</span>
                        <p className="font-medium">{collection.pupaeCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Adultos:</span>
                        <p className="font-medium">{collection.adultCount}</p>
                      </div>
                    </div>

                    {collection.mosquitoSpecies.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Espécies identificadas:</h4>
                        <div className="flex flex-wrap gap-2">
                          {collection.mosquitoSpecies.map((species, index) => (
                            <Badge key={index} variant="outline">
                              {species.name} ({species.count})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {collection.observations && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm">{collection.observations}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
