
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type SystemParameters = Database['public']['Tables']['system_parameters']['Row'];

export const useSystemParameters = () => {
  const [parameters, setParameters] = useState<SystemParameters | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('system_parameters')
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao buscar parâmetros:', error);
        return;
      }

      setParameters(data);
    } catch (error) {
      console.error('Erro ao buscar parâmetros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isReceiptPrintingEnabled = () => {
    // Temporarily return false until the database field is added
    return false;
  };

  const isManualDiscountAllowed = () => {
    return parameters?.allow_manual_discount ?? true;
  };

  const isPDVEnabled = () => {
    return parameters?.enable_pdv ?? true;
  };

  return {
    parameters,
    isLoading,
    isReceiptPrintingEnabled,
    isManualDiscountAllowed,
    isPDVEnabled,
    refetch: fetchParameters
  };
};
