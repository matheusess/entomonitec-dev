import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAvailableMunicipalities, switchMunicipality, useMunicipalConfig } from '@/lib/municipalConfig';
import { Settings, Globe, RefreshCw } from 'lucide-react';

interface MunicipalSelectorProps {
  show?: boolean;
}

export default function MunicipalSelector({ show = false }: MunicipalSelectorProps) {
  const [selectedMunicipal, setSelectedMunicipal] = useState('');
  const [isOpen, setIsOpen] = useState(show);
  const currentConfig = useMunicipalConfig();
  const availableMunicipalities = getAvailableMunicipalities();

  if (!isOpen && !show) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-white shadow-lg border-2"
        >
          <Settings className="h-4 w-4 mr-2" />
          Dev Config
        </Button>
      </div>
    );
  }

  const handleMunicipalChange = () => {
    if (selectedMunicipal && selectedMunicipal !== currentConfig.id) {
      switchMunicipality(selectedMunicipal);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 shadow-xl border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Configuração Municipal
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Município Atual */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Município Atual:</span>
              <Badge variant="outline">{currentConfig.state}</Badge>
            </div>
            <p className="font-medium text-blue-800">{currentConfig.name}</p>
            <p className="text-xs text-blue-600">{currentConfig.department}</p>
          </div>

          {/* Seletor de Município */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trocar para:</label>
            <Select value={selectedMunicipal} onValueChange={setSelectedMunicipal}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um município..." />
              </SelectTrigger>
              <SelectContent>
                {availableMunicipalities.map(municipal => (
                  <SelectItem key={municipal.id} value={municipal.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{municipal.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {municipal.state}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ações */}
          <div className="flex space-x-2">
            <Button
              onClick={handleMunicipalChange}
              disabled={!selectedMunicipal || selectedMunicipal === currentConfig.id}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Aplicar
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Fechar
            </Button>
          </div>

          {/* Informações */}
          <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded border">
            <p className="font-medium mb-1">💡 Para Desenvolvedores</p>
            <p>Este seletor permite trocar entre configurações municipais.</p>
            <p className="mt-1">Em produção, o município seria determinado automaticamente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook para mostrar seletor em desenvolvimento
export function useDevMunicipalSelector() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment;
}
