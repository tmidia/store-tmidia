const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const { buildReceipt } = require('./escpos.cjs');
const { printRaw } = require('./rawprint.cjs');

// app.isPackaged é a forma confiável de distinguir dev vs. app instalado.
// (NODE_ENV não é definido pelo electron-builder, então não serve aqui.)
const isDev = !app.isPackaged;

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
    const nomes = printers.map(p => p.name);
    console.log('Impressoras disponíveis:', nomes.join(', '));

    // Impressoras virtuais que nunca devem receber o cupom.
    const VIRTUAL = /microsoft print to pdf|microsoft xps|onenote|fax|pdf|xps/i;
    // Nomes/drivers comuns de impressora térmica de cupom.
    const THERMAL = /pos[\s-]?80|smx|xprinter|thermal|t80|epson tm|bematech|elgin|generic.*text|caixa|cupom|talao/i;

    const target =
      printers.find(p => THERMAL.test(p.name)) ||                        // 1) nome típico de térmica
      printers.find(p => p.isDefault && !VIRTUAL.test(p.name)) ||        // 2) padrão, se não for virtual
      printers.find(p => !VIRTUAL.test(p.name)) ||                       // 3) qualquer impressora real
      printers.find(p => p.isDefault);                                   // 4) último recurso

    if (!target) {
      throw new Error('Nenhuma impressora encontrada. Detectadas: ' + (nomes.join(', ') || 'nenhuma'));
    }

    console.log(`[RAW] Enviando ${escposBytes.length} bytes ESC/POS para "${target.name}"`);
    const result = await printRaw(target.name, escposBytes);
    console.log('[RAW] Sucesso:', result.stdout.trim());
    return { success: true, printer: target.name, printers: nomes };
  } catch (err) {
    console.error('[RAW] ERRO:', err.message);
    return { success: false, error: err.message };
  }
});
