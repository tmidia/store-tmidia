const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { buildReceipt } = require('./escpos.cjs');
const { printRaw } = require('./rawprint.cjs');

const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'SGA - PDV Calçados',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ============================================================
// IMPRESSÃO RAW ESC/POS - Via Win32 WritePrinter API
// Bypassa completamente o pipeline de renderização GDI/EMF do Windows,
// enviando bytes ESC/POS diretamente para o firmware da impressora.
// ============================================================
ipcMain.handle('print-receipt-raw', async (event, payload) => {
  try {
    const { data, company } = payload;
    const escposBytes = buildReceipt(data, company);

    // Localiza a impressora térmica
    const webContents = event.sender;
    const printers = await webContents.getPrintersAsync();
    console.log('Impressoras disponíveis:', printers.map(p => p.name).join(', '));

    const target = printers.find(p =>
      /pos[\s-]?80|smx|xprinter|thermal|t80|epson tm|bematech|elgin/i.test(p.name)
    ) || printers.find(p => p.isDefault);

    if (!target) {
      throw new Error('Nenhuma impressora disponível no Windows');
    }

    console.log(`[RAW] Enviando ${escposBytes.length} bytes ESC/POS para "${target.name}"`);
    const result = await printRaw(target.name, escposBytes);
    console.log('[RAW] Sucesso:', result.stdout.trim());
    return { success: true, printer: target.name };
  } catch (err) {
    console.error('[RAW] ERRO:', err.message);
    return { success: false, error: err.message };
  }
});
