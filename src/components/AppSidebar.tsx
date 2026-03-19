import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessModule } from "@/lib/permissions";
import {
  LayoutDashboard,
  Baby,
  ClipboardList,
  History,
  Download,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", module: "dashboard" },
  { label: "Neonatos", icon: Baby, path: "/neonatos", module: "neonatos" },
  { label: "Observaciones", icon: ClipboardList, path: "/observaciones", module: "observaciones" },
  { label: "Historial", icon: History, path: "/historial", module: "historial" },
  { label: "Exportar", icon: Download, path: "/exportar", module: "exportar" },
];

const adminItems = [
  { label: "Usuarios", icon: Users, path: "/usuarios", module: "usuarios" },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const visibleNavItems = user
    ? navItems.filter((item) => canAccessModule(user.rol, item.module))
    : [];

  const visibleAdminItems = user?.rol === "admin" ? adminItems : [];

  const allItems = [...visibleNavItems, ...visibleAdminItems];

  return (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card border border-border rounded-lg p-3 shadow-sm"
        aria-label="Toggle menu"
      >
        {collapsed ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200
          ${collapsed ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full"}
          lg:translate-x-0 lg:static lg:w-[280px]`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-primary">Hamacaterapia</h1>
          <p className="text-sm text-muted-foreground mt-1">Sistema de Investigación</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {allItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setCollapsed(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-150 active:scale-[0.97]
                  ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {user?.nombre?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nombre}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.rol}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {collapsed && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}
    </>
  );
}