import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag,
  ChevronRight,
  FolderOpen,
  Folder
} from 'lucide-react';
import { useCategories, type Category } from '@/hooks/useCategories';
import CategoryDialog from '@/components/CategoryDialog';

const Categorias = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { 
    mainCategories, 
    loading, 
    saveCategory, 
    deleteCategory,
    getSubcategories,
    getCategoriesWithSubcategories
  } = useCategories();

  const handleSaveCategory = async (categoryData: { name: string; description?: string | null; parent_id?: string | null }) => {
    const success = await saveCategory(categoryData, editingCategory);
    if (success) {
      setIsDialogOpen(false);
      setEditingCategory(null);
      setIsCreatingSubcategory(false);
      setParentCategoryId('');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setIsCreatingSubcategory(false);
    setParentCategoryId('');
    setIsDialogOpen(true);
  };

  const handleNewSubcategory = (parentId: string) => {
    setEditingCategory(null);
    setIsCreatingSubcategory(true);
    setParentCategoryId(parentId);
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCreatingSubcategory(!!category.parent_id);
    setParentCategoryId(category.parent_id || '');
    setIsDialogOpen(true);
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const categoriesWithSubs = getCategoriesWithSubcategories();

  const filteredCategories = categoriesWithSubs.filter(category => {
    const matchesMain = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSub = category.subcategories.some(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesMain || matchesSub;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-1">Gerencie categorias e subcategorias dos produtos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleNewCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar categoria ou subcategoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Categorias */}
      <div className="space-y-4">
        {filteredCategories.map(category => {
          const isExpanded = expandedCategories.has(category.id);
          const hasSubcategories = category.subcategories.length > 0;
          
          return (
            <Card key={category.id} className="border-0 shadow-md bg-white">
              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(category.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {hasSubcategories && (
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </Button>
                        </CollapsibleTrigger>
                      )}
                      {hasSubcategories ? (
                        <FolderOpen className="w-5 h-5 text-primary" />
                      ) : (
                        <Folder className="w-5 h-5 text-gray-400" />
                      )}
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </CardTitle>
                      {hasSubcategories && (
                        <span className="text-sm text-gray-500">
                          ({category.subcategories.length} subcategoria{category.subcategories.length > 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleNewSubcategory(category.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Subcategoria
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-2 ml-8">{category.description}</p>
                  )}
                </CardHeader>

                {hasSubcategories && (
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4">
                      <div className="ml-8 space-y-2 border-l-2 border-gray-200 pl-4">
                        {category.subcategories.map(sub => (
                          <div 
                            key={sub.id} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{sub.name}</span>
                              {sub.description && (
                                <span className="text-sm text-gray-500">- {sub.description}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditCategory(sub)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteCategory(sub.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou cadastre uma nova categoria.</p>
          </CardContent>
        </Card>
      )}

      <CategoryDialog 
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCategory(null);
          setIsCreatingSubcategory(false);
          setParentCategoryId('');
        }}
        category={editingCategory}
        onSave={handleSaveCategory}
        mainCategories={mainCategories}
        isSubcategory={isCreatingSubcategory}
        parentCategoryId={parentCategoryId}
      />
    </div>
  );
};

export default Categorias;
