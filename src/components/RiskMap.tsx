'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MapPin, 
  Maximize2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { NeighborhoodRisk } from '@/services/firebaseDashboardService';
import dynamic from 'next/dynamic';

// Componente de mapa dinâmico para evitar SSR
const RiskMapComponent = dynamic(() => import('./RiskMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-lg border bg-muted flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-xs text-muted-foreground">Carregando mapa...</p>
      </div>
    </div>
  )
});

interface RiskMapProps {
  neighborhoodRisks: NeighborhoodRisk[];
  className?: string;
}

export default function RiskMap({ neighborhoodRisks, className = "" }: RiskMapProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-25.442868, -49.226276]); // Curitiba
  const [zoom, setZoom] = useState(12);
  const mapRef = useRef<any>(null);

  // Usar dados reais do backend
  const risks = neighborhoodRisks;
  
  console.log('🗺️ RiskMap - Dados recebidos:', {
    neighborhoodRisks: neighborhoodRisks.length,
    risks: risks.length,
    isModalOpen,
    mapCenter,
    zoom
  });

  // Coordenadas aproximadas dos bairros de Curitiba (exemplo)
  const neighborhoodCoordinates: Record<string, [number, number]> = {
    'Centro': [-25.4284, -49.2733],
    'Rebouças': [-25.4350, -49.2600],
    'Jardim Botânico': [-25.4400, -49.2400],
    'Batel': [-25.4300, -49.2800],
    'Mercês': [-25.4250, -49.2700],
    'Cajuru': [-25.4500, -49.2000],
    'Portão': [-25.4600, -49.2200],
    'Boqueirão': [-25.4700, -49.2100],
    'Fazendinha': [-25.4800, -49.1900],
    'Pinheirinho': [-25.4900, -49.1800]
  };

  // Função para obter cor do marcador baseado no risco
  const getRiskColor = (risk: NeighborhoodRisk) => {
    if (risk.larvaeIndex > 4) return 'red';
    if (risk.larvaeIndex > 2) return 'orange';
    if (risk.larvaeIndex > 0) return 'yellow';
    return 'green';
  };

  // Função para obter ícone baseado no risco
  const getRiskIcon = (risk: NeighborhoodRisk) => {
    if (risk.larvaeIndex > 4) return XCircle;
    if (risk.larvaeIndex > 2) return AlertTriangle;
    if (risk.larvaeIndex > 0) return Info;
    return CheckCircle;
  };

  // Função para obter texto do risco
  const getRiskText = (risk: NeighborhoodRisk) => {
    if (risk.larvaeIndex > 4) return 'Crítico';
    if (risk.larvaeIndex > 2) return 'Alto';
    if (risk.larvaeIndex > 0) return 'Médio';
    return 'Baixo';
  };

  // Função para obter cor do badge
  const getRiskBadgeColor = (risk: NeighborhoodRisk) => {
    if (risk.larvaeIndex > 4) return 'bg-red-500 hover:bg-red-600';
    if (risk.larvaeIndex > 2) return 'bg-orange-500 hover:bg-orange-600';
    if (risk.larvaeIndex > 0) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  // Calcular centro do mapa baseado nos bairros
  useEffect(() => {
    if (risks.length > 0) {
      const coordinates = risks
        .map(risk => neighborhoodCoordinates[risk.name])
        .filter(Boolean) as [number, number][];
      
      if (coordinates.length > 0) {
        const avgLat = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
        const avgLng = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
        setMapCenter([avgLat, avgLng]);
      }
    }
  }, [risks]);

  return (
    <>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Mapa de Risco</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full rounded-lg border overflow-hidden">
            <RiskMapComponent
              neighborhoodRisks={risks}
              mapCenter={mapCenter}
              zoom={zoom}
              onMapRef={(ref) => {
                mapRef.current = ref;
              }}
            />
          </div>
          
          {/* Legenda */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Baixo (0%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Médio (1-2%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Alto (3-4%)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Crítico (&gt;4%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal com mapa expandido */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-0 flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Mapa de Risco - Visualização Expandida</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 p-6 pt-0 flex flex-col min-h-0">
            <div className="flex-1 w-full rounded-lg border overflow-hidden min-h-0">
              {risks.length > 0 ? (
                <RiskMapComponent
                  neighborhoodRisks={risks}
                  mapCenter={mapCenter}
                  zoom={zoom}
                  onMapRef={(ref) => {
                    mapRef.current = ref;
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
                    <p className="text-sm text-muted-foreground">
                      Não há dados de risco por bairro para exibir no mapa.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Lista de bairros com riscos */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 flex-shrink-0">
              {risks.map((risk) => {
                const RiskIcon = getRiskIcon(risk);
                return (
                  <div
                    key={risk.name}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <RiskIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{risk.name}</span>
                    </div>
                    <Badge className={getRiskBadgeColor(risk)}>
                      {getRiskText(risk)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
