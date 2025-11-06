'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { OrganizationService, IOrganization } from '@/services/organizationService';
import Layout from '@/components/Layout';
import OrganizationDetails from '@/components/pages/OrganizationDetails';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Shield, ShieldAlert } from 'lucide-react';
import logger from '@/lib/logger';

export default function OrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<IOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;

  useEffect(() => {
    loadOrganization();
  }, [slug, user]);

  const loadOrganization = async () => {
    if (!user) {
      setError('Usuário não autenticado');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      logger.log('🔍 Buscando organização pelo slug:', slug);

      // Buscar organização pelo slug
      const org = await OrganizationService.getOrganizationBySlug(slug);
      
      if (!org) {
        setError('Organização não encontrada');
        setIsLoading(false);
        return;
      }

      // Verificar permissões de acesso
      const hasAccess = checkAccess(org, user);
      if (!hasAccess) {
        setError('Você não tem permissão para acessar esta organização');
        setIsLoading(false);
        return;
      }

      setOrganization(org);
      setError(null);
    } catch (err) {
      logger.error('❌ Erro ao carregar organização:', err);
      setError('Erro ao carregar organização');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAccess = (org: IOrganization, currentUser: any): boolean => {
    // Super Admin pode acessar qualquer organização
    if (currentUser.isSuperAdmin) {
      return true;
    }

    // Usuários normais só podem acessar a própria organização
    if (currentUser.organizationId === org.id) {
      return true;
    }

    return false;
  };

  const handleGoBack = () => {
    // Usar histórico do navegador (volta para onde veio)
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback: se não há histórico, usar rota padrão baseada no papel
      if (user?.isSuperAdmin) {
        router.push('/dashboard'); // Dashboard para Super Admin também
      } else {
        router.push('/dashboard');
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
            <p className="text-lg text-gray-600">Carregando organização...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !organization) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Acesso Negado
              </h1>
              <p className="text-gray-600 mb-4">
                {error || 'Não foi possível acessar esta organização.'}
              </p>
              <Button onClick={handleGoBack} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Success - render organization details
  return (
    <Layout>
      <OrganizationDetails 
        organizationId={organization.id}
        onBack={handleGoBack}
      />
    </Layout>
  );
}
