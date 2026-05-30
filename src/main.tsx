import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Após um novo deploy, os hashes dos arquivos mudam. Abas abertas de uma versão
// antiga falham ao buscar um chunk que não existe mais ("Failed to fetch
// dynamically imported module"). Aqui recarregamos a página automaticamente
// para pegar a versão nova, em vez de mostrar a tela de erro.
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
