import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import PhotoUpload from '@/components/PhotoUpload';
import VisitDetailsModal from '@/components/VisitDetailsModal';
import FirebaseStatus from '@/components/FirebaseStatus';

import { 
  MapPin, 
  Clock, 
  Save, 
  Plus,
  FileText,
  Camera,
  Droplets,
  Bug,
  AlertTriangle,
  Home,
  Building,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  WifiOff,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  LocationData, 
  RoutineVisitForm, 
  LIRAAVisitForm, 
  CreateRoutineVisitRequest, 
  CreateLIRAAVisitRequest 
} from '@/types/visits';
import { useVisits } from '@/hooks/useVisits';
import LocationStatus from '@/components/LocationStatus';
import InteractiveMap from '@/components/InteractiveMap';
import GPSPermissionHelper from '@/components/GPSPermissionHelper';
import { visitsService } from '@/services/visitsService';
import { geocodingService } from '@/services/geocodingService';
import { firebaseVisitsService } from '@/services/firebaseVisitsService';
import logger from '@/lib/logger';

export default function Visits() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('new');
  const [visitType, setVisitType] = useState<'routine' | 'liraa'>('routine');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<RoutineVisitForm | LIRAAVisitForm | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [visitPhotos, setVisitPhotos] = useState<string[]>([]);
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState<string[]>([]);
  
  // Hook para gerenciar visitas
  const { visits: savedVisits, syncVisits, getStats, loadVisits } = useVisits();
  
  const [routineForm, setRoutineForm] = useState<Partial<RoutineVisitForm>>({
    type: 'routine',
    timestamp: new Date(),
    neighborhood: '',
    observations: '',
    breedingSites: {
      waterReservoir: false,
      tires: false,
      bottles: false,
      cans: false,
      buckets: false,
      plantPots: false,
      gutters: false,
      pools: false,
      wells: false,
      tanks: false,
      drains: false,
      others: ''
    },
    larvaeFound: false,
    pupaeFound: false,
    controlMeasures: []
  });

  const [liraaForm, setLIRAAForm] = useState<Partial<LIRAAVisitForm>>({
    type: 'liraa',
    timestamp: new Date(),
    neighborhood: '',
    observations: '',
    propertyType: 'residential',
    inspected: true,
    refused: false,
    closed: false,
    containers: { a1: 0, a2: 0, b: 0, c: 0, d1: 0, d2: 0, e: 0 },
    positiveContainers: { a1: 0, a2: 0, b: 0, c: 0, d1: 0, d2: 0, e: 0 },
    larvaeSpecies: [],
    treatmentApplied: false,
    eliminationAction: false
  });



  const controlMeasures = [
    'Orientação ao morador',
    'Remoção de criadouros',
    'Aplicação de larvicida',
    'Vedação de reservatórios',
    'Limpeza de calhas',
    'Eliminação de água parada',
    'Notificação de foco'
  ];

  const larvaeSpecies = [
    'Aedes aegypti',
    'Aedes albopictus', 
    'Culex quinquefasciatus',
    'Anopheles darlingi',
    'Outros'
  ];

  // Função para converter fotos em base64
  const convertPhotosToBase64 = (photos: any[]): Promise<string[]> => {
    return Promise.all(
      photos.map((photo) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(photo.file);
        });
      })
    );
  };

  // Função para lidar com mudanças nas fotos
  const handlePhotosChange = useCallback(async (photos: any[]) => {
    try {
      const base64Photos = await convertPhotosToBase64(photos);
      setVisitPhotos(base64Photos);
    } catch (error) {
      logger.error('Erro ao converter fotos:', error);
    }
  }, []);

  // Função para lidar com URLs das fotos enviadas
  const handleUploadUrls = useCallback((urls: string[]) => {
    setUploadedPhotoUrls(urls);
  }, []);

  // Função para capturar localização atual
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
            address: 'Capturando endereço...'
          };

          // Obter endereço real via geocoding
          try {
            logger.log('🌍 Obtendo endereço real para:', location.latitude, location.longitude);
            const geocodingResult = await geocodingService.getAddressFromCoordinatesWithCache(
              location.latitude, 
              location.longitude
            );
            
            // Usar endereço completo ou fallback
            location.address = geocodingResult.fullAddress || geocodingResult.address;
            
            // Incluir dados do geocoding para os cards (se disponível)
            if (geocodingResult.street && geocodingResult.city) {
              location.geocodingData = {
                street: geocodingResult.street || '',
                houseNumber: geocodingResult.number || '',
                neighborhood: geocodingResult.neighborhood || '',
                city: geocodingResult.city || '',
                state: geocodingResult.state || '',
                country: 'Brasil',
                postcode: geocodingResult.postalCode || '',
                fullAddress: geocodingResult.fullAddress
              };
            }
            
            logger.log('✅ Endereço real obtido:', location.address);
            logger.log('📋 Dados do geocoding:', location.geocodingData);
            
            // Preencher automaticamente o bairro baseado na localização GPS
            const autoNeighborhood = geocodingResult.neighborhood || 
              (geocodingResult.address.includes('Cajuru') ? 'Cajuru' : 
               geocodingResult.address.includes('Centro') ? 'Centro' : 
               'Bairro não identificado');
            
            // Update forms with current timestamp, location and auto-filled neighborhood
            const now = new Date();
            setRoutineForm(prev => ({ ...prev, timestamp: now, location, neighborhood: autoNeighborhood }));
            setLIRAAForm(prev => ({ ...prev, timestamp: now, location, neighborhood: autoNeighborhood }));
          } catch (error) {
            logger.warn('⚠️ Falha no geocoding, usando fallback:', error);
            // Fallback para coordenadas se geocoding falhar
            location.address = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
            
            // Update forms with current timestamp and location (sem bairro)
            const now = new Date();
            setRoutineForm(prev => ({ ...prev, timestamp: now, location }));
            setLIRAAForm(prev => ({ ...prev, timestamp: now, location }));
          }

          setCurrentLocation(location);
          setIsGettingLocation(false);
        },
        (error) => {
          logger.warn('Geolocation error:', error);
          setIsGettingLocation(false);
          
          let errorMessage = "Erro desconhecido";
          let errorDescription = "Tente novamente mais tarde.";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Permissão de localização negada";
              errorDescription = "Clique no ícone de localização na barra de endereços e permita o acesso, ou vá em Configurações > Privacidade > Localização.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "GPS indisponível";
              errorDescription = "Verifique se o GPS está ativado no seu dispositivo e se você está em uma área aberta.";
              break;
            case error.TIMEOUT:
              errorMessage = "Timeout do GPS";
              errorDescription = "O GPS demorou muito para responder. Tente novamente em uma área mais aberta.";
              break;
          }
          
          // Fallback for offline or permission denied
          const now = new Date();
          setRoutineForm(prev => ({ ...prev, timestamp: now }));
          setLIRAAForm(prev => ({ ...prev, timestamp: now }));
          
          toast({
            title: errorMessage,
            description: errorDescription,
            variant: "destructive",
            duration: 8000
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutos
        }
      );
    }
  };

  // Auto-capture location and timestamp
  useEffect(() => {
    getCurrentLocation();
    
    // Update every minute to keep timestamp current
    const interval = setInterval(getCurrentLocation, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Verificar status de conexão
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await firebaseVisitsService.checkConnectivity();
        setConnectionStatus(isConnected ? 'online' : 'offline');
      } catch (error) {
        setConnectionStatus('offline');
      }
    };

    checkConnection();
    // Verificar a cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      if (!currentLocation) {
        throw new Error('Localização não disponível');
      }

      let newVisit: RoutineVisitForm | LIRAAVisitForm;

      if (visitType === 'routine') {
        const visitData: CreateRoutineVisitRequest = {
          neighborhood: routineForm.neighborhood || 'Bairro não identificado',
          location: currentLocation,
          observations: routineForm.observations || '',
          photos: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : visitPhotos,
          breedingSites: routineForm.breedingSites || {
            waterReservoir: false,
            tires: false,
            bottles: false,
            cans: false,
            buckets: false,
            plantPots: false,
            gutters: false,
            pools: false,
            wells: false,
            tanks: false,
            drains: false,
            others: ''
          },
          larvaeFound: routineForm.larvaeFound || false,
          pupaeFound: routineForm.pupaeFound || false,
          controlMeasures: routineForm.controlMeasures || []
        };

        newVisit = await visitsService.createRoutineVisit(visitData, user as any);
        
        // Reset routine form
        setRoutineForm({
          type: 'routine',
          timestamp: new Date(),
          neighborhood: '',
          observations: '',
          breedingSites: {
            waterReservoir: false,
            tires: false,
            bottles: false,
            cans: false,
            buckets: false,
            plantPots: false,
            gutters: false,
            pools: false,
            wells: false,
            tanks: false,
            drains: false,
            others: ''
          },
          larvaeFound: false,
          pupaeFound: false,
          controlMeasures: []
        });
      } else {
        const visitData: CreateLIRAAVisitRequest = {
          neighborhood: liraaForm.neighborhood || 'Bairro não identificado',
          location: currentLocation,
          observations: liraaForm.observations || '',
          photos: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : visitPhotos,
          propertyType: liraaForm.propertyType || 'residential',
          inspected: liraaForm.inspected || true,
          refused: liraaForm.refused || false,
          closed: liraaForm.closed || false,
          containers: liraaForm.containers || { a1: 0, a2: 0, b: 0, c: 0, d1: 0, d2: 0, e: 0 },
          positiveContainers: liraaForm.positiveContainers || { a1: 0, a2: 0, b: 0, c: 0, d1: 0, d2: 0, e: 0 },
          larvaeSpecies: liraaForm.larvaeSpecies || [],
          treatmentApplied: liraaForm.treatmentApplied || false,
          eliminationAction: liraaForm.eliminationAction || false
        };

        newVisit = await visitsService.createLIRAAVisit(visitData, user as any);
        
        // Reset LIRAa form
        setLIRAAForm({
          type: 'liraa',
          timestamp: new Date(),
          neighborhood: '',
          observations: '',
          propertyType: 'residential',
          inspected: true,
          refused: false,
          closed: false,
          containers: { a1: 0, a2: 0, b: 0, c: 0, d1: 0, d2: 0, e: 0 },
          positiveContainers: { a1: 0, a2: 0, b: 0, c: 0, d1: 0, d2: 0, e: 0 },
          larvaeSpecies: [],
          treatmentApplied: false,
          eliminationAction: false
        });
      }

      // Recarregar a lista de visitas para mostrar a nova visita
      loadVisits();

      // Limpar fotos após salvar
      setVisitPhotos([]);

      toast({
        title: "Visita registrada com sucesso!",
        description: `Visita ${visitType === 'routine' ? 'de rotina' : 'LIRAa'} salva no sistema.`,
      });

      setActiveTab('history');
    } catch (error) {
      toast({
        title: "Erro ao salvar visita",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentForm = visitType === 'routine' ? routineForm : liraaForm;

  // Função para sincronizar visitas
  const handleSyncVisits = async () => {
    setIsSyncing(true);
    try {
      const result = await syncVisits();
      
      if (result.success) {
        if (result.synced === 0 && result.message) {
          toast({
            title: "Sincronização",
            description: result.message,
          });
        } else {
          toast({
            title: "Sincronização concluída!",
            description: `${result.synced} visitas sincronizadas com sucesso.`,
          });
        }
      } else {
        toast({
          title: "Sincronização com problemas",
          description: result.message || `${result.synced} sincronizadas, ${result.errors} com erro.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Obter estatísticas das visitas
  const visitStats = getStats();

  return (
    <>

      <div className="space-y-2 mb-6 ">
        <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
          <MapPin className="h-8 w-8 text-primary" />
          <span>Vigilância Entomológica</span>
        </h1>
        <p className="text-muted-foreground">
          Sistema de campo para coleta de dados conforme diretrizes do Ministério da Saúde
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="new" className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nova Visita</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Histórico ({savedVisits.length})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="new" className="space-y-6 pt-6">
        {/* Status Cards Essenciais */}
        <div className="grid grid-cols-3 gap-4">
          {/* GPS Status */}
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                currentLocation ? 'bg-green-500' : 
                isGettingLocation ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-xs font-medium text-gray-700">GPS</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {currentLocation ? 'Ativo' : 
               isGettingLocation ? 'Capturando...' : 'Indisponível'}
            </p>
          </div>

          {/* Conectividade */}
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                navigator.onLine ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs font-medium text-gray-700">Internet</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {navigator.onLine ? 'Online' : 'Offline'}
            </p>
          </div>

          {/* Coordenadas */}
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Local</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {currentLocation ? 'Capturado' : 'Aguardando...'}
            </p>
          </div>
        </div>

        {/* Helper de Permissões GPS */}
        {!currentLocation && (
          <div className="space-y-4">
            <GPSPermissionHelper 
              onPermissionGranted={getCurrentLocation}
              className="mb-4"
            />
            
            {/* Botão para tentar capturar GPS */}
            <div className="text-center">
              <Button 
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                variant="outline"
                className="w-full max-w-sm"
              >
                {isGettingLocation ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Capturando GPS...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Tentar Capturar GPS
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Mapa Interativo */}
        <InteractiveMap
          currentLocation={currentLocation}
          onLocationUpdate={async (newLocation) => {
            setCurrentLocation(newLocation);
            
            // Obter bairro automaticamente via geocoding
            try {
              const geocodingResult = await geocodingService.getAddressFromCoordinatesWithCache(
                newLocation.latitude, 
                newLocation.longitude
              );
              
              const autoNeighborhood = geocodingResult.neighborhood || 
                (geocodingResult.address.includes('Cajuru') ? 'Cajuru' : 
                 geocodingResult.address.includes('Centro') ? 'Centro' : 
                 'Bairro não identificado');
              
              // Atualizar formulários com nova localização e bairro
              setRoutineForm(prev => ({ ...prev, location: newLocation, neighborhood: autoNeighborhood }));
              setLIRAAForm(prev => ({ ...prev, location: newLocation, neighborhood: autoNeighborhood }));
            } catch (error) {
              logger.warn('⚠️ Falha ao obter bairro via geocoding:', error);
              // Atualizar apenas com localização
              setRoutineForm(prev => ({ ...prev, location: newLocation }));
              setLIRAAForm(prev => ({ ...prev, location: newLocation }));
            }
          }}
          isGettingLocation={isGettingLocation}
          onRefreshLocation={getCurrentLocation}
        />

        {/* Visit Type Selection */}
        <Card>
            <CardHeader>
              <CardTitle>Tipo de Visita</CardTitle>
              <CardDescription>
                Selecione o tipo de levantamento a ser realizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={visitType} onValueChange={(value: 'routine' | 'liraa') => setVisitType(value)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                    <RadioGroupItem value="routine" id="routine" />
                    <Label htmlFor="routine" className="cursor-pointer flex-1">
                      <div className="flex items-center space-x-3">
                        <Home className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Visita de Rotina</p>
                          <p className="text-sm text-muted-foreground">Pesquisa de criadouros e controle vetorial</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                    <RadioGroupItem value="liraa" id="liraa" />
                    <Label htmlFor="liraa" className="cursor-pointer flex-1">
                      <div className="flex items-center space-x-3">
                        <Bug className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">LIRAa</p>
                          <p className="text-sm text-muted-foreground">Levantamento de Índice Rápido para Aedes aegypti</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Auto-captured Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Informações Automáticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data e Horário</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">
                        {format(currentForm.timestamp || new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">Capturado automaticamente</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Localização GPS</Label>
                    {currentLocation ? (
                      <div className="grid grid-cols-2 gap-3">
                        {/* Cidade */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-600 font-medium mb-1">Cidade</p>
                          <p className="text-sm font-semibold text-blue-900">
                            {currentLocation.geocodingData?.city || 'Cidade'}
                          </p>
                        </div>
                        
                        {/* Bairro */}
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs text-green-600 font-medium mb-1">Bairro</p>
                          <p className="text-sm font-semibold text-green-900">
                            {currentLocation.geocodingData?.neighborhood || 'Bairro'}
                          </p>
                        </div>
                        
                        {/* Rua */}
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-xs text-purple-600 font-medium mb-1">Rua</p>
                          <p className="text-sm font-semibold text-purple-900">
                            {currentLocation.geocodingData?.street || 'Rua'}
                          </p>
                        </div>
                        
                        {/* Número */}
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-xs text-orange-600 font-medium mb-1">Número</p>
                          <p className="text-sm font-semibold text-orange-900">
                            {currentLocation.geocodingData?.houseNumber || 'Número'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Capturando localização...</p>
                      </div>
                    )}
                  </div>
                </div>


              </CardContent>
            </Card>

            {/* Visit Type Specific Forms */}
            {visitType === 'routine' ? (
              <RoutineVisitFormContent 
                form={routineForm}
                setForm={setRoutineForm}
                controlMeasures={controlMeasures}
              />
            ) : (
              <LIRAAFormContent 
                form={liraaForm}
                setForm={setLIRAAForm}
                larvaeSpecies={larvaeSpecies}
              />
            )}

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Evidências Fotográficas</span>
                </CardTitle>
                <CardDescription>
                  Registre fotos dos criadouros e ações realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoUpload 
                  maxPhotos={5} 
                  onPhotosChange={handlePhotosChange}
                  onUploadUrls={handleUploadUrls}
                  visitId={currentLocation ? 'temp-visit-id' : undefined}
                  autoUpload={false}
                />
              </CardContent>
            </Card>

            {/* Observations */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={currentForm.observations}
                  onChange={(e) => {
                    if (visitType === 'routine') {
                      setRoutineForm(prev => ({ ...prev, observations: e.target.value }));
                    } else {
                      setLIRAAForm(prev => ({ ...prev, observations: e.target.value }));
                    }
                  }}
                  placeholder="Observações adicionais sobre a visita..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={isSubmitting} className="min-w-32">
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Salvar Visita</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

      <TabsContent value="history" className="space-y-4 pt-6">
          {/* Estatísticas e Sincronização */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{visitStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total de Visitas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{visitStats.routine}</p>
                    <p className="text-xs text-muted-foreground">Rotina</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bug className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{visitStats.liraa}</p>
                    <p className="text-xs text-muted-foreground">LIRAa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{visitStats.pendingSync}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão de Sincronização */}
          {visitStats.pendingSync > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sincronização Pendente</h3>
                    <p className="text-sm text-muted-foreground">
                      {visitStats.pendingSync} visitas aguardando sincronização com o servidor
                    </p>
                  </div>
                  <Button onClick={handleSyncVisits} disabled={isSyncing} className="flex items-center space-x-2">
                    {isSyncing ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <VisitHistory 
            visits={savedVisits} 
            onVisitClick={(visit) => {
              setSelectedVisit(visit);
              setIsDetailsModalOpen(true);
            }}
            onVisitUpdated={loadVisits}
            user={user}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes da Visita */}
      <VisitDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedVisit(null);
        }}
        visit={selectedVisit}
      />
    </>
  );
}

// Routine Visit Form Component
function RoutineVisitFormContent({ 
  form, 
  setForm, 
  controlMeasures 
}: { 
  form: Partial<RoutineVisitForm>; 
  setForm: React.Dispatch<React.SetStateAction<Partial<RoutineVisitForm>>>; 
  controlMeasures: string[];
}) {
  const breedingSiteOptions = [
    { key: 'waterReservoir', label: 'Reservatórios de água', icon: Droplets },
    { key: 'tires', label: 'Pneus', icon: Zap },
    { key: 'bottles', label: 'Garrafas/Recipientes', icon: Building },
    { key: 'cans', label: 'Latas/Embalagens', icon: Building },
    { key: 'buckets', label: 'Baldes/Bacias', icon: Droplets },
    { key: 'plantPots', label: 'Vasos de plantas', icon: Home },
    { key: 'gutters', label: 'Calhas/Lajes', icon: Building },
    { key: 'pools', label: 'Piscinas/Fontes', icon: Droplets },
    { key: 'wells', label: 'Poços/Cisternas', icon: Droplets },
    { key: 'tanks', label: 'Caixas d\'água', icon: Droplets },
    { key: 'drains', label: 'Ralos/Bueiros', icon: Building }
  ];

  return (
    <>
      {/* Breeding Sites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="h-5 w-5" />
            <span>Tipos de Criadouros Encontrados</span>
          </CardTitle>
          <CardDescription>
            Marque os tipos de criadouros identificados no local (conforme Manual MS)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {breedingSiteOptions.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={Boolean(form.breedingSites![key as keyof typeof form.breedingSites])}
                  onCheckedChange={(checked) => {
                    setForm(prev => ({
                      ...prev,
                      breedingSites: {
                        ...prev.breedingSites!,
                        [key]: checked as boolean
                      }
                    }));
                  }}
                />
                <Label htmlFor={key} className="flex items-center space-x-2 cursor-pointer">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </Label>
              </div>
            ))}
          </div>
          
          <div className="mt-4 space-y-2">
            <Label htmlFor="others">Outros criadouros</Label>
            <Input
              id="others"
              value={form.breedingSites!.others || ''}
              onChange={(e) => setForm(prev => ({
                ...prev,
                breedingSites: { ...prev.breedingSites!, others: e.target.value }
              }))}
              placeholder="Descreva outros tipos de criadouros encontrados"
            />
          </div>
        </CardContent>
      </Card>

      {/* Larvae and Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <span>Presença de Larvas e Controle</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="larvaeFound"
                checked={form.larvaeFound || false}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, larvaeFound: checked as boolean }))}
              />
              <Label htmlFor="larvaeFound">Larvas encontradas</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pupaeFound"
                checked={form.pupaeFound || false}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, pupaeFound: checked as boolean }))}
              />
              <Label htmlFor="pupaeFound">Pupas encontradas</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Medidas de controle aplicadas</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {controlMeasures.map(measure => (
                <div key={measure} className="flex items-center space-x-2">
                  <Checkbox
                    id={measure}
                    checked={form.controlMeasures!.includes(measure) || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setForm(prev => ({ 
                          ...prev, 
                          controlMeasures: [...(prev.controlMeasures || []), measure] 
                        }));
                      } else {
                        setForm(prev => ({ 
                          ...prev, 
                          controlMeasures: prev.controlMeasures?.filter(m => m !== measure) || []
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={measure} className="text-sm">{measure}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 O nível de risco será calculado automaticamente com base nos dados inseridos e índices gerados.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// LIRAa Form Component
function LIRAAFormContent({ 
  form, 
  setForm, 
  larvaeSpecies 
}: { 
  form: Partial<LIRAAVisitForm>; 
  setForm: React.Dispatch<React.SetStateAction<Partial<LIRAAVisitForm>>>;
  larvaeSpecies: string[];
}) {
  const containerTypes = [
    { key: 'a1', label: 'A1 – Depósitos de águas elevados (Caixas d\'água, tambores, etc.)' },
    { key: 'a2', label: 'A2 – Depósitos de água a nível de solo (Caixas d\'água, tanques, cisternas, etc)' },
    { key: 'b', label: 'B – Depósitos móveis (Vasos de planta, recipientes, fontes, etc)' },
    { key: 'c', label: 'C – Depósitos fixos (Calhas, lajes, toldos, etc)' },
    { key: 'd1', label: 'D1 – Passíveis de remoção – Pneus e materiais rodantes' },
    { key: 'd2', label: 'D2 – Passíveis de remoção – Outros depósitos (garrafas, plásticos, lixo)' },
    { key: 'e', label: 'E – Naturais (Plantas, buracos em rochas, etc)' }
  ];

  return (
    <>
      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Informações do Imóvel</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de imóvel</Label>
            <Select 
              value={form.propertyType} 
              onValueChange={(value: any) => setForm(prev => ({ ...prev, propertyType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residencial</SelectItem>
                <SelectItem value="commercial">Comercial</SelectItem>
                <SelectItem value="institutional">Institucional</SelectItem>
                <SelectItem value="vacant">Terreno baldio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inspected"
                checked={form.inspected || false}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, inspected: checked as boolean }))}
              />
              <Label htmlFor="inspected">Inspecionado</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="refused"
                checked={form.refused || false}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, refused: checked as boolean }))}
              />
              <Label htmlFor="refused">Recusado</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="closed"
                checked={form.closed || false}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, closed: checked as boolean }))}
              />
              <Label htmlFor="closed">Fechado</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Container Inspection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="h-5 w-5" />
            <span>Inspeção de Recipientes</span>
          </CardTitle>
          <CardDescription>
            Registre a quantidade de recipientes por categoria (conforme LIRAa/MS)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {containerTypes.map(({ key, label }) => (
              <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{label}</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`${key}-total`} className="text-xs">Total:</Label>
                    <Input
                      id={`${key}-total`}
                      type="number"
                      min="0"
                      value={form.containers![key as keyof typeof form.containers] || 0}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        containers: {
                          ...prev.containers!,
                          [key]: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-20"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Positivos para larvas</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`${key}-positive`} className="text-xs">Positivos:</Label>
                    <Input
                      id={`${key}-positive`}
                      type="number"
                      min="0"
                      max={form.containers![key as keyof typeof form.containers] || 0}
                      value={form.positiveContainers![key as keyof typeof form.positiveContainers] || 0}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        positiveContainers: {
                          ...prev.positiveContainers!,
                          [key]: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Species and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <span>Espécies e Ações Realizadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Espécies de larvas identificadas</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {larvaeSpecies.map(species => (
                <div key={species} className="flex items-center space-x-2">
                  <Checkbox
                    id={species}
                    checked={form.larvaeSpecies!.includes(species) || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setForm(prev => ({ 
                          ...prev, 
                          larvaeSpecies: [...(prev.larvaeSpecies || []), species] 
                        }));
                      } else {
                        setForm(prev => ({ 
                          ...prev, 
                          larvaeSpecies: prev.larvaeSpecies?.filter(s => s !== species) || []
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={species} className="text-sm">{species}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="treatmentApplied"
                checked={form.treatmentApplied || false}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, treatmentApplied: checked as boolean }))}
              />
              <Label htmlFor="treatmentApplied">Tratamento aplicado</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="eliminationAction"
                checked={form.eliminationAction || false}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, eliminationAction: checked as boolean }))}
              />
              <Label htmlFor="eliminationAction">Ação de eliminação</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Visit History Component
function VisitHistory({ 
  visits, 
  onVisitClick,
  onVisitUpdated,
  user
}: { 
  visits: (RoutineVisitForm | LIRAAVisitForm)[]; 
  onVisitClick: (visit: RoutineVisitForm | LIRAAVisitForm) => void;
  onVisitUpdated: () => void;
  user: any;
}) {
  // Função para renderizar status de sincronização
  const getSyncStatusBadge = (syncStatus: string, syncError?: string) => {
    switch (syncStatus) {
      case 'synced':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sincronizada
          </Badge>
        );
      case 'syncing':
        return (
          <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Sincronizando
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500">
            <WifiOff className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };
  if (visits.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma visita registrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece registrando sua primeira visita de campo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {visits.map((visit) => (
        <Card key={visit.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onVisitClick(visit)}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-lg">{visit.neighborhood}</h3>
                  {visit.type === 'routine' ? (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0">
                      <Home className="h-3 w-3 mr-1" />
                      Rotina
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                      <Bug className="h-3 w-3 mr-1" />
                      LIRAa
                    </Badge>
                  )}
                  {getSyncStatusBadge(visit.syncStatus, visit.syncError)}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>Clique para ver detalhes</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {visit.location?.address || 'Localização não disponível'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(visit.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                {visit.syncError && (
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-red-500">
                      Erro: {visit.syncError}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const success = await visitsService.retrySyncVisit(visit.id);
                        if (success) {
                          toast({
                            title: "Visita sincronizada!",
                            description: "A visita foi enviada com sucesso para o servidor.",
                          });
                          // Recarregar visitas
                          onVisitUpdated();
                        } else {
                          toast({
                            title: "Erro na sincronização",
                            description: "Não foi possível sincronizar a visita. Tente novamente.",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Tentar Novamente
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Botão de exclusão - só para Supervisores e Administradores */}
              {user?.role && user.role !== 'agent' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async (e) => {
                    e.stopPropagation(); // Evita abrir o modal de detalhes
                    
                    if (confirm(`Tem certeza que deseja excluir esta visita?\n\nBairro: ${visit.neighborhood}\nData: ${format(visit.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n\nEsta ação não pode ser desfeita.`)) {
                      try {
                        await visitsService.deleteVisit(visit.id);
                        toast({
                          title: "Visita excluída!",
                          description: "A visita foi removida do sistema.",
                        });
                        // Recarregar a lista de visitas
                        onVisitUpdated();
                      } catch (error) {
                        toast({
                          title: "Erro ao excluir visita",
                          description: "Não foi possível excluir a visita. Tente novamente.",
                          variant: "destructive"
                        });
                      }
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Agente:</span>
                <p className="font-medium">{visit.agentName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <p className="font-medium">{visit.type === 'routine' ? 'Visita de Rotina' : 'LIRAa'}</p>
              </div>
              {visit.type === 'routine' && (
                <>
                  <div>
                    <span className="text-muted-foreground">Larvas:</span>
                    <p className="font-medium">{visit.larvaeFound ? 'Sim' : 'Não'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risco:</span>
                    <Badge className={"bg-info"}>
                      Em análise
                    </Badge>
                  </div>
                </>
              )}
            </div>

            {visit.observations && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm">{visit.observations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
