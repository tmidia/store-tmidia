
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { capitalizeWords, formatCPF, formatCNPJ, formatPhone, isValidCPF, isValidCNPJ } from '@/utils/textUtils';
import { useCEP } from '@/hooks/useCEP';
import type { Database } from '@/integrations/supabase/types';

type Supplier = Database['public']['Tables']['suppliers']['Row'];

interface FormData {
  name: string;
  company_name: string;
  email: string;
  phone: string;
  cpf: string;
  cnpj: string;
  supplier_type: string;
  contact_person: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

export const useSupplierForm = (supplier: Supplier | null) => {
  const [formData, setFormData] = useState<FormData>({
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

  return {
    formData,
    setFormData,
    isLoading,
    setIsLoading,
    cepLoading,
    handleInputChange,
    handleCEPSearch,
    validateForm,
    resetForm
  };
};
