'use client';

import { useSuperAdminGuard } from '@/hooks/useAuthGuard';
import SuperAdminPanel from '@/components/pages/SuperAdminPanel';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AccessDenied from '@/components/ui/access-denied';

export default function SuperAdminPage() {
  const { isLoading, isAuthorized } = useSuperAdminGuard();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Verificando permissões de super admin..." />;
  }

  if (!isAuthorized) {
    return (
      <AccessDenied 
        title="Acesso Restrito"
        message="Esta área é exclusiva para super administradores (@entomonitec.com)."
      />
    );
  }

  return <SuperAdminPanel />;
}
