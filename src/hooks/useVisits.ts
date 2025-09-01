import { useState, useEffect, useCallback } from 'react';
import { visitsService } from '@/services/visitsService';
import { VisitForm, RoutineVisitForm, LIRAAVisitForm } from '@/types/visits';

export function useVisits() {
  const [visits, setVisits] = useState<VisitForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar visitas do localStorage
  const loadVisits = useCallback(() => {
    try {
      const savedVisits = visitsService.getLocalVisits();
      setVisits(savedVisits);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar visitas locais');
      console.error('Erro ao carregar visitas:', err);
    }
  }, []);

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
