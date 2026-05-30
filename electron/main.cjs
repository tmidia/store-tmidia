const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const { buildReceipt } = require('./escpos.cjs');
const { printRaw } = require('./rawprint.cjs');

const isDev = process.env.NODE_ENV !== 'production';

// Pasta com o build do front (funciona dentro do app.asar — fs do Electron lê asar).
const DIST = path.join(__dirname, '..', 'dist');

// ============================================================
// Protocolo customizado "app://" para servir o build em produção.
// Carregar via file:// não funciona: o Chromium bloqueia os
// <script type="module"> do Vite por CORS (origem "null"), deixando
// a tela em branco. Um esquema próprio resolve com origem estável.
// ============================================================
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
  },
]);

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

function registerAppProtocol() {
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url);
    const rel = decodeURIComponent(pathname);
    const filePath = path.join(DIST, rel === '/' ? 'index.html' : rel);

    try {
      const data = fs.readFileSync(filePath);
      const mime = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
      return new Response(data, { headers: { 'content-type': mime } });
    } catch (err) {
      console.error('[app://] arquivo não encontrado:', filePath, err.message);
      return new Response('Not found', { status: 404 });
    }
  });
}

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

  // Loga falhas de carregamento (ajuda a diagnosticar tela branca).
  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error(`[did-fail-load] ${code} ${desc} -> ${url}`);
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadURL('app://bundle/index.html');
  }
}

app.whenReady().then(() => {
  registerAppProtocol();
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
