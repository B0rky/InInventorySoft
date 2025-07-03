
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Sale, Product } from "@/types/inventory";
import { TrendingUp, DollarSign, Package } from "lucide-react";

interface DailySalesSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  sales: Sale[];
  products: Product[];
}

export function DailySalesSheet({ 
  isOpen, 
  onOpenChange, 
  selectedDate, 
  sales,
  products 
}: DailySalesSheetProps) {
  const getReturnPercentage = (productId: string, salePrice: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    const returnAmount = salePrice - product.purchasePrice;
    const returnPercentage = (returnAmount / product.purchasePrice) * 100;
    return returnPercentage;
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Ventas del {selectedDate?.toLocaleDateString()}
          </SheetTitle>
          <SheetDescription>
            Resumen de todas las ventas realizadas en este día
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Resumen del día */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Ingresos</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Productos</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
            </div>
          </div>

          {/* Lista de ventas */}
          <div className="space-y-3">
            <h3 className="font-semibold">Detalle de Ventas</h3>
            {sales.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay ventas registradas para este día
              </p>
            ) : (
              sales.map((sale) => {
                const returnPercentage = getReturnPercentage(sale.productId, sale.unitPrice);
                
                return (
                  <div key={sale.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{sale.productName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {sale.customer || 'Cliente anónimo'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {sale.quantity} unidad{sale.quantity > 1 ? 'es' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Precio Total:</span>
                        <p className="font-semibold">${sale.totalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Retorno:</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <p className={`font-semibold ${
                            returnPercentage > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {returnPercentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
