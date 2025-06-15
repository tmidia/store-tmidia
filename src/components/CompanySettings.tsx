
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type CompanySettings = Database['public']['Tables']['company_settings']['Row'];

const CompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    cnpj: '',
    phone: '',
    logo_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      if (data) {
        setSettings(data);
        setFormData({
          company_name: data.company_name || '',
          cnpj: data.cnpj || '',
          phone: data.phone || '',
          logo_url: data.logo_url || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    const filePath = `public/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    
    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      toast({
        title: "Logo enviado",
        description: "Seu logo foi enviado. Clique em 'Salvar Configurações' para aplicá-lo.",
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível enviar o logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData = {
        company_name: formData.company_name,
        cnpj: formData.cnpj,
        phone: formData.phone,
        logo_url: formData.logo_url
      };

      if (settings) {
        const { error } = await supabase
          .from('company_settings')
          .update(updateData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_settings')
          .insert(updateData);

        if (error) throw error;
      }

      toast({
        title: "Configurações salvas",
        description: "As configurações da empresa foram atualizadas com sucesso.",
      });

      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-primary" />
          <CardTitle>Dados da Empresa</CardTitle>
        </div>
        <CardDescription>
          Configure as informações da sua empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Nome da Empresa *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone de Contato</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
            <div>
              <Label htmlFor="logo_url">Logo da Empresa</Label>
              <div className="flex space-x-2">
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="Cole a URL ou faça o upload"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  aria-label="Fazer upload do logo"
                >
                  {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanySettings;
