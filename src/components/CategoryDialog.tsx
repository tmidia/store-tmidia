import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Category } from '@/hooks/useCategories';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSave: (data: { name: string; description?: string | null; parent_id?: string | null }) => void;
  mainCategories?: Category[];
  isSubcategory?: boolean;
  parentCategoryId?: string;
}

const CategoryDialog = ({ 
  isOpen, 
  onClose, 
  category, 
  onSave, 
  mainCategories = [],
  isSubcategory = false,
  parentCategoryId
}: CategoryDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parent_id: category.parent_id || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        parent_id: isSubcategory && parentCategoryId ? parentCategoryId : ''
      });
    }
  }, [category, isOpen, isSubcategory, parentCategoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description || null,
      parent_id: formData.parent_id || null
    });
  };

  const isEditingSubcategory = category?.parent_id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {category 
              ? (isEditingSubcategory ? 'Editar Subcategoria' : 'Editar Categoria Pai')
              : (formData.parent_id ? 'Nova Subcategoria' : 'Nova Categoria Pai')
            }
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!category && (
            <div>
              <Label htmlFor="parent_id">Tipo de Categoria</Label>
              <Select 
                value={formData.parent_id || 'none'} 
                onValueChange={(value) => setFormData({...formData, parent_id: value === 'none' ? '' : value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">📁 Categoria Pai (Principal)</SelectItem>
                  {mainCategories.length > 0 && (
                    <>
                      {mainCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          📂 Subcategoria de: {cat.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.parent_id 
                  ? 'Esta será uma subcategoria vinculada à categoria selecionada'
                  : 'Esta será uma categoria principal que pode ter subcategorias'
                }
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="name">
              {formData.parent_id ? 'Nome da Subcategoria *' : 'Nome da Categoria *'}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder={formData.parent_id ? 'Nome da subcategoria' : 'Nome da categoria'}
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição da categoria..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              {category ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
