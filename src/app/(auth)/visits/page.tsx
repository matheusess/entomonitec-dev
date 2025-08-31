'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import Layout from '@/components/Layout';
import Visits from '@/components/pages/Visits';
import AutoRedirect from '@/components/AutoRedirect';

export default function VisitsPage() {
  const { isLoading, isAuthorized } = useAuthGuard({
    requiredRoles: ['agent', 'supervisor', 'administrator', 'super_admin'],
    requireOrganization: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // useAuthGuard já redirecionou
  }

  return (
    <AutoRedirect currentPath="/visits">
      <Layout>
        <Visits />
      </Layout>
    </AutoRedirect>
  );
}

