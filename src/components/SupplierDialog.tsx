
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSupplierForm } from '@/hooks/useSupplierForm';
import SupplierBasicInfo from '@/components/SupplierBasicInfo';
import SupplierContactInfo from '@/components/SupplierContactInfo';
import SupplierAddressInfo from '@/components/SupplierAddressInfo';
import type { Database } from '@/integrations/supabase/types';

type Supplier = Database['public']['Tables']['suppliers']['Row'];

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSave: (supplierData: any) => void;
}

const SupplierDialog = ({ isOpen, onClose, supplier, onSave }: SupplierDialogProps) => {
  const { toast } = useToast();
  const {
    formData,
    setFormData,
    isLoading,
    setIsLoading,
    cepLoading,
    handleInputChange,
    handleCEPSearch,
    validateForm
  } = useSupplierForm(supplier);

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

      onSave(supplierData);
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

  const handleSupplierTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, supplier_type: value }));
  };

  const handleZipCodeChange = (value: string) => {
    setFormData(prev => ({ ...prev, zip_code: value }));
  };

  const handleStateChange = (value: string) => {
    setFormData(prev => ({ ...prev, state: value }));
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
          <SupplierBasicInfo
            formData={formData}
            onInputChange={handleInputChange}
            onSupplierTypeChange={handleSupplierTypeChange}
          />

          <SupplierContactInfo
            formData={formData}
            onInputChange={handleInputChange}
          />

          <SupplierAddressInfo
            formData={formData}
            onInputChange={handleInputChange}
            onCEPSearch={handleCEPSearch}
            onZipCodeChange={handleZipCodeChange}
            onStateChange={handleStateChange}
            cepLoading={cepLoading}
          />

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
