
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export type PdvTheme = 'pdv-modern' | 'pdv-classic';

export const usePdvTheme = () => {
  const [theme, setTheme] = useState<PdvTheme>('pdv-modern');

  useEffect(() => {
    const storedTheme = localStorage.getItem('pdvTheme') as PdvTheme | null;
    if (storedTheme && ['pdv-modern', 'pdv-classic'].includes(storedTheme)) {
      setTheme(storedTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(currentTheme => {
      const newTheme = currentTheme === 'pdv-modern' ? 'pdv-classic' : 'pdv-modern';
      localStorage.setItem('pdvTheme', newTheme);
      toast({
        title: "Tema Alterado!",
        description: `PDV agora está usando o tema ${newTheme === 'pdv-classic' ? 'Clássico' : 'Moderno'}.`,
      })
      return newTheme;
    });
  }, []);

  return { theme, toggleTheme };
};
