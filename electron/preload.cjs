const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Envia os dados estruturados do cupom para impressão RAW ESC/POS
  printReceiptRaw: (payload) => ipcRenderer.invoke('print-receipt-raw', payload),
});
