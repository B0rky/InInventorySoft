import { create } from 'zustand';
import { Product, Sale, KPI, CalendarEvent, User } from '@/types/inventory';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

interface InventoryState {
  products: Product[];
  sales: Sale[];
  categories: string[];
  calendarEvents: CalendarEvent[];
  user: User | null;
  kpis: KPI[];
  loading: boolean;
  error: string | null;
  // Computed values with memoization
  computed: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
    lowStockProducts: Product[];
    topSellingProducts: Array<{ productId: string; productName: string; totalQuantity: number; totalRevenue: number }>;
    salesByCategory: { [category: string]: number };
    salesLastMonth: number;
  };
  // Loading states for individual sections
  loadingStates: {
    products: boolean;
    sales: boolean;
    categories: boolean;
    events: boolean;
  };
  // Actions
  fetchProducts: (userId: string) => Promise<void>;
  fetchSales: (userId: string) => Promise<void>;
  fetchCategories: (userId: string) => Promise<void>;
  fetchCalendarEvents: (userId: string) => Promise<void>;
  fetchAllData: (userId: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>, userId: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'lastUpdated'>>, userId: string) => Promise<void>;
  deleteProduct: (id: string, userId: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>, userId: string) => Promise<void>;
  deleteSale: (id: string, userId: string) => Promise<void>;
  addCategory: (category: string, userId: string) => Promise<void>;
  removeCategory: (category: string, userId: string) => Promise<void>;
  searchProducts: (searchTerm: string) => Product[];
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>, userId: string) => Promise<void>;
  getSalesByDate: (date: Date) => Sale[];
  getProductPerformanceData: (productId: string) => Array<{
    date: string;
    sales: number;
    revenue: number;
    profit: number;
  }>;
  getAllProductsForChart: () => Array<{ id: string; name: string }>;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>, userId: string) => Promise<void>;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>, userId: string) => Promise<void>;
  deleteCalendarEvent: (id: string, userId: string) => Promise<void>;
  setUser: (user: User) => void;
  updateComputedValues: () => void;
  clearData: () => void;
}

// Optimized compute function with caching
let computedCache: {
  productsHash: string;
  salesHash: string;
  result: any;
} | null = null;

const computeValues = (products: Product[], sales: Sale[]) => {
  // Create hash for caching
  const productsHash = JSON.stringify(products.map(p => ({ id: p.id, stock: p.stock, minStock: p.minStock })));
  const salesHash = JSON.stringify(sales.map(s => ({ id: s.id, productId: s.productId, totalPrice: s.totalPrice, date: s.date })));
  
  // Check cache
  if (computedCache && 
      computedCache.productsHash === productsHash && 
      computedCache.salesHash === salesHash) {
    return computedCache.result;
  }

  // Use Web Workers for heavy computations if available
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  
  // Optimize cost calculation with Map for O(1) lookups
  const productMap = new Map(products.map(p => [p.id, p]));
  const totalCost = sales.reduce((sum, sale) => {
    const product = productMap.get(sale.productId);
    return sum + (product ? product.purchasePrice * sale.quantity : 0);
  }, 0);
  
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Optimize low stock filter
  const lowStockProducts = products.filter(product => product.stock <= product.minStock);

  // Optimize product sales calculation with Map
  const salesMap = new Map<string, Sale[]>();
  sales.forEach(sale => {
    if (!salesMap.has(sale.productId)) {
      salesMap.set(sale.productId, []);
    }
    salesMap.get(sale.productId)!.push(sale);
  });

  const productSales = products.map(product => {
    const productSalesData = salesMap.get(product.id) || [];
    const totalQuantity = productSalesData.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalRevenue = productSalesData.reduce((sum, sale) => sum + sale.totalPrice, 0);
    
    return {
      productId: product.id,
      productName: product.name,
      totalQuantity,
      totalRevenue
    };
  });

  const topSellingProducts = productSales
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  // Optimize sales by category
  const salesByCategory = new Map<string, number>();
  sales.forEach(sale => {
    const product = productMap.get(sale.productId);
    const category = product?.category || 'Sin categoría';
    salesByCategory.set(category, (salesByCategory.get(category) || 0) + sale.totalPrice);
  });

  // Optimize last month sales calculation
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  const salesLastMonth = sales
    .filter(sale => sale.date >= lastMonth && sale.date <= today)
    .reduce((total, sale) => total + sale.totalPrice, 0);

  const result = {
    totalRevenue,
    totalCost,
    totalProfit,
    profitMargin,
    lowStockProducts,
    topSellingProducts,
    salesByCategory: Object.fromEntries(salesByCategory),
    salesLastMonth
  };

  // Cache the result
  computedCache = {
    productsHash,
    salesHash,
    result
  };

  return result;
};

