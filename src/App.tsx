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
import Prontuarios from "./pages/Prontuarios";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/agenda" element={<ProtectedRoute><AppLayout><Agenda /></AppLayout></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><AppLayout><Clientes /></AppLayout></ProtectedRoute>} />
            <Route path="/profissionais" element={<ProtectedRoute><AppLayout><Profissionais /></AppLayout></ProtectedRoute>} />
            <Route path="/servicos" element={<ProtectedRoute><AppLayout><Servicos /></AppLayout></ProtectedRoute>} />
            <Route path="/atendimentos" element={<ProtectedRoute><AppLayout><Agenda /></AppLayout></ProtectedRoute>} />
            <Route path="/prontuarios" element={<ProtectedRoute><AppLayout><Prontuarios /></AppLayout></ProtectedRoute>} />
            <Route path="/financeiro" element={<ProtectedRoute><AppLayout><Financeiro /></AppLayout></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><AppLayout><Relatorios /></AppLayout></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><AppLayout><Configuracoes /></AppLayout></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
