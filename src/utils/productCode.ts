// Utilitários de geração de código interno e código de barras EAN-13.
// Sem dependências externas — encoder próprio para gerar e validar EAN-13.

/** Calcula o dígito verificador de um número de 12 dígitos (padrão EAN-13). */
export function ean13CheckDigit(twelveDigits: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = twelveDigits.charCodeAt(i) - 48;
    sum += i % 2 === 0 ? d : d * 3;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Gera um código de barras EAN-13 válido para uso interno da loja.
 * Usa o prefixo "200" (faixa 200–299 reservada para uso interno — não é um
 * GTIN oficial de fabricante, serve para etiquetar produtos próprios).
 */
export function generateEAN13(): string {
  let base = '200';
  for (let i = 0; i < 9; i++) base += Math.floor(Math.random() * 10);
  return base + ean13CheckDigit(base);
}

/** Valida um EAN-13: 13 dígitos numéricos com dígito verificador correto. */
export function isValidEAN13(value: string | null | undefined): value is string {
  if (!value || !/^\d{13}$/.test(value)) return false;
  return ean13CheckDigit(value.slice(0, 12)) === value.charCodeAt(12) - 48;
}

/** Gera um código interno curto e legível (ex.: "P-9F3A2"). */
export function generateInternalCode(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.floor(Math.random() * 36 * 36)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0');
  return `P-${ts}${rand}`;
}
