
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Zap, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Integrations = Database['public']['Tables']['integrations']['Row'];

const IntegrationsSettings = () => {
  const [integrations, setIntegrations] = useState<Integrations | null>(null);
  const [formData, setFormData] = useState({
    n8n_enabled: false,
    n8n_webhook_url: '',
    n8n_auth_token: '',
    make_enabled: false,
    make_webhook_url: '',
    make_auth_token: '',
    whatsapp_daily_sales: false,
    whatsapp_low_stock_alert: false,
    whatsapp_due_accounts: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data } = await supabase
        .from('integrations')
        .select('*')
        .single();

      if (data) {
        setIntegrations(data);
        setFormData({
          n8n_enabled: data.n8n_enabled ?? false,
          n8n_webhook_url: data.n8n_webhook_url ?? '',
          n8n_auth_token: data.n8n_auth_token ?? '',
          make_enabled: data.make_enabled ?? false,
          make_webhook_url: data.make_webhook_url ?? '',
          make_auth_token: data.make_auth_token ?? '',
          whatsapp_daily_sales: data.whatsapp_daily_sales ?? false,
          whatsapp_low_stock_alert: data.whatsapp_low_stock_alert ?? false,
          whatsapp_due_accounts: data.whatsapp_due_accounts ?? false
        });
      }
    } catch (error) {
      console.error('Erro ao buscar integrações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (integrations) {
        const { error } = await supabase
          .from('integrations')
          .update(formData)
          .eq('id', integrations.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('integrations')
          .insert(formData);

        if (error) throw error;
      }

      toast({
        title: "Integrações salvas",
        description: "As configurações de integração foram atualizadas com sucesso.",
      });

      fetchIntegrations();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar integrações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary" />
          <CardTitle>Integrações</CardTitle>
        </div>
        <CardDescription>
          Configure integrações com automações externas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* n8n Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">n8n</h3>
                <p className="text-sm text-gray-500">Integração com automações n8n</p>
              </div>
              <Switch
                checked={formData.n8n_enabled}
                onCheckedChange={(value) => handleSwitchChange('n8n_enabled', value)}
              />
            </div>

            {formData.n8n_enabled && (
              <div className="space-y-3 ml-4">
                <div>
                  <Label htmlFor="n8n_webhook_url">URL do Webhook</Label>
                  <Input
                    id="n8n_webhook_url"
                    value={formData.n8n_webhook_url}
                    onChange={(e) => handleInputChange('n8n_webhook_url', e.target.value)}
                    placeholder="https://webhook.n8n.io/webhook/..."
                  />
                </div>
                <div>
                  <Label htmlFor="n8n_auth_token">Token de Autenticação</Label>
                  <Input
                    id="n8n_auth_token"
                    type="password"
                    value={formData.n8n_auth_token}
                    onChange={(e) => handleInputChange('n8n_auth_token', e.target.value)}
                    placeholder="Token de acesso n8n"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Make Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Make (Integromat)</h3>
                <p className="text-sm text-gray-500">Integração com automações Make</p>
              </div>
              <Switch
                checked={formData.make_enabled}
                onCheckedChange={(value) => handleSwitchChange('make_enabled', value)}
              />
            </div>

            {formData.make_enabled && (
              <div className="space-y-3 ml-4">
                <div>
                  <Label htmlFor="make_webhook_url">URL do Webhook</Label>
                  <Input
                    id="make_webhook_url"
                    value={formData.make_webhook_url}
                    onChange={(e) => handleInputChange('make_webhook_url', e.target.value)}
                    placeholder="https://hook.make.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="make_auth_token">Token de Autenticação</Label>
                  <Input
                    id="make_auth_token"
                    type="password"
                    value={formData.make_auth_token}
                    onChange={(e) => handleInputChange('make_auth_token', e.target.value)}
                    placeholder="Token de acesso Make"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* WhatsApp Notifications */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-medium">Notificações WhatsApp</h3>
            </div>
            <p className="text-sm text-gray-500">Configure envios automáticos via WhatsApp</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp_daily_sales">Enviar resumo de vendas do dia</Label>
                <Switch
                  id="whatsapp_daily_sales"
                  checked={formData.whatsapp_daily_sales}
                  onCheckedChange={(value) => handleSwitchChange('whatsapp_daily_sales', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp_low_stock_alert">Alertar sobre estoque abaixo do mínimo</Label>
                <Switch
                  id="whatsapp_low_stock_alert"
                  checked={formData.whatsapp_low_stock_alert}
                  onCheckedChange={(value) => handleSwitchChange('whatsapp_low_stock_alert', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp_due_accounts">Enviar lista de contas a vencer</Label>
                <Switch
                  id="whatsapp_due_accounts"
                  checked={formData.whatsapp_due_accounts}
                  onCheckedChange={(value) => handleSwitchChange('whatsapp_due_accounts', value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Integrações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IntegrationsSettings;
