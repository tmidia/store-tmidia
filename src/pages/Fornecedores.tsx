
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useFornecedores } from '@/hooks/useFornecedores';
import SupplierDialog from '@/components/SupplierDialog';
import SupplierCard from '@/components/SupplierCard';
import SupplierFilters from '@/components/SupplierFilters';
import EmptySupplierState from '@/components/EmptySupplierState';

interface Supplier {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  cnpj?: string | null;
  cpf?: string | null;
  contact_person?: string | null;
  supplier_type?: string | null;
  company_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const Fornecedores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierType, setSelectedSupplierType] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { fornecedores, loading, saveFornecedor, deleteFornecedor } = useFornecedores();

  const handleSaveFornecedor = async (supplierData: any) => {
    const success = await saveFornecedor(supplierData, editingSupplier);
    if (success) {
      setIsDialogOpen(false);
      setEditingSupplier(null);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleNewSupplier = () => {
    setEditingSupplier(null);
    setIsDialogOpen(true);
  };

  const filteredSuppliers = fornecedores.filter(fornecedor => {
    const matchesSearch = fornecedor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.cpf?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplierType = selectedSupplierType === 'all' || fornecedor.supplier_type === selectedSupplierType;
    return matchesSearch && matchesSupplierType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-gray-600 mt-1">Gerencie seus fornecedores</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-dark w-full sm:w-auto" onClick={handleNewSupplier}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Filtros */}
      <SupplierFilters
        searchTerm={searchTerm}
        selectedSupplierType={selectedSupplierType}
        onSearchChange={setSearchTerm}
        onSupplierTypeChange={setSelectedSupplierType}
      />

      {/* Lista de Fornecedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(fornecedor => (
          <SupplierCard
            key={fornecedor.id}
            supplier={fornecedor as any}
            onEdit={handleEditSupplier}
            onDelete={deleteFornecedor}
          />
        ))}
      </div>

      {filteredSuppliers.length === 0 && <EmptySupplierState />}

      <SupplierDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        supplier={editingSupplier as any}
        onSave={handleSaveFornecedor}
      />
    </div>
  );
};

export default Fornecedores;
