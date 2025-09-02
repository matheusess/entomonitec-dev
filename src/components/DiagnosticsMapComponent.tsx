'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NeighborhoodRisk } from '@/services/firebaseDashboardService';
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import HeatmapLayer from './HeatmapLayer';
import MapTileSelector, { MapTileLayer, mapTileOptions } from './MapTileSelector';

// Fix para ícones do Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DiagnosticsMapComponentProps {
  neighborhoodRisks: NeighborhoodRisk[];
  mapCenter: [number, number];
  zoom: number;
  onMapRef: (ref: any) => void;
}

export default function DiagnosticsMapComponent({ 
  neighborhoodRisks, 
  mapCenter, 
  zoom, 
  onMapRef 
}: DiagnosticsMapComponentProps) {
  const mapRef = useRef<any>(null);
  const [selectedTile, setSelectedTile] = useState(mapTileOptions[0]); // CartoDB Voyager por padrão

  useEffect(() => {
    if (mapRef.current) {
      onMapRef(mapRef.current);
    }
  }, [onMapRef]);

  // Função para obter coordenadas reais das visitas por bairro
  const getNeighborhoodCoordinates = (risk: NeighborhoodRisk): [number, number] | null => {
    // Usar coordenadas reais das visitas se disponíveis
    if (risk.coordinates) {
      console.log(`📍 Usando coordenadas reais para ${risk.name}:`, risk.coordinates);
      return risk.coordinates;
    }
    
    // Fallback para coordenadas aproximadas se não houver coordenadas reais
    const fallbackCoordinates: Record<string, [number, number]> = {
      // Bairros de Curitiba
      'Centro CWB': [-25.4284, -49.2733],
      'Rebouças': [-25.4350, -49.2600],
      'Jardim Botânico': [-25.4400, -49.2400],
      'Batel': [-25.4300, -49.2800],
      'Mercês': [-25.4250, -49.2700],
      'Cajuru': [-25.4500, -49.2000],
      'Portão': [-25.4600, -49.2200],
      'Boqueirão': [-25.4700, -49.2100],
      'Fazendinha': [-25.4800, -49.1900],
      'Pinheirinho': [-25.4900, -49.1800],
      'Santa Felicidade': [-25.4200, -49.2500],
      'Água Verde': [-25.4400, -49.2700],
      'Bigorrilho': [-25.4300, -49.2900],
      'Campo Comprido': [-25.4500, -49.2500],
      'Capão Raso': [-25.4600, -49.2400],
      'Cidade Industrial': [-25.5000, -49.1700],
      'Cidade Industrial de Curitiba': [-25.5000, -49.1700],
      'Fanny': [-25.4700, -49.2000],
      'Guaíra': [-25.4800, -49.2100],
      'Hauer': [-25.4600, -49.2300],
      'Juvevê': [-25.4200, -49.2600],
      'Lindóia': [-25.4400, -49.1900],
      'Novo Mundo': [-25.4300, -49.2000],
      'Pilarzinho': [-25.4100, -49.2500],
      'Santo Inácio': [-25.4500, -49.2800],
      'São Braz': [-25.4100, -49.2400],
      'São Francisco': [-25.4000, -49.2600],
      'São João': [-25.4000, -49.2500],
      'São Lourenço': [-25.3900, -49.2400],
      'São Miguel': [-25.3900, -49.2500],
      'Tatuquara': [-25.5200, -49.1600],
      'Uberaba': [-25.5100, -49.1500],
      'Umbará': [-25.5000, -49.1400],
      'Vila Izabel': [-25.4200, -49.2800],
      'Xaxim': [-25.4700, -49.1800],
      'Ahú': [-25.4150, -49.2700],
      'Bairro não identificado': [-25.4300, -49.2500],
      'Seminário': [-25.4200, -49.2500],
      
      // Bairros de Quatro Barras (coordenadas reais da Google Maps API)
      'Centro': [-25.3639, -49.0754], // Centro de Quatro Barras
      'Vila Nova': [-25.3688, -49.0753], // Vila Nova, Quatro Barras
      'Jardim das Flores': [-25.3592, -49.2202], // Jardim das Flores (Colombo)
      'Bairro Industrial': [-25.3688, -49.0753], // Bairro Industrial, Quatro Barras
      'Residencial Norte': [-25.3688, -49.0753], // Residencial Norte, Quatro Barras
      'Vila São José': [-25.3649, -49.1550], // Vila São José (Colombo)
      'Jardim América': [-25.3688, -49.0753], // Jardim América, Quatro Barras
      'Setor Leste': [-25.3688, -49.0753] // Setor Leste, Quatro Barras
    };
    
    const fallback = fallbackCoordinates[risk.name];
    if (fallback) {
      console.log(`⚠️ Usando coordenadas fallback para ${risk.name}:`, fallback);
      return fallback;
    }
    
    console.log(`❌ Nenhuma coordenada encontrada para ${risk.name}`);
    return null;
  };

  // Gerar dados para o mapa de calor usando coordenadas reais
  const heatmapData = neighborhoodRisks.map((risk) => {
    const coordinates = getNeighborhoodCoordinates(risk);
    if (!coordinates) {
      console.log('❌ Coordenadas não encontradas para:', risk.name);
      return null;
    }
    
    console.log('✅ Processando bairro:', risk.name, 'Coordenadas:', coordinates, 'Índice:', risk.larvaeIndex);
    // Usar o larvaeIndex como intensidade (0-100%)
    return [coordinates[0], coordinates[1], risk.larvaeIndex] as [number, number, number];
  }).filter(Boolean) as Array<[number, number, number]>;

  console.log('🗺️ Dados do heatmap:', heatmapData);

  // Função para criar ícone customizado baseado na prioridade (alinhado com legenda do lado direito)
  const createCustomIcon = (risk: NeighborhoodRisk) => {
    const priority = getPriority(risk);
    let color = '#10b981'; // verde padrão
    
    if (priority <= 2) color = '#7f1d1d';      // Crítico (Prioridade 1-2) - vermelho escuro
    else if (priority <= 4) color = '#ea580c'; // Alto Risco (Prioridade 3-4) - laranja
    else if (priority <= 6) color = '#d97706'; // Atenção (Prioridade 5-6) - âmbar
    else if (priority === 7) color = '#2563eb'; // Baixo Risco (Prioridade 7) - azul
    else color = '#10b981';                    // Controlado (Prioridade 8) - verde

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
          <text x="12.5" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${priority}</text>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
    });
  };

  // Função para calcular prioridade baseada nos critérios do MS
  const getPriority = (risk: NeighborhoodRisk) => {
    const hasInfestation = risk.larvaeIndex > 0;
    const infestationLevel = risk.larvaeIndex;
    const coverage = risk.coverage;
    const qualityScore = ((risk.visitedProperties - risk.refusedAccess - risk.incompleteData) / risk.visitedProperties) * 100;

    // Prioridade 1: Situação crítica com dados confiáveis
    if (infestationLevel > 4 && coverage >= 60 && qualityScore >= 70) return 1;
    // Prioridade 2: Infestação alta com boa amostragem
    if (infestationLevel > 2 && infestationLevel <= 4 && coverage >= 60 && qualityScore >= 70) return 2;
    // Prioridade 3: Infestação detectada mas amostragem insuficiente
    if (infestationLevel > 0 && coverage < 30) return 3;
    // Prioridade 4: Infestação inicial com dados confiáveis
    if (infestationLevel > 0 && infestationLevel <= 2 && coverage >= 60 && qualityScore >= 70) return 4;
    // Prioridade 5: Sem infestação mas amostragem insuficiente
    if (!hasInfestation && coverage < 30) return 5;
    // Prioridade 6: Situação incerta
    if ((infestationLevel > 0 && coverage >= 30 && coverage < 60) || qualityScore < 70) return 6;
    // Prioridade 7: Baixo risco com confiabilidade moderada
    if (!hasInfestation && coverage >= 30 && coverage < 60) return 7;
    // Prioridade 8: Situação controlada
    if (!hasInfestation && coverage >= 60 && qualityScore >= 70) return 8;
    return 6;
  };

  // Função para obter ícone baseado na prioridade (alinhado com legenda do lado direito)
  const getRiskIcon = (risk: NeighborhoodRisk) => {
    const priority = getPriority(risk);
    if (priority <= 2) return XCircle;        // Crítico (Prioridade 1-2)
    if (priority <= 4) return AlertTriangle;  // Alto Risco (Prioridade 3-4)
    if (priority <= 6) return Info;           // Atenção (Prioridade 5-6)
    if (priority === 7) return Info;          // Baixo Risco (Prioridade 7)
    return CheckCircle;                       // Controlado (Prioridade 8)
  };

  // Função para obter texto do risco baseado na prioridade
  const getRiskText = (risk: NeighborhoodRisk) => {
    const priority = getPriority(risk);
    if (priority <= 2) return 'Crítico';      // Prioridade 1-2
    if (priority <= 4) return 'Alto Risco';   // Prioridade 3-4
    if (priority <= 6) return 'Atenção';      // Prioridade 5-6
    if (priority === 7) return 'Baixo Risco'; // Prioridade 7
    return 'Controlado';                      // Prioridade 8
  };

  // Função para obter cor do badge baseada na prioridade (alinhado com legenda do lado direito)
  const getRiskBadgeColor = (risk: NeighborhoodRisk) => {
    const priority = getPriority(risk);
    if (priority <= 2) return 'bg-red-900 hover:bg-red-800';      // Crítico (Prioridade 1-2)
    if (priority <= 4) return 'bg-orange-500 hover:bg-orange-600'; // Alto Risco (Prioridade 3-4)
    if (priority <= 6) return 'bg-amber-500 hover:bg-amber-600';   // Atenção (Prioridade 5-6)
    if (priority === 7) return 'bg-blue-500 hover:bg-blue-600';    // Baixo Risco (Prioridade 7)
    return 'bg-green-500 hover:bg-green-600';                      // Controlado (Prioridade 8)
  };

  return (
    <div className="h-full w-full relative">
      {/* Seletor de estilo do mapa */}
      <div className="absolute top-4 right-4 z-[1000]">
        <MapTileSelector
          selectedTile={selectedTile}
          onTileChange={setSelectedTile}
        />
      </div>
      
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <MapTileLayer tileOption={selectedTile} />
        
        {/* Mapa de calor */}
        <HeatmapLayer
          data={heatmapData}
          options={{
            radius: 25,
            blur: 15,
            maxZoom: 17,
            max: 100,
            minOpacity: 0.4,
            gradient: {
              0.0: 'blue',     // 0% = Azul
              0.2: 'cyan',    // 20% = Ciano
              0.4: 'lime',    // 40% = Verde limão
              0.6: 'yellow',  // 60% = Amarelo
              0.8: 'orange',  // 80% = Laranja
              1.0: 'red'      // 100% = Vermelho
            }
          }}
        />
        
        {/* Marcadores informativos */}
        {neighborhoodRisks.map((risk) => {
          const coordinates = getNeighborhoodCoordinates(risk);
          if (!coordinates) return null;

          const RiskIcon = getRiskIcon(risk);
          
          return (
            <Marker
              key={risk.name}
              position={coordinates}
              icon={createCustomIcon(risk)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center space-x-2 mb-2">
                    <RiskIcon className="h-4 w-4" />
                    <h3 className="font-semibold text-sm">{risk.name}</h3>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Prioridade:</span>
                      <span className={`px-2 py-1 rounded text-white text-xs ${getRiskBadgeColor(risk)}`}>
                        {getPriority(risk)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className="font-medium">{getRiskText(risk)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">IIP:</span>
                      <span className="font-medium">{risk.larvaeIndex.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cobertura:</span>
                      <span className="font-medium">{risk.coverage.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-slate-600">Visitados:</span>
                      <span className="font-medium">{risk.visitedProperties}/{risk.totalProperties}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
