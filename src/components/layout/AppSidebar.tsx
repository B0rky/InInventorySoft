
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Calendar,
  User,
  LogOut,
  Menu
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Inventario", url: "/inventory", icon: Package },
  { title: "Ventas", url: "/sales", icon: ShoppingCart },
  { title: "Reportes", url: "/reports", icon: BarChart3 },
  { title: "Calendario", url: "/calendar", icon: Calendar },
];

interface UserProfile {
  name: string;
  email: string;
  company?: string;
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, company')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Fallback to user email
        setProfile({
          name: user?.email?.split('@')[0] || 'Usuario',
          email: user?.email || '',
          company: 'Sin empresa'
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const isActive = (path: string) => currentPath === path;

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive"
      });
    }
  };

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-border bg-sidebar`}
      collapsible="offcanvas"
    >
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">Inventory</h2>
              <p className="text-sm text-sidebar-foreground/70">Smart</p>
            </div>
          )}
        </div>
        {isCollapsed && (
          <SidebarTrigger className="self-end">
            <Menu className="w-4 h-4" />
          </SidebarTrigger>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.url)
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        {profile && (
          <div className="space-y-2">
            <NavLink
              to="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive("/profile")
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <User className="w-5 h-5" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{profile.name}</p>
                  <p className="text-sm text-sidebar-foreground/70 truncate">
                    {profile.company || 'Sin empresa'}
                  </p>
                </div>
              )}
            </NavLink>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
