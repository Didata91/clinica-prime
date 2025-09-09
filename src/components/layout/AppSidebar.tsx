import { Calendar, Users, UserCog, Package, FileText, DollarSign, BarChart3, Settings, Activity, CalendarClock, LogOut, Upload, TrendingUp } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Activity },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Profissionais", url: "/profissionais", icon: UserCog },
  { title: "Serviços", url: "/servicos", icon: Package },
//{ title: "Atendimentos", url: "/atendimentos", icon: CalendarClock },
  { title: "Prontuários", url: "/prontuarios", icon: FileText },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

const agendasMenuItems = [
  { title: "Gerenciar Agendas", url: "/agendas-lista", icon: Calendar },
  { title: "Importar CSV", url: "/importar-agendas", icon: Upload },
  { title: "Dashboard Financeiro", url: "/dashboard-agendas", icon: TrendingUp },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            {open && (
              <div className="flex flex-col">
                <h1 className="font-semibold text-sm">Clínica Prime</h1>
                <p className="text-xs text-muted-foreground">Gestão Estética</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema Agendas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {agendasMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {open && user?.email && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start p-0 h-auto"
        >
          <div className="flex items-center gap-2 p-2 w-full">
            <LogOut className="h-4 w-4" />
            {open && <span>Sair</span>}
          </div>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
