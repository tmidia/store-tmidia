
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { capitalizeWords, formatCPF, formatCNPJ, formatPhone, isValidCPF, isValidCNPJ } from '@/utils/textUtils';
import { useCEP } from '@/hooks/useCEP';
import type { Database } from '@/integrations/supabase/types';

type Supplier = Database['public']['Tables']['suppliers']['Row'];

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSave: () => void;
}

const SupplierDialog = ({ isOpen, onClose, supplier, onSave }: SupplierDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    cpf: '',
    cnpj: '',
    supplier_type: 'fornecedor',
    contact_person: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { fetchCEP, isLoading: cepLoading } = useCEP();

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        company_name: supplier.company_name || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        cpf: supplier.cpf || '',
        cnpj: supplier.cnpj || '',
        supplier_type: supplier.supplier_type || 'fornecedor',
        contact_person: supplier.contact_person || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        zip_code: supplier.zip_code || ''
      });
    } else {
      resetForm();
    }
  }, [supplier]);

  const resetForm = () => {
    setFormData({
      name: '',
      company_name: '',
      email: '',
      phone: '',
      cpf: '',
      cnpj: '',
      supplier_type: 'fornecedor',
      contact_person: '',
      address: '',
      city: '',
      state: '',
      zip_code: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'name' || field === 'company_name' || field === 'contact_person' || field === 'city') {
      formattedValue = capitalizeWords(value);
    } else if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleCEPSearch = async (cep: string) => {
    if (cep.replace(/\D/g, '').length === 8) {
      const cepData = await fetchCEP(cep);
      if (cepData) {
        setFormData(prev => ({
          ...prev,
          city: capitalizeWords(cepData.localidade),
          state: cepData.uf.toUpperCase(),
          address: capitalizeWords(cepData.logradouro)
        }));
      }
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.cpf.trim() && !formData.cnpj.trim()) {
      toast({
        title: "Erro",
        description: "É obrigatório preencher CPF ou CNPJ.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.cpf && !isValidCPF(formData.cpf)) {
      toast({
        title: "Erro",
        description: "CPF deve ter 11 dígitos.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.cnpj && !isValidCNPJ(formData.cnpj)) {
      toast({
        title: "Erro",
        description: "CNPJ deve ter 14 dígitos.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const supplierData = {
        name: formData.name,
        company_name: formData.company_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        cpf: formData.cpf || null,
        cnpj: formData.cnpj || null,
        supplier_type: formData.supplier_type,
        contact_person: formData.contact_person || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null
      };

      if (supplier) {
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', supplier.id);

        if (error) throw error;

        toast({
          title: "Fornecedor atualizado",
          description: "As informações do fornecedor foram atualizadas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert(supplierData);

        if (error) throw error;

        toast({
          title: "Fornecedor criado",
          description: "O fornecedor foi criado com sucesso.",
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar fornecedor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
          <DialogDescription>
            {supplier ? 'Atualize as informações do fornecedor.' : 'Preencha os dados para criar um novo fornecedor.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="company_name">Razão Social</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
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
            <div>
              <Label htmlFor="supplier_type">Tipo</Label>
              <Select value={formData.supplier_type} onValueChange={(value) => setFormData(prev => ({ ...prev, supplier_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="prestador">Prestador de Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contact_person">Pessoa de Contato</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => handleInputChange('contact_person', e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, zip_code: value }));
                  }}
                  onBlur={(e) => handleCEPSearch(e.target.value)}
                  placeholder="00000-000"
                  maxLength={8}
                  disabled={cepLoading}
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                  maxLength={2}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (supplier ? 'Atualizar' : 'Criar')} Fornecedor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierDialog;
