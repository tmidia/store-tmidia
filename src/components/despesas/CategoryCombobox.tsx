
import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFinancialCategories, useCreateFinancialCategory } from "@/hooks/useFinancialCategories";
import { toast } from "sonner";

interface CategoryComboboxProps {
  value?: string | null;
  onChange: (value: string) => void;
}

export function CategoryCombobox({ value, onChange }: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const { data: categories, isLoading } = useFinancialCategories('despesa');
  const createCategoryMutation = useCreateFinancialCategory();

  const handleCreateCategory = () => {
    const newCategoryName = searchValue.trim();
    if (!newCategoryName) return;

    if (categories?.some(c => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
        const existing = categories.find(c => c.name.toLowerCase() === newCategoryName.toLowerCase());
        if(existing) {
          onChange(existing.name);
          setOpen(false);
          setSearchValue("");
        }
        return;
    }

    createCategoryMutation.mutate({
        name: newCategoryName,
        type: 'despesa',
    }, {
        onSuccess: (newCategory) => {
            toast.success(`Categoria "${newCategory.name}" criada!`);
            onChange(newCategory.name);
            setOpen(false);
            setSearchValue("");
        },
        onError: (error) => {
            toast.error(`Erro ao criar categoria: ${error.message}`);
        }
    });
  };

  const selectedCategoryName = value ? categories?.find(c => c.name === value)?.name : "Selecione ou crie uma categoria";

  const filteredCategories = React.useMemo(() =>
    categories?.filter(c => c.name.toLowerCase().includes(searchValue.toLowerCase())) ?? [],
    [categories, searchValue]
  );
  
  const canCreate = !isLoading && searchValue.trim().length > 0 && !filteredCategories.some(c => c.name.toLowerCase() === searchValue.trim().toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{selectedCategoryName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar categoria..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
                {isLoading ? 'Carregando...' : 'Nenhuma categoria encontrada.'}
            </CommandEmpty>
            <CommandGroup>
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onChange(category.name);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
            {canCreate && (
              <CommandGroup>
                 <CommandItem
                    onSelect={handleCreateCategory}
                    className="cursor-pointer"
                    disabled={createCategoryMutation.isPending}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {createCategoryMutation.isPending ? 'Criando...' : `Criar "${searchValue.trim()}"`}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
