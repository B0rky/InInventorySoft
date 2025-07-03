
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package, 
  Box, 
  AlertTriangle, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { KPI } from "@/types/inventory";

interface KPICardProps {
  kpi: KPI;
}

const iconMap = {
  package: Package,
  box: Box,
  'alert-triangle': AlertTriangle,
  'dollar-sign': DollarSign,
};

const trendIconMap = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const trendColorMap = {
  up: 'text-success',
  down: 'text-destructive',
  stable: 'text-muted-foreground',
};

export function KPICard({ kpi }: KPICardProps) {
  const Icon = iconMap[kpi.icon as keyof typeof iconMap] || Package;
  const TrendIcon = trendIconMap[kpi.trend];

  return (
    <Card className="hover-scale animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {kpi.value}
            </p>
            {kpi.percentage && (
              <div className={`flex items-center gap-1 text-sm ${trendColorMap[kpi.trend]}`}>
                <TrendIcon className="w-3 h-3" />
                <span>{kpi.percentage}% vs último mes</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
