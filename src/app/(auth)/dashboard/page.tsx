'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import Layout from '@/components/Layout';
import Dashboard from '@/components/pages/Dashboard';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  const { isLoading, isAuthorized } = useAuthGuard({
    requiredRoles: ['agent', 'supervisor', 'administrator', 'super_admin'],
    requireOrganization: false // Super admin pode não ter organização
  });

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Verificando permissões..." />;
  }

  if (!isAuthorized) {
    return null; // useAuthGuard já redirecionou
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}
