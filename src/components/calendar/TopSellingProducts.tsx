
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package } from "lucide-react";

interface TopSellingProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface TopSellingProductsProps {
  products: TopSellingProduct[];
}

export function TopSellingProducts({ products }: TopSellingProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top 5 Productos del Mes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay ventas registradas este mes
            </p>
          ) : (
            products.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{product.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${product.totalRevenue.toFixed(2)} en ventas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {product.totalQuantity}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
