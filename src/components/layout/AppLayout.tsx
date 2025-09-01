import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-foreground">
                  {getPageTitle(window.location.pathname)}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/agenda": "Agenda",
    "/clientes": "Clientes", 
    "/profissionais": "Profissionais",
    "/servicos": "Serviços",
    //"/atendimentos": "Atendimentos",
    "/prontuarios": "Prontuários",
    "/financeiro": "Financeiro",
    "/relatorios": "Relatórios", 
    "/configuracoes": "Configurações"
  };
  
  return titles[pathname] || "Clínica Prime";
}
