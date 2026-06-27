// Geração de SVG de código de barras EAN-13 e impressão de etiqueta.
// Encoder próprio (tabelas padrão L/G/R) — sem dependências externas.
import { isValidEAN13 } from './productCode';

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

/** Converte um EAN-13 válido nos 95 módulos (string de bits 0/1). */
function ean13Modules(code: string): string {
  const d = code.split('').map(Number);
  let bits = '101'; // guarda inicial
  const parity = PARITY[d[0]];
  for (let i = 1; i <= 6; i++) {
    bits += parity[i - 1] === 'L' ? L[d[i]] : G[d[i]];
  }
  bits += '01010'; // guarda central
  for (let i = 7; i <= 12; i++) bits += R[d[i]];
  bits += '101'; // guarda final
  return bits;
}

interface BarcodeSvgOptions {
  moduleWidth?: number;
  height?: number;
}

/** Gera o markup SVG de um código de barras EAN-13. Retorna '' se inválido. */
export function ean13ToSvg(code: string, opts: BarcodeSvgOptions = {}): string {
  if (!isValidEAN13(code)) return '';
  const mw = opts.moduleWidth ?? 2;
  const barH = opts.height ?? 60;
  const guardExtra = 8;
  const quiet = 11 * mw; // zona de silêncio (margem obrigatória)
  const textH = 16;
  const totalW = quiet * 2 + 95 * mw;
  const totalH = barH + guardExtra + textH;
  const bits = ean13Modules(code);

  // Barras de guarda (início, centro, fim) descem um pouco mais.
  const guards = new Set([0, 1, 2, 45, 46, 47, 48, 49, 92, 93, 94]);

  let rects = '';
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') {
      const x = quiet + i * mw;
      const h = guards.has(i) ? barH + guardExtra : barH;
      rects += `<rect x="${x}" y="0" width="${mw}" height="${h}" fill="#000"/>`;
    }
  }

  // Texto humano-legível: 1º dígito à esquerda, depois os dois grupos de 6.
  const fontSize = 13;
  const ty = totalH - 2;
  const digit = (ch: string, cx: number) =>
    `<text x="${cx}" y="${ty}" font-family="monospace" font-size="${fontSize}" text-anchor="middle">${ch}</text>`;

  let texts = digit(code[0], quiet - mw * 4);
  for (let k = 0; k < 6; k++) {
    texts += digit(code[1 + k], quiet + (3 + 7 * k + 3.5) * mw);
  }
  for (let k = 0; k < 6; k++) {
    texts += digit(code[7 + k], quiet + (50 + 7 * k + 3.5) * mw);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}"><rect width="${totalW}" height="${totalH}" fill="#fff"/>${rects}${texts}</svg>`;
}

interface LabelProduct {
  name: string;
  code?: string | null;
  barcode?: string | null;
  sale_price?: number | null;
}

/**
 * Abre uma janela de impressão com a etiqueta do produto (nome, preço e
 * código de barras). Requer um EAN-13 válido em `barcode`.
 * Retorna false se o produto não tiver código de barras válido.
 */
export function printProductLabel(product: LabelProduct): boolean {
  if (!isValidEAN13(product.barcode)) return false;

  const svg = ean13ToSvg(product.barcode, { moduleWidth: 2, height: 60 });
  const price =
    typeof product.sale_price === 'number' ? `R$ ${product.sale_price.toFixed(2)}` : '';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Etiqueta — ${escapeHtml(product.name)}</title>
<style>
  @page { margin: 6mm; }
  body { font-family: Arial, sans-serif; margin: 0; padding: 8px; text-align: center; }
  .label { display: inline-block; border: 1px dashed #ccc; padding: 8px 12px; }
  .name { font-size: 13px; font-weight: 600; margin-bottom: 2px; max-width: 240px; }
  .price { font-size: 16px; font-weight: 700; margin: 2px 0 4px; }
  svg { display: block; margin: 0 auto; }
  @media print { .label { border: none; } }
</style>
</head>
<body>
  <div class="label">
    <div class="name">${escapeHtml(product.name)}</div>
    ${price ? `<div class="price">${price}</div>` : ''}
    ${svg}
  </div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=420,height=320');
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
}
