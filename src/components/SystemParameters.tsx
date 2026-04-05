import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type SystemParameters = Database['public']['Tables']['system_parameters']['Row'];

const SystemParameters = () => {
  const [parameters, setParameters] = useState<SystemParameters | null>(null);
  const [formData, setFormData] = useState({
    show_dashboard_charts: true,
    enable_pdv: true,
    allow_manual_discount: true,
    show_low_stock_alert: true,
    show_due_accounts: true,
    show_daily_report: true,
          enable_receipt_printing: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const PRINTER_MODEL = 'SMX-T80E (80mm, USB+LAN)';

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      const { data } = await supabase
        .from('system_parameters')
        .select('*')
        .single();

      if (data) {
        setParameters(data);
        setFormData({
          show_dashboard_charts: data.show_dashboard_charts ?? true,
          enable_pdv: data.enable_pdv ?? true,
          allow_manual_discount: data.allow_manual_discount ?? true,
          show_low_stock_alert: data.show_low_stock_alert ?? true,
          show_due_accounts: data.show_due_accounts ?? true,
          show_daily_report: data.show_daily_report ?? true,
          enable_receipt_printing: (data as any).enable_receipt_printing ?? false
        });
      }
    } catch (error) {
      console.error('Erro ao buscar parâmetros:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dataToSave = formData;
      
      if (parameters) {
        const { error } = await supabase
          .from('system_parameters')
          .update(dataToSave)
          .eq('id', parameters.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_parameters')
          .insert(dataToSave);

        if (error) throw error;
      }

      toast({
        title: "Parâmetros salvos",
        description: "Os parâmetros do sistema foram atualizados com sucesso.",
      });

      fetchParameters();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar parâmetros.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <CardTitle>Parâmetros do Sistema</CardTitle>
        </div>
        <CardDescription>
          Configure o comportamento e visibilidade dos módulos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show_dashboard_charts">Mostrar gráficos no dashboard</Label>
                <p className="text-sm text-gray-500">Exibe gráficos e estatísticas na página inicial</p>
              </div>
              <Switch
                id="show_dashboard_charts"
                checked={formData.show_dashboard_charts}
                onCheckedChange={(value) => handleSwitchChange('show_dashboard_charts', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable_pdv">Habilitar PDV</Label>
                <p className="text-sm text-gray-500">Permite acesso ao módulo de ponto de venda</p>
              </div>
              <Switch
                id="enable_pdv"
                checked={formData.enable_pdv}
                onCheckedChange={(value) => handleSwitchChange('enable_pdv', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow_manual_discount">Permitir desconto manual no PDV</Label>
                <p className="text-sm text-gray-500">Usuários podem aplicar descontos durante a venda</p>
              </div>
              <Switch
                id="allow_manual_discount"
                checked={formData.allow_manual_discount}
                onCheckedChange={(value) => handleSwitchChange('allow_manual_discount', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show_low_stock_alert">Exibir alerta de estoque baixo</Label>
                <p className="text-sm text-gray-500">Mostra notificações para produtos com estoque baixo</p>
              </div>
              <Switch
                id="show_low_stock_alert"
                checked={formData.show_low_stock_alert}
                onCheckedChange={(value) => handleSwitchChange('show_low_stock_alert', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show_due_accounts">Mostrar contas vencendo no dashboard</Label>
                <p className="text-sm text-gray-500">Exibe alertas de contas a vencer na página inicial</p>
              </div>
              <Switch
                id="show_due_accounts"
                checked={formData.show_due_accounts}
                onCheckedChange={(value) => handleSwitchChange('show_due_accounts', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show_daily_report">Mostrar relatório diário</Label>
                <p className="text-sm text-gray-500">Exibe relatório de vendas do dia no dashboard</p>
              </div>
              <Switch
                id="show_daily_report"
                checked={formData.show_daily_report}
                onCheckedChange={(value) => handleSwitchChange('show_daily_report', value)}
              />
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div className="space-y-0.5">
                <Label htmlFor="enable_receipt_printing">Habilitar impressão de cupom</Label>
                <p className="text-sm text-gray-500">Permite imprimir cupom fiscal após finalizar a venda (Em desenvolvimento)</p>
              </div>
              <Switch
                id="enable_receipt_printing"
                checked={false}
                disabled={true}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Parâmetros'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SystemParameters;
