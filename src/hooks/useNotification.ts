'use client';

import { useToast } from '@/hooks/use-toast';

interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export const useNotification = () => {
  const { toast } = useToast();

  const success = (message: string, options?: NotificationOptions) => {
    toast({
      variant: 'success',
      title: options?.title || '✅ Sucesso!',
      description: message,
      duration: options?.duration || 4000,
    });
  };

  const error = (message: string, options?: NotificationOptions) => {
    toast({
      variant: 'destructive',
      title: options?.title || '❌ Erro!',
      description: message,
      duration: options?.duration || 6000,
    });
  };

  const warning = (message: string, options?: NotificationOptions) => {
    toast({
      variant: 'warning',
      title: options?.title || '⚠️ Atenção!',
      description: message,
      duration: options?.duration || 5000,
    });
  };

  const info = (message: string, options?: NotificationOptions) => {
    toast({
      variant: 'info',
      title: options?.title || 'ℹ️ Informação',
      description: message,
      duration: options?.duration || 4000,
    });
  };

  const loading = (message: string, options?: NotificationOptions) => {
    return toast({
      variant: 'default',
      title: options?.title || '⏳ Carregando...',
      description: message,
      duration: options?.duration || 0, // 0 = não remove automaticamente
    });
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    // Acesso direto ao toast original para casos especiais
    toast,
  };
};

// Export de conveniência para usar diretamente
export const notify = {
  success: (message: string, options?: NotificationOptions) => {
    const { toast } = useToast();
    toast({
      variant: 'success',
      title: options?.title || '✅ Sucesso!',
      description: message,
      duration: options?.duration || 4000,
    });
  },
  error: (message: string, options?: NotificationOptions) => {
    const { toast } = useToast();
    toast({
      variant: 'destructive',
      title: options?.title || '❌ Erro!',
      description: message,
      duration: options?.duration || 6000,
    });
  },
  warning: (message: string, options?: NotificationOptions) => {
    const { toast } = useToast();
    toast({
      variant: 'warning',
      title: options?.title || '⚠️ Atenção!',
      description: message,
      duration: options?.duration || 5000,
    });
  },
  info: (message: string, options?: NotificationOptions) => {
    const { toast } = useToast();
    toast({
      variant: 'info',
      title: options?.title || 'ℹ️ Informação',
      description: message,
      duration: options?.duration || 4000,
    });
  },
};
