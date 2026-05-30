/**
 * Detecta se o app está rodando dentro do Electron (app desktop instalado).
 * O preload do Electron expõe `window.electronAPI`; na web ele não existe.
 */
export const isElectron = (): boolean =>
  typeof window !== "undefined" &&
  Boolean((window as { electronAPI?: unknown }).electronAPI);
