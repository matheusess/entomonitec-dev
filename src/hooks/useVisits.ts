import { useState, useEffect, useCallback } from 'react';
import { visitsService } from '@/services/visitsService';
import { firebaseVisitsService } from '@/services/firebaseVisitsService';
import { VisitForm, RoutineVisitForm, LIRAAVisitForm } from '@/types/visits';
import { useAuth } from '@/components/AuthContext';

export function useVisits() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<VisitForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar visitas do localStorage E do Firebase
  const loadVisits = useCallback(async () => {
    try {
      setIsLoading(true);
      
      console.log('🌍 AMBIENTE:', {
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
        isLocal: typeof window !== 'undefined' ? window.location.hostname.includes('localhost') : false,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
      });
      
      // Primeiro: carregar do localStorage
      const localVisits = visitsService.getLocalVisits();
      console.log('📱 Visitas locais carregadas:', localVisits.length);
      
      // Segundo: tentar carregar do Firebase se usuário autenticado
      if (user?.organizationId) {
        try {
          console.log('🔥 Buscando visitas do Firebase para organização:', user.organizationId);
          const firebaseVisits = await firebaseVisitsService.getVisitsByOrganization(user.organizationId);
          console.log('🔥 Visitas do Firebase carregadas:', firebaseVisits.length);
          
          // LÓGICA: Se tem visitas do Firebase, limpar LocalStorage e usar só Firebase
          if (firebaseVisits.length > 0) {
            console.log('🧹 Limpando LocalStorage e carregando só do Firebase');
            
            // Filtrar apenas visitas locais que NÃO estão sincronizadas (pending)
            const pendingLocalVisits = localVisits.filter(visit => visit.syncStatus === 'pending');
            console.log('📱 Visitas locais pendentes (mantendo):', pendingLocalVisits.length);
            
            // Marcar todas as visitas do Firebase como sincronizadas
            const syncedFirebaseVisits: VisitForm[] = firebaseVisits.map(fbVisit => ({
              ...fbVisit,
              syncStatus: 'synced' as const,
              firebaseId: fbVisit.id,
              id: fbVisit.id
            }));
            
            // Combinar: visitas pendentes locais + visitas do Firebase
            const allVisits = [...pendingLocalVisits, ...syncedFirebaseVisits];
            
            // Salvar no LocalStorage: pendentes + firebase
            localStorage.setItem('entomonitec_visits', JSON.stringify(allVisits));
            
            console.log('✅ Total de visitas:', allVisits.length, '(pendentes:', pendingLocalVisits.length, '+ firebase:', syncedFirebaseVisits.length, ')');
            setVisits(allVisits);
          } else {
            // Se não tem visitas no Firebase, usar só as locais
            console.log('📱 Nenhuma visita no Firebase, usando apenas dados locais');
            setVisits(localVisits);
          }
        } catch (firebaseError) {
          console.warn('⚠️ Erro ao carregar do Firebase, usando apenas dados locais:', firebaseError);
          setVisits(localVisits);
        }
      } else {
        console.log('👤 Usuário não autenticado, usando apenas dados locais');
        setVisits(localVisits);
      }
      
      setError(null);
    } catch (err) {
      setError('Erro ao carregar visitas');
      console.error('Erro ao carregar visitas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Sincronizar visitas com o servidor
  const syncVisits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await visitsService.syncVisits();
      
      if (result.success) {
        // Recarregar visitas após sincronização
        loadVisits();
        return { 
          success: true, 
          synced: result.synced, 
          errors: result.errors,
          message: result.message 
        };
      } else {
        return { 
          success: false, 
          synced: result.synced, 
          errors: result.errors,
          message: result.message 
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na sincronização';
      setError(errorMessage);
      console.error('Erro na sincronização:', err);
      return { 
        success: false, 
        synced: 0, 
        errors: 1,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [loadVisits]);

  // Excluir visita
  const deleteVisit = useCallback(async (visitId: string) => {
    try {
      await visitsService.deleteVisit(visitId);
      loadVisits(); // Recarregar lista
      setError(null);
      return true;
    } catch (err) {
      setError('Erro ao excluir visita');
      console.error('Erro ao excluir visita:', err);
      return false;
    }
  }, [loadVisits]);

  // Atualizar visita
  const updateVisit = useCallback(async (visitId: string, updates: any) => {
    try {
      const updatedVisit = await visitsService.updateVisit(visitId, updates);
      if (updatedVisit) {
        loadVisits(); // Recarregar lista
        setError(null);
        return updatedVisit;
      }
      return null;
    } catch (err) {
      setError('Erro ao atualizar visita');
      console.error('Erro ao atualizar visita:', err);
      return null;
    }
  }, [loadVisits]);

  // Obter estatísticas
  const getStats = useCallback(() => {
    return visitsService.getVisitStats();
  }, []);

  // Carregar visitas na inicialização
  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  return {
    visits,
    isLoading,
    error,
    loadVisits,
    syncVisits,
    deleteVisit,
    updateVisit,
    getStats
  };
}
