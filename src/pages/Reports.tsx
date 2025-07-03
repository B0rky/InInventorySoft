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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Filter, Download } from "lucide-react";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { ReportFilter } from "@/types/inventory";
import jsPDF from 'jspdf';

export default function Reports() {
  const { products, sales } = useInventoryStore();
  const [filters, setFilters] = useState<ReportFilter>({
    category: '',
    stockLevel: 'all',
    dateFrom: undefined,
    dateTo: undefined
  });

  const categories = [...new Set(products.map(p => p.category))];

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Filtrar ventas del mes actual
    const monthlySales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    // Calcular métricas
    const totalSales = monthlySales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalQuantitySold = monthlySales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.salePrice), 0);

    // Configurar el PDF
    doc.setFontSize(20);
    doc.text('Reporte Mensual - Inventory Soft', 20, 30);
    
    doc.setFontSize(12);
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    doc.text(`Período: ${monthNames[currentMonth]} ${currentYear}`, 20, 45);
    doc.text(`Generado: ${currentDate.toLocaleDateString()}`, 20, 55);

    // Métricas principales
    doc.setFontSize(16);
    doc.text('Métricas Principales', 20, 75);
    
    doc.setFontSize(12);
    let yPosition = 90;
    doc.text(`• Total de Ventas del Mes: $${totalSales.toFixed(2)}`, 25, yPosition);
    yPosition += 10;
    doc.text(`• Cantidad Total Vendida: ${totalQuantitySold} unidades`, 25, yPosition);
    yPosition += 10;
    doc.text(`• Total de Productos en Inventario: ${totalProducts}`, 25, yPosition);
    yPosition += 10;
    doc.text(`• Productos con Stock Bajo: ${lowStockProducts}`, 25, yPosition);
    yPosition += 10;
    doc.text(`• Valor Total del Inventario: $${totalInventoryValue.toFixed(2)}`, 25, yPosition);

    // Ventas del mes
    if (monthlySales.length > 0) {
      yPosition += 20;
      doc.setFontSize(16);
      doc.text('Ventas del Mes', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      monthlySales.slice(0, 10).forEach((sale) => {
        doc.text(`${sale.productName} - Cant: ${sale.quantity} - Total: $${sale.totalPrice.toFixed(2)}`, 25, yPosition);
        yPosition += 8;
      });
      
      if (monthlySales.length > 10) {
        doc.text(`... y ${monthlySales.length - 10} ventas más`, 25, yPosition);
      }
    }

    // Productos con stock bajo
    if (lowStockProducts > 0) {
      const lowStock = products.filter(p => p.stock <= p.minStock);
      yPosition += 20;
      doc.setFontSize(16);
      doc.text('Productos con Stock Bajo', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      lowStock.forEach((product) => {
        doc.text(`${product.name} - Stock: ${product.stock}/${product.minStock}`, 25, yPosition);
        yPosition += 8;
      });
    }

    // Descargar el PDF
    doc.save(`reporte-mensual-${monthNames[currentMonth]}-${currentYear}.pdf`);
  };

  const applyFilters = () => {
    let filteredProducts = [...products];

    if (filters.category && filters.category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }

    if (filters.stockLevel && filters.stockLevel !== 'all') {
      switch (filters.stockLevel) {
        case 'low':
          filteredProducts = filteredProducts.filter(p => p.stock <= p.minStock);
          break;
        case 'normal':
          filteredProducts = filteredProducts.filter(p => p.stock > p.minStock && p.stock <= p.minStock * 2);
          break;
        case 'high':
          filteredProducts = filteredProducts.filter(p => p.stock > p.minStock * 2);
          break;
      }
    }

    return filteredProducts;
  };

  const filteredProducts = applyFilters();

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return { label: 'Bajo', variant: 'destructive' as const };
    if (stock <= minStock * 2) return { label: 'Normal', variant: 'secondary' as const };
    return { label: 'Alto', variant: 'default' as const };
  };

  const generateCategoryReport = () => {
    const categoryStats = categories.map(category => {
      const categoryProducts = products.filter(p => p.category === category);
      const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
      const totalValue = categoryProducts.reduce((sum, p) => sum + (p.stock * p.salePrice), 0);
      const lowStockCount = categoryProducts.filter(p => p.stock <= p.minStock).length;

      return {
        category,
        productCount: categoryProducts.length,
        totalStock,
        totalValue,
        lowStockCount
      };
    });

    return categoryStats;
  };

  const categoryReport = generateCategoryReport();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Generador de Reportes</h1>
          <p className="text-muted-foreground">Genera informes detallados de tu inventario</p>
        </div>
        
        <Button onClick={generatePDFReport} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Reporte PDF
        </Button>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({...filters, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stockLevel">Nivel de Stock</Label>
              <Select
                value={filters.stockLevel}
                onValueChange={(value) => setFilters({...filters, stockLevel: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="low">Stock bajo</SelectItem>
                  <SelectItem value="normal">Stock normal</SelectItem>
                  <SelectItem value="high">Stock alto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined})}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                onChange={(e) => setFilters({...filters, dateTo: e.target.value ? new Date(e.target.value) : undefined})}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Button className="gap-2">
              <Filter className="w-4 h-4" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock Report */}
      <Card>
        <CardHeader>
          <CardTitle>Reporte de Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Stock Mínimo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.minStock);
                const totalValue = product.stock * product.salePrice;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.minStock}</TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </TableCell>
                    <TableCell>${totalValue.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Report */}
      <Card>
        <CardHeader>
          <CardTitle>Reporte por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Stock Total</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Productos con Stock Bajo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryReport.map((category) => (
                <TableRow key={category.category}>
                  <TableCell className="font-medium">{category.category}</TableCell>
                  <TableCell>{category.productCount}</TableCell>
                  <TableCell>{category.totalStock}</TableCell>
                  <TableCell>${category.totalValue.toFixed(2)}</TableCell>
                  <TableCell>
                    {category.lowStockCount > 0 ? (
                      <Badge variant="destructive">{category.lowStockCount}</Badge>
                    ) : (
                      <Badge variant="default">0</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
