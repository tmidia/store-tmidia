
export interface CartItem {
  id: string;
  preco: number;
  quantidade: number;
  nome: string;
  codigo: string;
  estoque: number;
}

export interface SaleData {
  formaPagamento: string;
  valorRecebido: string;
  total: number;
  subtotal: number;
  desconto: number;
  valorDesconto: number;
  troco: number;
}
