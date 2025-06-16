
import { useEffect } from 'react';

interface PDVFullscreenManagerProps {
  caixaAberto: boolean;
}

const PDVFullscreenManager = ({ caixaAberto }: PDVFullscreenManagerProps) => {
  useEffect(() => {
    const enterFullscreen = () => {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    };
    const exitFullscreen = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };

    if (caixaAberto) enterFullscreen();
    else exitFullscreen();

    return () => exitFullscreen();
  }, [caixaAberto]);

  return null; // This component doesn't render anything
};

export default PDVFullscreenManager;
