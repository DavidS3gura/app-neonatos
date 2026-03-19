import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { canAccessModule } from "@/lib/permissions";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NeonatosPage from "./pages/NeonatosPage";
import ObservacionesPage from "./pages/ObservacionesPage";
import HistorialPage from "./pages/HistorialPage";
import ExportarPage from "./pages/ExportarPage";
import UsuariosPage from "./pages/UsuariosPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  adminOnly = false,
  module,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
  module?: string;
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/" replace />;

  if (adminOnly && user.rol !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (module && !canAccessModule(user.rol, module)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute module="dashboard">
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/neonatos"
        element={
          <ProtectedRoute module="neonatos">
            <NeonatosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/observaciones"
        element={
          <ProtectedRoute module="observaciones">
            <ObservacionesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/historial"
        element={
          <ProtectedRoute module="historial">
            <HistorialPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exportar"
        element={
          <ProtectedRoute module="exportar">
            <ExportarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute adminOnly module="usuarios">
            <UsuariosPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;