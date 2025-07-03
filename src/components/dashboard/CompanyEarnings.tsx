import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Percent, Calculator } from "lucide-react";

interface CompanyEarningsProps {
  earnings: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
  };
}

export function CompanyEarnings({ earnings }: CompanyEarningsProps) {
  const metrics = [
    {
      title: "Ingresos Totales",
      value: `$${earnings.totalRevenue.toLocaleString('es-CO')}`,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Costos Totales",
      value: `$${earnings.totalCost.toLocaleString('es-CO')}`,
      icon: Calculator,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Ganancia Total",
      value: `$${earnings.totalProfit.toLocaleString('es-CO')}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Margen de Ganancia",
      value: `${earnings.profitMargin.toFixed(1)}%`,
      icon: Percent,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={metric.title} className="hover-scale animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`w-8 h-8 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
