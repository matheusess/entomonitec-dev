import { Bug, Shield } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export function LoadingScreen({ 
  message = "Carregando...", 
  submessage = "Aguarde um momento" 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center institutional-gradient">
      <div className="text-center">
        {/* Logo animado */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
            <Bug className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-6"></div>

        {/* Mensagens */}
        <div className="space-y-2">
          <p className="text-white text-lg font-medium">{message}</p>
          <p className="text-white/80 text-sm">{submessage}</p>
        </div>

        {/* Barra de progresso animada */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}



