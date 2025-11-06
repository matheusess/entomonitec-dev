'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { UserRole } from '@/components/AuthContext';
import logger from '@/lib/logger';

interface UseAuthGuardOptions {
  requiredRoles?: UserRole[];
  redirectTo?: string;
  requireSuperAdmin?: boolean;
  requireOrganization?: boolean;
}

interface AuthGuardResult {
  isLoading: boolean;
  isAuthorized: boolean;
  user: any;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}): AuthGuardResult {
  const {
    requiredRoles = [],
    redirectTo = '/login',
    requireSuperAdmin = false,
    requireOrganization = true
  } = options;

  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Memoizar o array de roles para evitar re-renders desnecessários
  const memoizedRequiredRoles = useMemo(() => requiredRoles, [JSON.stringify(requiredRoles)]);

  useEffect(() => {
    // Se ainda está carregando, aguardar
    if (isLoading) {
      return;
    }

    // 1. Verificar se está autenticado
    if (!user) {
      router.push(redirectTo);
      setIsAuthorized(false);
      return;
    }

    // 2. Verificar se requer super admin
    if (requireSuperAdmin && !user.isSuperAdmin) {
      router.push('/dashboard');
      setIsAuthorized(false);
      return;
    }

    // 3. Verificar se requer organização (não aplicável para super admin)
    if (requireOrganization && !user.isSuperAdmin && !user.organizationId) {
      logger.warn('⚠️ Usuário sem organizationId:', user.email);
      router.push('/error?message=organization_required');
      setIsAuthorized(false);
      return;
    }

    // 4. Verificar roles requeridos
    if (memoizedRequiredRoles.length > 0 && !memoizedRequiredRoles.includes(user.role)) {
      router.push('/dashboard');
      setIsAuthorized(false);
      return;
    }

    // Tudo ok!
    setIsAuthorized(true);
  }, [user, isLoading, router, memoizedRequiredRoles, redirectTo, requireSuperAdmin, requireOrganization]);

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role || user?.isSuperAdmin === true;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return user.permissions?.includes('*') || user.permissions?.includes(permission) || false;
  };

  return {
    isLoading,
    isAuthorized,
    user,
    hasRole,
    hasPermission
  };
}

// Hook específico para páginas que precisam de super admin
export function useSuperAdminGuard() {
  return useAuthGuard({
    requireSuperAdmin: true,
    requireOrganization: false,
    redirectTo: '/dashboard'
  });
}

// Hook específico para administradores de organização
export function useAdminGuard() {
  return useAuthGuard({
    requiredRoles: ['administrator', 'super_admin'],
    requireOrganization: true
  });
}

// Hook específico para supervisores e acima
export function useSupervisorGuard() {
  return useAuthGuard({
    requiredRoles: ['supervisor', 'administrator', 'super_admin'],
    requireOrganization: true
  });
}

