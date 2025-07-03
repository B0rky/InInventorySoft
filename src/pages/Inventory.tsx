
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { toast } from "@/hooks/use-toast";
import { CategoryManager } from "@/components/inventory/CategoryManager";
import { ProductSearch } from "@/components/inventory/ProductSearch";

export default function Inventory() {
  const { products, categories, addProduct, updateProduct, deleteProduct, searchProducts } = useInventoryStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    minStock: 0,
    purchasePrice: 0,
    salePrice: 0,
    description: '',
    supplier: ''
  });

  const filteredProducts = searchTerm ? searchProducts(searchTerm) : products;

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleAddProduct = () => {
    if (!formData.name || !formData.category || formData.stock < 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos. El stock no puede ser negativo.",
        variant: "destructive"
      });
      return;
    }

    if (formData.purchasePrice <= 0 || formData.salePrice <= 0) {
      toast({
        title: "Error",
        description: "Los precios deben ser mayores a cero.",
        variant: "destructive"
      });
      return;
    }

    addProduct(formData);
    setFormData({ 
      name: '', 
      category: '', 
      stock: 0, 
      minStock: 0, 
      purchasePrice: 0, 
      salePrice: 0, 
      description: '', 
      supplier: '' 
    });
    setIsAddDialogOpen(false);
    toast({
      title: "Producto agregado",
      description: `${formData.name} ha sido agregado al inventario.`
    });
  };

  const handleEditProduct = () => {
    if (!formData.name || !formData.category || formData.stock < 0) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos. El stock no puede ser negativo.",
        variant: "destructive"
      });
      return;
    }

    if (formData.purchasePrice <= 0 || formData.salePrice <= 0) {
      toast({
        title: "Error",
        description: "Los precios deben ser mayores a cero.",
        variant: "destructive"
      });
      return;
    }

    updateProduct(editingProduct.id, formData);
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    toast({
      title: "Producto actualizado",
      description: `${formData.name} ha sido actualizado.`
    });
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    deleteProduct(productId);
    toast({
      title: "Producto eliminado",
      description: `${productName} ha sido eliminado del inventario.`
    });
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      stock: product.stock,
      minStock: product.minStock,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      description: product.description || '',
      supplier: product.supplier || ''
    });
    setIsEditDialogOpen(true);
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return { label: 'Bajo', variant: 'destructive' as const };
    if (stock <= minStock * 1.5) return { label: 'Medio', variant: 'secondary' as const };
    return { label: 'Alto', variant: 'default' as const };
  };

  const calculateProfitMargin = (purchasePrice: number, salePrice: number) => {
    return ((salePrice - purchasePrice) / purchasePrice * 100).toFixed(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Control de Inventario</h1>
          <p className="text-muted-foreground">Gestiona tus productos y stock</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Producto</DialogTitle>
              <DialogDescription>
                Completa la información del producto que deseas agregar al inventario.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Math.max(0, parseInt(e.target.value) || 0)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minStock" className="text-right">Stock Mínimo</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: Math.max(0, parseInt(e.target.value) || 0)})}
                    className="col-span-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="purchasePrice" className="text-right">Precio Compra</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="salePrice" className="text-right">Precio Venta</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({...formData, salePrice: parseFloat(e.target.value) || 0})}
                    className="col-span-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="col-span-3"
                  placeholder="Descripción opcional"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplier" className="text-right">Proveedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  className="col-span-3"
                  placeholder="Proveedor opcional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddProduct}>Agregar Producto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gestión de Categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryManager />
        </CardContent>
      </Card>

      {/* Búsqueda y Lista de Productos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Productos</CardTitle>
            <div className="w-full sm:w-80">
              <ProductSearch onSearch={handleSearch} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio Compra</TableHead>
                <TableHead>Precio Venta</TableHead>
                <TableHead>Margen</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.minStock);
                const profitMargin = calculateProfitMargin(product.purchasePrice, product.salePrice);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.stock <= product.minStock && (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        )}
                        {product.stock}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </TableCell>
                    <TableCell>${product.purchasePrice.toFixed(2)}</TableCell>
                    <TableCell>${product.salePrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={parseFloat(profitMargin) > 20 ? "default" : "secondary"}>
                        {profitMargin}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica la información del producto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Nombre</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: Math.max(0, parseInt(e.target.value) || 0)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-minStock" className="text-right">Stock Mínimo</Label>
                <Input
                  id="edit-minStock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: Math.max(0, parseInt(e.target.value) || 0)})}
                  className="col-span-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-purchasePrice" className="text-right">Precio Compra</Label>
                <Input
                  id="edit-purchasePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-salePrice" className="text-right">Precio Venta</Label>
                <Input
                  id="edit-salePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({...formData, salePrice: parseFloat(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditProduct}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
