import { useState } from "react";
import { AlertTriangle, Package, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { useNavigate } from "react-router-dom";

export function StockAlertBadge() {
  const { computed, loading } = useInventoryStore();
  const lowStockProducts = computed.lowStockProducts;
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-muted rounded animate-pulse"></div>
        <div className="w-16 h-4 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  // Show OK state when no low stock products
  if (lowStockProducts.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-success" />
        <span className="text-sm text-success hidden sm:inline">Stock OK</span>
      </div>
    );
  }

  const alertColor = lowStockProducts.length > 5 ? "text-destructive" : "text-warning";
  const badgeVariant = lowStockProducts.length > 5 ? "destructive" : "secondary";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 hover:bg-muted/50"
        >
          <AlertTriangle className={`w-5 h-5 ${alertColor}`} />
          <Badge variant={badgeVariant} className="text-xs">
            {lowStockProducts.length}
          </Badge>
          <span className="text-sm hidden sm:inline">Stock Bajo</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${alertColor}`} />
            <h3 className="font-semibold">Alerta de Stock Bajo</h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {lowStockProducts.length} producto(s) necesitan reabastecimiento:
          </p>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-md border"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <div className="text-right ml-2">
                  <Badge variant="destructive" className="text-xs">
                    {product.stock}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Mín: {product.minStock}
                  </p>
                </div>
              </div>
            ))}
            {lowStockProducts.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                Y {lowStockProducts.length - 5} más...
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                navigate('/inventory');
                setIsOpen(false);
              }}
              className="flex-1"
            >
              <Package className="w-4 h-4 mr-2" />
              Ver Inventario
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