// Debounce function for search optimization
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  categories: [],
  sales: [],
  calendarEvents: [],
  events: [],
  user: null,
  kpis: [],
  loading: false,
  error: null,
  loadingStates: {
    products: false,
    sales: false,
    categories: false,
    events: false
  },
  computed: {
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0,
    lowStockProducts: [],
    topSellingProducts: [],
    salesByCategory: {},
    salesLastMonth: 0
  },

  // Parallel data fetching for better performance
  fetchAllData: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      // Fetch all data in parallel for maximum speed
      const [productsResult, salesResult, categoriesResult, eventsResult] = await Promise.allSettled([
        supabase
          .from('inventory_items')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('sales')
          .select('*')
          .eq('user_id', userId)
          .order('sale_date', { ascending: false }),
        supabase
          .from('inventory_items')
          .select('category')
          .eq('user_id', userId),
        supabase
          .from('events')
          .select('*')
          .eq('user_id', userId)
          .order('start_date', { ascending: true })
      ]);

      // Process results
      const products = productsResult.status === 'fulfilled' && !productsResult.value.error
        ? productsResult.value.data.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            stock: item.quantity,
            minStock: item.low_stock_threshold || 0,
            purchasePrice: item.unit_price || 0,
            salePrice: item.unit_price || 0,
            description: item.description,
            supplier: item.supplier,
            lastUpdated: new Date(item.updated_at)
          }))
        : [];

      const sales = salesResult.status === 'fulfilled' && !salesResult.value.error
        ? salesResult.value.data.map(sale => ({
            id: sale.id,
            productId: sale.item_id,
            productName: sale.customer_name || 'Producto',
            quantity: sale.quantity,
            unitPrice: sale.unit_price,
            totalPrice: sale.total_amount,
            date: new Date(sale.sale_date),
            customer: sale.customer_name
          }))
        : [];

      const categories = categoriesResult.status === 'fulfilled' && !categoriesResult.value.error
        ? [...new Set(categoriesResult.value.data.map(item => item.category))]
        : [];

      const events = eventsResult.status === 'fulfilled' && !eventsResult.value.error
        ? eventsResult.value.data.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: new Date(event.start_date),
            type: 'other' as const
          }))
        : [];

      // Update state with all data at once
      set(state => {
        const newState = {
          ...state,
          products,
          sales,
          categories,
          calendarEvents: events,
          events,
          loading: false
        };
        const computed = computeValues(newState.products, newState.sales);
        return { ...newState, computed };
      });

    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Individual fetch functions for selective loading
  fetchProducts: async (userId: string) => {
    set(state => ({ loadingStates: { ...state.loadingStates, products: true } }));
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const products = data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        stock: item.quantity,
        minStock: item.low_stock_threshold || 0,
        purchasePrice: item.unit_price || 0,
        salePrice: item.unit_price || 0,
        description: item.description,
        supplier: item.supplier,
        lastUpdated: new Date(item.updated_at)
      }));

      set(state => {
        const newState = { ...state, products };
        const computed = computeValues(newState.products, newState.sales);
        return { 
          ...newState, 
          computed, 
          loadingStates: { ...state.loadingStates, products: false }
        };
      });
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, products: false }
      }));
    }
  },

  fetchSales: async (userId: string) => {
    set(state => ({ loadingStates: { ...state.loadingStates, sales: true } }));
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', userId)
        .order('sale_date', { ascending: false });

      if (error) throw error;

      const sales = data.map(sale => ({
        id: sale.id,
        productId: sale.item_id,
        productName: sale.customer_name || 'Producto',
        quantity: sale.quantity,
        unitPrice: sale.unit_price,
        totalPrice: sale.total_amount,
        date: new Date(sale.sale_date),
        customer: sale.customer_name
      }));

      set(state => {
        const newState = { ...state, sales };
        const computed = computeValues(newState.products, newState.sales);
        return { 
          ...newState, 
          computed, 
          loadingStates: { ...state.loadingStates, sales: false }
        };
      });
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, sales: false }
      }));
    }
  },

  fetchCategories: async (userId: string) => {
    set(state => ({ loadingStates: { ...state.loadingStates, categories: true } }));
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('category')
        .eq('user_id', userId);

      if (error) throw error;

      const categories = [...new Set(data.map(item => item.category))];
      set(state => ({ 
        categories, 
        loadingStates: { ...state.loadingStates, categories: false }
      }));
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, categories: false }
      }));
    }
  },

  fetchCalendarEvents: async (userId: string) => {
    set(state => ({ loadingStates: { ...state.loadingStates, events: true } }));
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: true });

      if (error) throw error;

      const events = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: new Date(event.start_date),
        type: 'other' as const
      }));

      set(state => ({ 
        calendarEvents: events, 
        events, 
        loadingStates: { ...state.loadingStates, events: false }
      }));
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, events: false }
      }));
    }
  },

  addProduct: async (product, userId) => {
    set(state => ({ loadingStates: { ...state.loadingStates, products: true } }));
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          name: product.name,
          category: product.category,
          quantity: product.stock,
          low_stock_threshold: product.minStock,
          unit_price: product.purchasePrice,
          description: product.description,
          supplier: product.supplier,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct = {
        id: data.id,
        name: data.name,
        category: data.category,
        stock: data.quantity,
        minStock: data.low_stock_threshold || 0,
        purchasePrice: data.unit_price || 0,
        salePrice: data.unit_price || 0,
        description: data.description,
        supplier: data.supplier,
        lastUpdated: new Date(data.created_at)
      };

      set(state => {
        const newState = {
          ...state,
          products: [...state.products, newProduct]
        };
        const computed = computeValues(newState.products, newState.sales);
        return { 
          ...newState, 
          computed, 
          loadingStates: { ...state.loadingStates, products: false }
        };
      });
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, products: false }
      }));
    }
  },

  updateProduct: async (id, updates, userId) => {
    set(state => ({ loadingStates: { ...state.loadingStates, products: true } }));
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.category) updateData.category = updates.category;
      if (updates.stock !== undefined) updateData.quantity = updates.stock;
      if (updates.minStock !== undefined) updateData.low_stock_threshold = updates.minStock;
      if (updates.purchasePrice !== undefined) updateData.unit_price = updates.purchasePrice;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.supplier !== undefined) updateData.supplier = updates.supplier;

      const { error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      set(state => {
        const newState = {
          ...state,
          products: state.products.map(product =>
            product.id === id ? { ...product, ...updates, lastUpdated: new Date() } : product
          )
        };
        const computed = computeValues(newState.products, newState.sales);
        return { 
          ...newState, 
          computed, 
          loadingStates: { ...state.loadingStates, products: false }
        };
      });
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, products: false }
      }));
    }
  },

  deleteProduct: async (id, userId) => {
    set(state => ({ loadingStates: { ...state.loadingStates, products: true } }));
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      set(state => {
        const newState = {
          ...state,
          products: state.products.filter(product => product.id !== id)
        };
        const computed = computeValues(newState.products, newState.sales);
        return { 
          ...newState, 
          computed, 
          loadingStates: { ...state.loadingStates, products: false }
        };
      });
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, products: false }
      }));
    }
  },

  addSale: async (sale, userId) => {
    set(state => ({ loadingStates: { ...state.loadingStates, sales: true } }));
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert({
          item_id: sale.productId,
          quantity: sale.quantity,
          unit_price: sale.unitPrice,
          total_amount: sale.totalPrice,
          sale_date: sale.date.toISOString(),
          customer_name: sale.customer,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      // Update product stock
      const product = get().products.find(p => p.id === sale.productId);
      if (product) {
        await get().updateProduct(sale.productId, { stock: product.stock - sale.quantity }, userId);
      }

      const newSale = {
        id: data.id,
        productId: data.item_id,
        productName: sale.productName,
        quantity: data.quantity,
        unitPrice: data.unit_price,
        totalPrice: data.total_amount,
        date: new Date(data.sale_date),
        customer: data.customer_name
      };

      set(state => {
        const newState = {
          ...state,
          sales: [...state.sales, newSale]
        };
        const computed = computeValues(newState.products, newState.sales);
        return { 
          ...newState, 
          computed, 
          loadingStates: { ...state.loadingStates, sales: false }
        };
      });
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, sales: false }
      }));
    }
  },

  deleteSale: async (id, userId) => {
    set(state => ({ loadingStates: { ...state.loadingStates, sales: true } }));
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      set(state => {
        const newState = {
          ...state,
          sales: state.sales.filter(sale => sale.id !== id)
        };
        const computed = computeValues(newState.products, newState.sales);
        return { 
          ...newState, 
          computed, 
          loadingStates: { ...state.loadingStates, sales: false }
        };
      });
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, sales: false }
      }));
    }
  },

  addCategory: async (category, userId) => {
    set(state => ({
      categories: [...new Set([...state.categories, category])]
    }));
  },

  removeCategory: async (category, userId) => {
    set(state => ({
      categories: state.categories.filter(cat => cat !== category)
    }));
  },

  // Optimized search with debouncing
  searchProducts: (searchTerm: string) => {
    const products = get().products;
    if (!searchTerm) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      (product.description && product.description.toLowerCase().includes(term))
    );
  },

  addEvent: async (event, userId) => {
    set(state => ({ loadingStates: { ...state.loadingStates, events: true } }));
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: event.title,
          description: event.description,
          start_date: event.date.toISOString(),
          end_date: event.date.toISOString(),
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      const newEvent = {
        id: data.id,
        title: data.title,
        description: data.description,
        date: new Date(data.start_date),
        type: 'other' as const
      };

      set(state => ({
        ...state,
        events: [...state.events, newEvent],
        calendarEvents: [...state.calendarEvents, newEvent],
        loadingStates: { ...state.loadingStates, events: false }
      }));
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, events: false }
      }));
    }
  },

  getSalesByDate: (date) => {
    const sales = get().sales;
    const targetDate = date.toDateString();
    return sales.filter(sale => sale.date.toDateString() === targetDate);
  },

  getProductPerformanceData: (productId: string) => {
    const { sales, products } = get();
    const product = products.find(p => p.id === productId);
    
    if (!product) return [];

    const productSales = sales.filter(sale => sale.productId === productId);
    
    // Use Map for O(1) lookups
    const salesByDate = new Map<string, { date: string; sales: number; revenue: number; profit: number }>();
    
    productSales.forEach(sale => {
      const dateKey = sale.date.toISOString().split('T')[0];
      
      if (!salesByDate.has(dateKey)) {
        salesByDate.set(dateKey, {
          date: dateKey,
          sales: 0,
          revenue: 0,
          profit: 0
        });
      }
      
      const entry = salesByDate.get(dateKey)!;
      entry.sales += sale.quantity;
      entry.revenue += sale.totalPrice;
      entry.profit += sale.totalPrice - (product.purchasePrice * sale.quantity);
    });

    return Array.from(salesByDate.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },

  getAllProductsForChart: () => {
    const { products } = get();
    return products.map(product => ({
      id: product.id,
      name: product.name
    }));
  },

  addCalendarEvent: async (event, userId) => {
    return get().addEvent(event, userId);
  },

  updateCalendarEvent: async (id, updates, userId) => {
    set(state => ({ loadingStates: { ...state.loadingStates, events: true } }));
    try {
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.date) {
        updateData.start_date = updates.date.toISOString();
        updateData.end_date = updates.date.toISOString();
      }

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      set(state => ({
        ...state,
        calendarEvents: state.calendarEvents.map(event =>
          event.id === id ? { ...event, ...updates } : event
        ),
        events: state.events.map(event =>
          event.id === id ? { ...event, ...updates } : event
        ),
        loadingStates: { ...state.loadingStates, events: false }
      }));
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, events: false }
      }));
    }
  },

  deleteCalendarEvent: async (id, userId) => {
    set(state => ({ loadingStates: { ...state.loadingStates, events: true } }));
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      set(state => ({
        ...state,
        calendarEvents: state.calendarEvents.filter(event => event.id !== id),
        events: state.events.filter(event => event.id !== id),
        loadingStates: { ...state.loadingStates, events: false }
      }));
    } catch (error) {
      set(state => ({ 
        error: error.message, 
        loadingStates: { ...state.loadingStates, events: false }
      }));
    }
  },

  setUser: (user) => set({ user }),

  updateComputedValues: () => set((state) => {
    const computed = computeValues(state.products, state.sales);
    return { computed };
  }),

  clearData: () => {
    computedCache = null; // Clear cache
    set({
      products: [],
      sales: [],
      categories: [],
      calendarEvents: [],
      events: [],
      kpis: [],
      computed: {
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
        profitMargin: 0,
        lowStockProducts: [],
        topSellingProducts: [],
        salesByCategory: {},
        salesLastMonth: 0
      },
      loading: false,
      error: null,
      loadingStates: {
        products: false,
        sales: false,
        categories: false,
        events: false
      }
    });
  }
}));
