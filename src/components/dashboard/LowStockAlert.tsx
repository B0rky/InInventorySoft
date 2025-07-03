
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useInventoryStore } from "@/hooks/useInventoryStore";

export function LowStockAlert() {
  const { getLowStockProducts } = useInventoryStore();
  const lowStockProducts = getLowStockProducts();

  if (lowStockProducts.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <AlertTriangle className="w-5 h-5" />
            Stock Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ✅ Todos los productos tienen stock suficiente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in border-warning">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-warning">
          <AlertTriangle className="w-5 h-5" />
          Alerta de Stock Bajo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {lowStockProducts.length} producto(s) necesitan reabastecimiento:
        </p>
        <div className="space-y-2">
          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20"
            >
              <div>
                <p className="font-medium text-foreground">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>
              <div className="text-right">
                <Badge variant="destructive" className="mb-1">
                  {product.stock} restantes
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Mín: {product.minStock}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
