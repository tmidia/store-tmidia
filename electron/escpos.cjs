// Gerador de comandos ESC/POS para impressoras térmicas 80mm
// Compatível com: SMX-T80E, POS80, Epson, Bematech, Daruma, e similares

const ESC = 0x1B;
const GS = 0x1D;
const LINE_WIDTH = 48; // 48 colunas na fonte padrão 80mm

const cmd = {
  init: Buffer.from([ESC, 0x40]),                       // Inicializa impressora
  alignLeft: Buffer.from([ESC, 0x61, 0x00]),
  alignCenter: Buffer.from([ESC, 0x61, 0x01]),
  alignRight: Buffer.from([ESC, 0x61, 0x02]),
  boldOn: Buffer.from([ESC, 0x45, 0x01]),
  boldOff: Buffer.from([ESC, 0x45, 0x00]),
  sizeNormal: Buffer.from([GS, 0x21, 0x00]),
  sizeDoubleHeight: Buffer.from([GS, 0x21, 0x01]),
  sizeDoubleWidth: Buffer.from([GS, 0x21, 0x10]),
  sizeDouble: Buffer.from([GS, 0x21, 0x11]),
  cutPartial: Buffer.from([GS, 0x56, 0x42, 0x00]),       // Corte parcial
  feedLine: (n = 1) => Buffer.alloc(n, 0x0A),
  codepageCP850: Buffer.from([ESC, 0x74, 0x02]),         // Codepage multilingual latina
};

// Remove acentos para máxima compatibilidade com qualquer firmware térmico
const COMBINING_DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');
const stripAccents = (s) =>
  String(s ?? '').normalize('NFD').replace(COMBINING_DIACRITICS, '');

const text = (s) => Buffer.from(stripAccents(s), 'ascii');
const line = (s = '') => Buffer.concat([text(s), cmd.feedLine(1)]);
const separator = (char = '-') => line(char.repeat(LINE_WIDTH));

// Linha com texto à esquerda e valor à direita (preenche com espaços)
const row = (left, right) => {
  const l = stripAccents(left);
  const r = stripAccents(right);
  const space = Math.max(1, LINE_WIDTH - l.length - r.length);
  return line(l + ' '.repeat(space) + r);
};

const formatPayment = (forma) => {
  const map = {
    dinheiro: 'DINHEIRO',
    pix: 'PIX',
    cartao_credito: 'CARTAO CREDITO',
    cartao_debito: 'CARTAO DEBITO',
    cartao: 'CARTAO',
    misto: 'MISTO',
  };
  return map[forma] || String(forma).toUpperCase();
};

function buildReceipt(data, company) {
  const parts = [];
  parts.push(cmd.init);
  parts.push(cmd.codepageCP850);

  // Cabeçalho da empresa - centro, negrito, largura dupla
  parts.push(cmd.alignCenter);
  parts.push(cmd.boldOn);
  parts.push(cmd.sizeDoubleWidth);
  parts.push(line(company.company_name || 'LOJA'));
  parts.push(cmd.sizeNormal);
  parts.push(cmd.boldOff);

  if (company.address) parts.push(line(company.address));
  if (company.city) {
    parts.push(line(`${company.city}${company.state ? '/' + company.state : ''}`));
  }
  if (company.phone) parts.push(line(`Tel: ${company.phone}`));
  if (company.cnpj) parts.push(line(`CNPJ: ${company.cnpj}`));

  parts.push(separator('='));

  parts.push(cmd.boldOn);
  parts.push(line('CUPOM NAO FISCAL'));
  parts.push(cmd.boldOff);

  parts.push(cmd.alignLeft);
  parts.push(line(`Venda: #${data.numeroVenda}`));
  parts.push(line(`Data: ${new Date(data.dataVenda).toLocaleString('pt-BR')}`));

  parts.push(separator('-'));

  // Cabeçalho dos itens
  parts.push(cmd.boldOn);
  parts.push(row('ITEM', 'TOTAL'));
  parts.push(cmd.boldOff);
  parts.push(separator('-'));

  // Itens
  for (const item of data.items) {
    const nome = `${item.codigo} - ${item.nome}`;
    parts.push(line(nome.substring(0, LINE_WIDTH)));
    const detalhe = `  ${item.quantidade} x R$ ${item.preco.toFixed(2)}`;
    const total = `R$ ${(item.quantidade * item.preco).toFixed(2)}`;
    parts.push(row(detalhe, total));
  }

  parts.push(separator('-'));

  // Totais
  parts.push(row('Subtotal:', `R$ ${Number(data.subtotal).toFixed(2)}`));
  if (Number(data.desconto) > 0) {
    parts.push(row(`Desconto (${data.desconto}%):`, `- R$ ${Number(data.valorDesconto).toFixed(2)}`));
  }

  parts.push(cmd.boldOn);
  parts.push(cmd.sizeDouble);
  parts.push(cmd.alignRight);
  parts.push(line(`TOTAL R$ ${Number(data.total).toFixed(2)}`));
  parts.push(cmd.sizeNormal);
  parts.push(cmd.boldOff);
  parts.push(cmd.alignLeft);

  parts.push(separator('='));

  // Forma de pagamento
  parts.push(row('PAGAMENTO:', formatPayment(data.formaPagamento)));
  if (data.formaPagamento === 'dinheiro') {
    const recebido = parseFloat(data.valorRecebido || 0).toFixed(2);
    const troco = Number(data.troco || 0).toFixed(2);
    parts.push(row('Recebido:', `R$ ${recebido}`));
    parts.push(row('Troco:', `R$ ${troco}`));
  }

  parts.push(cmd.feedLine(2));

  // Rodapé
  parts.push(cmd.alignCenter);
  parts.push(line(company.receipt_footer || 'Obrigado pela preferencia!'));

  parts.push(cmd.feedLine(4));
  parts.push(cmd.cutPartial);

  return Buffer.concat(parts);
}

module.exports = { buildReceipt };
