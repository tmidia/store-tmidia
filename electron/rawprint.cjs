const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Resolve o caminho do rawprint.ps1 tanto em dev quanto no instalador empacotado.
// No build de produção, __dirname fica dentro de app.asar e o PowerShell não
// consegue ler de lá — por isso o arquivo também é copiado via extraResources
// para `resources/rawprint.ps1`.
function resolveScriptPath() {
  const localPath = path.join(__dirname, 'rawprint.ps1');
  if (__dirname.includes('app.asar')) {
    return path.join(process.resourcesPath, 'rawprint.ps1');
  }
  return localPath;
}

function printRaw(printerName, bytes) {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(os.tmpdir(), `sga_escpos_${Date.now()}.bin`);
    fs.writeFileSync(tempFile, bytes);

    const scriptPath = resolveScriptPath();

    const ps = spawn('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath,
      '-PrinterName', printerName,
      '-FilePath', tempFile,
    ], { windowsHide: true });

    let stdout = '';
    let stderr = '';
    ps.stdout.on('data', d => { stdout += d.toString(); });
    ps.stderr.on('data', d => { stderr += d.toString(); });

    ps.on('close', (code) => {
      try { fs.unlinkSync(tempFile); } catch (_) {}
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`PowerShell saiu com código ${code}\nstderr: ${stderr}\nstdout: ${stdout}`));
      }
    });

    ps.on('error', (err) => {
      try { fs.unlinkSync(tempFile); } catch (_) {}
      reject(err);
    });
  });
}

module.exports = { printRaw };
