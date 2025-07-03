
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { toast } from "@/hooks/use-toast";

export function CategoryManager() {
  const { categories, addCategory, removeCategory } = useInventoryStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría no puede estar vacío.",
        variant: "destructive"
      });
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Error",
        description: "Esta categoría ya existe.",
        variant: "destructive"
      });
      return;
    }

    addCategory(newCategory.trim());
    setNewCategory('');
    setIsDialogOpen(false);
    toast({
      title: "Categoría agregada",
      description: `${newCategory} ha sido agregada exitosamente.`
    });
  };

  const handleRemoveCategory = (categoryName: string) => {
    removeCategory(categoryName);
    toast({
      title: "Categoría eliminada",
      description: `${categoryName} ha sido eliminada.`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Categorías</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nueva Categoría</DialogTitle>
              <DialogDescription>
                Ingresa el nombre de la nueva categoría para tus productos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category-name" className="text-right">Nombre</Label>
                <Input
                  id="category-name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="col-span-3"
                  placeholder="Ej: Electrónicos"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCategory}>Agregar Categoría</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge key={category} variant="secondary" className="flex items-center gap-2">
            {category}
            <button
              onClick={() => handleRemoveCategory(category)}
              className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
