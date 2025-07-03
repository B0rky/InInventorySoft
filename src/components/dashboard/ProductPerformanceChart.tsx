
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface ProductPerformanceChartProps {
  products: Array<{ id: string; name: string }>;
  onProductSelect: (productId: string) => Array<{
    date: string;
    sales: number;
    revenue: number;
    profit: number;
  }>;
}

export function ProductPerformanceChart({ products, onProductSelect }: ProductPerformanceChartProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [chartData, setChartData] = useState<Array<{
    date: string;
    sales: number;
    revenue: number;
    profit: number;
  }>>([]);

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const data = onProductSelect(productId);
    setChartData(data);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Rendimiento de Productos
        </CardTitle>
        <div className="w-full max-w-xs">
          <Select value={selectedProductId} onValueChange={handleProductChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un producto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Fecha: ${formatDate(value as string)}`}
                  formatter={(value: number, name: string) => {
                    if (name === 'sales') return [value, 'Ventas (unidades)'];
                    if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Ingresos'];
                    if (name === 'profit') return [`$${value.toFixed(2)}`, 'Ganancia'];
                    return [value, name];
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="sales"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona un producto para ver su rendimiento</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
