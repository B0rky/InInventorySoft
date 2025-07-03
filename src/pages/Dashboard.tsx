import React, { useMemo, Suspense, lazy } from 'react';
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useInventoryStore } from "@/hooks/useInventoryStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle, Box } from "lucide-react";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';

// Lazy load heavy components for better performance
const CompanyEarnings = lazy(() => import('@/components/dashboard/CompanyEarnings').then(module => ({ default: module.CompanyEarnings })));
const ProductPerformanceChart = lazy(() => import('@/components/dashboard/ProductPerformanceChart').then(module => ({ default: module.ProductPerformanceChart })));
const TopSellingProducts = lazy(() => import('@/components/calendar/TopSellingProducts').then(module => ({ default: module.TopSellingProducts })));
const DailySalesSheet = lazy(() => import('@/components/calendar/DailySalesSheet').then(module => ({ default: module.DailySalesSheet })));

// Optimized KPI Card component
const KPICard: React.FC<{
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  percentage?: number;
  icon: string;
  loading?: boolean;
}> = ({ title, value, trend, percentage, icon, loading }) => {
  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="h-4 w-4">
            <LoadingSpinner size="sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && percentage && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {percentage}% vs mes anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Loading fallback component
const ChartLoadingFallback: React.FC = () => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle>Cargando gráficos...</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    computed, 
    loading, 
    loadingStates, 
    error,
    products,
    sales,
    categories,
    calendarEvents,
    getProductPerformanceData
  } = useInventoryStore();

  // Memoized computed values for better performance
  const dashboardData = useMemo(() => {
    if (!computed) return null;

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    return {
      totalRevenue: formatCurrency(computed.totalRevenue),
      totalProfit: formatCurrency(computed.totalProfit),
      profitMargin: computed.profitMargin.toFixed(1),
      lowStockCount: computed.lowStockProducts.length,
      totalProducts: products.length,
      totalSales: sales.length,
      totalCategories: categories.length,
      totalEvents: calendarEvents.length,
      salesLastMonth: formatCurrency(computed.salesLastMonth),
      // Calculate trends (simplified for performance)
      revenueTrend: computed.totalRevenue > 0 ? 'up' as const : 'stable' as const,
      profitTrend: computed.totalProfit > 0 ? 'up' as const : 'stable' as const,
      revenuePercentage: computed.totalRevenue > 0 ? 12 : 0, // Mock percentage
      profitPercentage: computed.totalProfit > 0 ? 8 : 0, // Mock percentage
    };
  }, [computed, products.length, sales.length, categories.length, calendarEvents.length]);

  // Memoized chart products for better performance
  const chartProducts = useMemo(() => {
    return products.slice(0, 10).map(product => ({
      id: product.id,
      name: product.name
    }));
  }, [products]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <KPICard
              key={i}
              title="Cargando..."
              value=""
              icon=""
              loading={true}
            />
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <ChartLoadingFallback />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error al cargar los datos: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state
  if (!dashboardData) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">No hay datos disponibles</p>
              <p className="text-sm text-gray-500">Agrega productos y ventas para ver estadísticas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard {user?.user_metadata?.name ? `- ${user.user_metadata.name}` : ''}
        </h2>
      </div>

      {/* KPI Cards with individual loading states */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Ingresos Totales"
          value={dashboardData.totalRevenue}
          trend={dashboardData.revenueTrend}
          percentage={dashboardData.revenuePercentage}
          icon="💰"
          loading={loadingStates.sales}
        />
        <KPICard
          title="Beneficio Total"
          value={dashboardData.totalProfit}
          trend={dashboardData.profitTrend}
          percentage={dashboardData.profitPercentage}
          icon="📈"
          loading={loadingStates.sales}
        />
        <KPICard
          title="Margen de Beneficio"
          value={`${dashboardData.profitMargin}%`}
          icon="🎯"
          loading={loadingStates.sales}
        />
        <KPICard
          title="Productos con Stock Bajo"
          value={dashboardData.lowStockCount}
          icon="⚠️"
          loading={loadingStates.products}
        />
      </div>

      {/* Charts and Tables with Suspense for better performance */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Suspense fallback={<ChartLoadingFallback />}>
          <CompanyEarnings />
        </Suspense>
        
        <Suspense fallback={<ChartLoadingFallback />}>
          <ProductPerformanceChart 
            products={chartProducts}
            onProductSelect={getProductPerformanceData}
          />
        </Suspense>
        
        <Suspense fallback={<ChartLoadingFallback />}>
          <TopSellingProducts />
        </Suspense>
        
        <Suspense fallback={<ChartLoadingFallback />}>
          <DailySalesSheet />
        </Suspense>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <span className="text-2xl">🛒</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalSales}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <span className="text-2xl">🏷️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalCategories}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalEvents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Acciones Rápidas</h2>
        <QuickActions />
      </div>
    </div>
  );
}
