import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Menu } from "lucide-react";
import { StockAlertBadge } from "@/components/dashboard/StockAlertBadge";
interface AppLayoutProps {
  children: React.ReactNode;
}
export function AppLayout({
  children
}: AppLayoutProps) {
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              
              <div className="flex items-center gap-3">
                
                
              </div>
            </div>

            <div className="flex items-center gap-4">
              <StockAlertBadge />
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>;
}