'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';

interface AutoRedirectProps {
  currentPath?: string;
  children?: React.ReactNode;
}

export default function AutoRedirect({ currentPath, children }: AutoRedirectProps) {
  const { user, isLoading, getDefaultRoute } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && currentPath) {
      const defaultRoute = getDefaultRoute(user.role);
      
      // Se o usuário está em uma rota que não é a padrão para seu papel, redirecionar
      if (currentPath !== defaultRoute) {
        // Aguardar um pouco para garantir que a navegação esteja pronta
        const timer = setTimeout(() => {
          router.push(defaultRoute);
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [user, isLoading, currentPath, router, getDefaultRoute]);

  // Se estiver carregando ou redirecionando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não há usuário, não renderizar nada (será redirecionado pelo AuthGuard)
  if (!user) {
    return null;
  }

  // Se o usuário está na rota correta, mostrar o conteúdo
  return <>{children}</>;
}
