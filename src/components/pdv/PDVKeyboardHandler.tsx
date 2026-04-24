import { useEffect, useCallback } from 'react';

interface PDVKeyboardHandlerProps {
  caixaAberto: boolean;
  onCancelSale: () => void;
  setIsPaymentModalOpen: (value: boolean) => void;
  isPaymentModalOpen: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
  onToggleFullscreen: () => void;
}

const PDVKeyboardHandler = ({
  caixaAberto,
  onCancelSale,
  setIsPaymentModalOpen,
  isPaymentModalOpen,
  searchInputRef,
  onToggleFullscreen,
}: PDVKeyboardHandlerProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // ESC fecha modal de pagamento mesmo com caixa fechado
    if (event.key === 'Escape' && isPaymentModalOpen) {
      event.preventDefault();
      setIsPaymentModalOpen(false);
      return;
    }

    // F12 (fullscreen) funciona sempre
    if (event.key === 'F12') {
      event.preventDefault();
      onToggleFullscreen();
      return;
    }

    if (!caixaAberto) return;

    switch (event.key) {
      case 'F2':
        event.preventDefault();
        setIsPaymentModalOpen(true);
        break;
      case 'F5':
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        break;
      case 'F9':
        event.preventDefault();
        onCancelSale();
        break;
    }
  }, [caixaAberto, onCancelSale, setIsPaymentModalOpen, isPaymentModalOpen, searchInputRef, onToggleFullscreen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
};

export default PDVKeyboardHandler;
