import React from 'react';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export function AccessDenied({ 
  title = 'Acesso Negado',
  message = 'Você não tem permissão para acessar esta área.',
  showBackButton = true,
  showHomeButton = true
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            {showBackButton && (
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            {showHomeButton && (
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir para Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccessDenied;

