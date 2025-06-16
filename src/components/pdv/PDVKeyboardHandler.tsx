
import { useEffect, useCallback } from 'react';

interface PDVKeyboardHandlerProps {
  caixaAberto: boolean;
  limparCarrinho: () => void;
  setIsPaymentModalOpen: (value: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

const PDVKeyboardHandler = ({
  caixaAberto,
  limparCarrinho,
  setIsPaymentModalOpen,
  searchInputRef
}: PDVKeyboardHandlerProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!caixaAberto) return;
    switch (event.key) {
      case 'F2':
        event.preventDefault();
        setIsPaymentModalOpen(true);
        break;
      case 'F5':
        event.preventDefault();
        searchInputRef.current?.focus();
        break;
      case 'F9':
        event.preventDefault();
        limparCarrinho();
        break;
    }
  }, [caixaAberto, limparCarrinho, setIsPaymentModalOpen, searchInputRef]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return null; // This component doesn't render anything
};

export default PDVKeyboardHandler;
