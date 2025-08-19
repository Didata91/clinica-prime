import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Clientes from "./pages/Clientes";
import Profissionais from "./pages/Profissionais";
import Servicos from "./pages/Servicos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/agenda" element={<AppLayout><Agenda /></AppLayout>} />
          <Route path="/clientes" element={<AppLayout><Clientes /></AppLayout>} />
          <Route path="/profissionais" element={<AppLayout><Profissionais /></AppLayout>} />
          <Route path="/servicos" element={<AppLayout><Servicos /></AppLayout>} />
          <Route path="/atendimentos" element={<AppLayout><div>Atendimentos - Em desenvolvimento</div></AppLayout>} />
          <Route path="/prontuarios" element={<AppLayout><div>Prontuários - Em desenvolvimento</div></AppLayout>} />
          <Route path="/financeiro" element={<AppLayout><div>Financeiro - Em desenvolvimento</div></AppLayout>} />
          <Route path="/relatorios" element={<AppLayout><div>Relatórios - Em desenvolvimento</div></AppLayout>} />
          <Route path="/configuracoes" element={<AppLayout><div>Configurações - Em desenvolvimento</div></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
