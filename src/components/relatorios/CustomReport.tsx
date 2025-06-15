
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Play, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export const CustomReport = () => {
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<{[key: string]: string}>({});

  const reportTypes = [
    { value: 'sales', label: 'Relatório de Vendas' },
    { value: 'financial', label: 'Relatório Financeiro' },
    { value: 'inventory', label: 'Relatório de Estoque' },
    { value: 'customers', label: 'Relatório de Clientes' },
    { value: 'suppliers', label: 'Relatório de Fornecedores' }
  ];

  const availableFields = {
    sales: [
      { id: 'date', label: 'Data da Venda' },
      { id: 'amount', label: 'Valor' },
      { id: 'customer', label: 'Cliente' },
      { id: 'payment_method', label: 'Forma de Pagamento' },
      { id: 'products', label: 'Produtos' }
    ],
    financial: [
      { id: 'date', label: 'Data' },
      { id: 'type', label: 'Tipo' },
      { id: 'amount', label: 'Valor' },
      { id: 'description', label: 'Descrição' },
      { id: 'category', label: 'Categoria' }
    ],
    inventory: [
      { id: 'name', label: 'Nome do Produto' },
      { id: 'code', label: 'Código' },
      { id: 'category', label: 'Categoria' },
      { id: 'stock_quantity', label: 'Quantidade em Estoque' },
      { id: 'minimum_stock', label: 'Estoque Mínimo' },
      { id: 'cost_price', label: 'Preço de Custo' },
      { id: 'sale_price', label: 'Preço de Venda' }
    ],
    customers: [
      { id: 'name', label: 'Nome' },
      { id: 'document', label: 'Documento' },
      { id: 'phone', label: 'Telefone' },
      { id: 'total_purchases', label: 'Total de Compras' },
      { id: 'last_purchase', label: 'Última Compra' }
    ],
    suppliers: [
      { id: 'name', label: 'Nome' },
      { id: 'cnpj', label: 'CNPJ' },
      { id: 'phone', label: 'Telefone' },
      { id: 'email', label: 'Email' },
      { id: 'city', label: 'Cidade' }
    ]
  };

  const handleFieldChange = (fieldId: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, fieldId]);
    } else {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
    }
  };

  const generateReport = () => {
    // Implementação da geração do relatório personalizado
    console.log('Gerando relatório personalizado:', {
      reportName,
      reportType,
      dateFrom,
      dateTo,
      selectedFields,
      filters
    });
  };

  const saveTemplate = () => {
    // Implementação para salvar template de relatório
    console.log('Salvando template de relatório...');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurar Relatório Personalizado
          </CardTitle>
          <CardDescription>
            Crie relatórios personalizados selecionando os dados e filtros desejados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações Básicas */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reportName">Nome do Relatório</Label>
              <Input
                id="reportName"
                placeholder="Ex: Vendas Mensais por Categoria"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Período */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Campos Disponíveis */}
          {reportType && (
            <div className="space-y-4">
              <Label>Campos a Incluir no Relatório</Label>
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                {availableFields[reportType as keyof typeof availableFields]?.map(field => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={(checked) => handleFieldChange(field.id, checked as boolean)}
                    />
                    <Label htmlFor={field.id} className="text-sm font-normal">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filtros Adicionais */}
          {reportType && (
            <div className="space-y-4">
              <Label>Filtros Adicionais</Label>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {reportType === 'sales' && (
                  <>
                    <div className="space-y-2">
                      <Label>Forma de Pagamento</Label>
                      <Select value={filters.payment_method || ''} onValueChange={(value) => setFilters({...filters, payment_method: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                          <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor Mínimo</Label>
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={filters.min_amount || ''}
                        onChange={(e) => setFilters({...filters, min_amount: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                {reportType === 'inventory' && (
                  <>
                    <div className="space-y-2">
                      <Label>Status do Estoque</Label>
                      <Select value={filters.stock_status || ''} onValueChange={(value) => setFilters({...filters, stock_status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          <SelectItem value="low">Estoque Baixo</SelectItem>
                          <SelectItem value="out">Sem Estoque</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={filters.category || ''} onValueChange={(value) => setFilters({...filters, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          {/* Aqui viria uma lista dinâmica de categorias */}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={generateReport}
              disabled={!reportType || selectedFields.length === 0}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Gerar Relatório
            </Button>
            
            <Button 
              variant="outline"
              onClick={saveTemplate}
              disabled={!reportName || !reportType}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Salvar Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Salvos */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Salvos</CardTitle>
          <CardDescription>Relatórios personalizados salvos anteriormente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum template salvo ainda</p>
            <p className="text-sm">Crie e salve seus relatórios personalizados para reutilização</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
