'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('🚪 Página de logout carregada');
    
    const performLogout = () => {
      try {
        // Logout direto do Firebase sem usar o AuthContext
        signOut(auth).then(() => {
          console.log('✅ Firebase logout realizado');
          // Redireciona imediatamente
          router.replace('/login');
        }).catch((error) => {
          console.error('❌ Erro no Firebase logout:', error);
          // Mesmo com erro, redireciona
          router.replace('/login');
        });
      } catch (error) {
        console.error('❌ Erro geral no logout:', error);
        // Fallback: redireciona mesmo assim
        router.replace('/login');
      }
    };

    // Timeout de segurança: se não redirecionar em 3 segundos, força o redirecionamento
    const safetyTimeout = setTimeout(() => {
      console.log('⏰ Timeout de segurança ativado - forçando redirecionamento');
      router.replace('/login');
    }, 3000);

    // Executa logout com pequeno delay para evitar race conditions
    const timer = setTimeout(performLogout, 100);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Fazendo logout...</p>
      </div>
    </div>
  );
}
