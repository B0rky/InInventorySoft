
import { useState } from "react";
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
import { Plus, ShoppingCart } from "lucide-react";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { toast } from "@/hooks/use-toast";

export default function Sales() {
  const { products, sales, addSale } = useInventoryStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [saleData, setSaleData] = useState({
    productId: '',
    quantity: 1,
    customer: ''
  });

  const selectedProduct = products.find(p => p.id === saleData.productId);
  const totalPrice = selectedProduct ? selectedProduct.salePrice * saleData.quantity : 0;

  const handleAddSale = () => {
    if (!saleData.productId || saleData.quantity <= 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona un producto y cantidad válida.",
        variant: "destructive"
      });
      return;
    }

    const product = products.find(p => p.id === saleData.productId);
    if (!product) {
      toast({
        title: "Error",
        description: "Producto no encontrado.",
        variant: "destructive"
      });
      return;
    }

    if (product.stock < saleData.quantity) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.stock} unidades disponibles de ${product.name}.`,
        variant: "destructive"
      });
      return;
    }

    addSale({
      productId: saleData.productId,
      productName: product.name,
      quantity: saleData.quantity,
      unitPrice: product.salePrice,
      totalPrice: totalPrice,
      date: new Date(),
      customer: saleData.customer
    });

    setSaleData({ productId: '', quantity: 1, customer: '' });
    setIsAddDialogOpen(false);
    toast({
      title: "Venta registrada",
      description: `Venta de ${product.name} registrada exitosamente.`
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
          <p className="text-muted-foreground">Registra y gestiona las ventas</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Venta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nueva Venta</DialogTitle>
              <DialogDescription>
                Selecciona el producto y cantidad para registrar la venta.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product" className="text-right">Producto</Label>
                <Select
                  value={saleData.productId}
                  onValueChange={(value) => setSaleData({...saleData, productId: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.stock > 0).map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - Stock: {product.stock} - ${product.salePrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct?.stock || 1}
                  value={saleData.quantity}
                  onChange={(e) => setSaleData({...saleData, quantity: parseInt(e.target.value) || 1})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">Cliente</Label>
                <Input
                  id="customer"
                  value={saleData.customer}
                  onChange={(e) => setSaleData({...saleData, customer: e.target.value})}
                  className="col-span-3"
                  placeholder="Nombre del cliente (opcional)"
                />
              </div>
              
              {selectedProduct && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Total</Label>
                  <div className="col-span-3">
                    <p className="text-2xl font-bold text-primary">
                      ${totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${selectedProduct.salePrice} x {saleData.quantity}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleAddSale} disabled={!selectedProduct}>
                Registrar Venta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ventas</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold">
                  ${sales.reduce((sum, sale) => sum + sale.totalPrice, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Promedio por Venta</p>
                <p className="text-2xl font-bold">
                  ${sales.length > 0 ? (sales.reduce((sum, sale) => sum + sale.totalPrice, 0) / sales.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unit.</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.date.toLocaleDateString()}</TableCell>
                  <TableCell>{sale.productName}</TableCell>
                  <TableCell>{sale.customer || 'Cliente anónimo'}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>${sale.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">${sale.totalPrice.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay ventas registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
