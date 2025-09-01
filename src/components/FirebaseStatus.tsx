import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { firebaseVisitsService } from '@/services/firebaseVisitsService';
import { useAuth } from '@/components/AuthContext';

interface FirebaseStatusProps {
  onStatusChange?: (status: 'online' | 'offline' | 'checking') => void;
}

export default function FirebaseStatus({ onStatusChange }: FirebaseStatusProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    setError(null);
    
    try {
      const isConnected = await firebaseVisitsService.checkConnectivity();
      setStatus(isConnected ? 'online' : 'offline');
      setLastCheck(new Date());
      
      if (!isConnected) {
        setError('Firebase não está acessível. Verifique sua conexão e configurações.');
      }
      
      onStatusChange?.(isConnected ? 'online' : 'offline');
    } catch (err) {
      setStatus('offline');
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLastCheck(new Date());
      onStatusChange?.('offline');
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'online':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <Wifi className="h-3 w-3 mr-1" />
            Online
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        );
      case 'checking':
        return (
          <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Verificando
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            {getStatusIcon()}
            <span>Status do Firebase</span>
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              <div className="flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span className="font-medium">Erro:</span>
              </div>
              <p className="mt-1">{error}</p>
            </div>
          )}
          
          {lastCheck && (
            <div className="text-xs text-muted-foreground">
              Última verificação: {lastCheck.toLocaleTimeString('pt-BR')}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={checkConnection}
              disabled={status === 'checking'}
              className="h-7 px-2 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${status === 'checking' ? 'animate-spin' : ''}`} />
              Verificar
            </Button>
            
            {user && (
              <div className="text-xs text-muted-foreground">
                Usuário: {user.name} ({user.organizationId})
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
