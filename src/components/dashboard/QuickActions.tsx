
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  ShoppingCart, 
  Calendar,
  FileText,
  Package,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Control de Inventario",
      description: "Gestiona productos y stock",
      icon: Package,
      onClick: () => navigate('/inventory'),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Ventas",
      description: "Registra nueva venta",
      icon: ShoppingCart,
      onClick: () => navigate('/sales'),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Dashboard",
      description: "Próximamente",
      icon: BarChart3,
      onClick: () => navigate('/'),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Calendario",
      description: "Programar eventos",
      icon: Calendar,
      onClick: () => navigate('/calendar'),
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Generador de Reporte",
      description: "Crear informes detallados",
      icon: FileText,
      onClick: () => navigate('/reports'),
      color: "bg-teal-500 hover:bg-teal-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {actions.map((action, index) => (
        <Card 
          key={action.title}
          className="hover-scale animate-fade-in cursor-pointer group"
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={action.onClick}
        >
          <CardContent className="p-6 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${action.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <action.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
