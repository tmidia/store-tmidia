export interface CartItem {
  id: string;
  product_id: string;
  variation_id?: string;
  variation_name?: string;
  category_id?: string;
  subcategory_id?: string;
  preco: number;
  quantidade: number;
  nome: string;
  codigo: string;
  code: string;
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
