'use client';

import { useState } from 'react';
import { TileLayer } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Map, Palette } from 'lucide-react';

export interface MapTileOption {
  id: string;
  name: string;
  url: string;
  attribution: string;
  subdomains?: string;
  maxZoom?: number;
  description: string;
}

const mapTileOptions: MapTileOption[] = [
  {
    id: 'carto-voyager',
    name: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    description: 'Estilo moderno e limpo'
  },
  {
    id: 'carto-positron',
    name: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    description: 'Estilo claro e minimalista'
  },
  {
    id: 'carto-dark',
    name: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    description: 'Estilo escuro e elegante'
  },
  {
    id: 'openstreetmap',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    description: 'Estilo clássico e detalhado'
  },
  {
    id: 'stamen-terrain',
    name: 'Stamen Terrain',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    maxZoom: 18,
    description: 'Estilo topográfico com relevo'
  },
  {
    id: 'stamen-toner',
    name: 'Stamen Toner',
    url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png',
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    maxZoom: 20,
    description: 'Estilo monocromático e artístico'
  }
];

interface MapTileSelectorProps {
  selectedTile: MapTileOption;
  onTileChange: (tile: MapTileOption) => void;
  className?: string;
}

export default function MapTileSelector({ selectedTile, onTileChange, className }: MapTileSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`bg-white shadow-md hover:bg-gray-50 ${className}`}
        >
          <Palette className="h-4 w-4 mr-2" />
          {selectedTile.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-medium text-sm">Estilo do Mapa</h3>
          <p className="text-xs text-gray-600 mt-1">Escolha o visual do mapa</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {mapTileOptions.map((tile) => (
            <button
              key={tile.id}
              onClick={() => {
                onTileChange(tile);
                setIsOpen(false);
              }}
              className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                selectedTile.id === tile.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{tile.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{tile.description}</div>
                </div>
                {selectedTile.id === tile.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Componente para renderizar o TileLayer baseado na opção selecionada
export function MapTileLayer({ tileOption }: { tileOption: MapTileOption }) {
  return (
    <TileLayer
      attribution={tileOption.attribution}
      url={tileOption.url}
      subdomains={tileOption.subdomains}
      maxZoom={tileOption.maxZoom}
    />
  );
}

export { mapTileOptions };


