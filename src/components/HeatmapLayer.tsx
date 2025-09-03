'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
  data: Array<[number, number, number]>; // [lat, lng, intensity]
  options?: {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    max?: number;
    minOpacity?: number;
    gradient?: { [key: number]: string };
  };
}

export default function HeatmapLayer({ data, options }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Configurações padrão para o mapa de calor
    const defaultOptions = {
      radius: 25,
      blur: 15,
      maxZoom: 15,
      max: 100,
      minOpacity: 0.4,
      gradient: {
        0.0: 'green',   // 0-40% = Verde (Baixo)
        0.4: 'yellow',  // 40-60% = Amarelo (Médio)
        0.6: 'orange',  // 60-80% = Laranja (Alto)
        0.8: 'red'      // 80-100% = Vermelho (Crítico)
      },
      ...options
    };

    // Criar camada de calor
    const heatmapLayer = (L as any).heatLayer(data, defaultOptions);
    
    // Adicionar ao mapa
    map.addLayer(heatmapLayer);

    // Cleanup
    return () => {
      map.removeLayer(heatmapLayer);
    };
  }, [map, data, options]);

  return null;
}


