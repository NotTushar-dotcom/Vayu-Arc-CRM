import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CheckSquare,
  BarChart3,
  Settings,
  Search,
  Command,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { CommandPalette } from "./CommandPalette";
import { QuickAddLead } from "./QuickAddLead";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", shortcut: "g d" },
  { icon: Users, label: "Leads", path: "/leads", shortcut: "g l" },
  { icon: UserCheck, label: "Clients", path: "/clients", shortcut: "g c" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks", shortcut: "g t" },
  { icon: BarChart3, label: "Analytics", path: "/analytics", shortcut: "g a" },
  { icon: Settings, label: "Settings", path: "/settings", shortcut: "g s" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useHotkeys("mod+k", (e) => { e.preventDefault(); setCommandOpen(true); });
  useHotkeys("c", (e) => {
    if (!e.target || !(e.target as HTMLElement).matches("input, textarea, [contenteditable]")) {
      e.preventDefault();
      setQuickAddOpen(true);
    }
  });
  useHotkeys("g+d", () => navigate("/"));
  useHotkeys("g+l", () => navigate("/leads"));
  useHotkeys("g+c", () => navigate("/clients"));
  useHotkeys("g+t", () => navigate("/tasks"));
  useHotkeys("g+a", () => navigate("/analytics"));
  useHotkeys("g+s", () => navigate("/settings"));

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-[hsl(210,20%,10%)] transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border/50">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#A8B98B] to-[#2C5C4B] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="font-semibold text-sm text-foreground">Vayu Arc</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Add */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => setQuickAddOpen(true)}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium",
              "bg-[#A8B98B]/10 text-[#A8B98B] hover:bg-[#A8B98B]/20 transition-colors",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Add Lead
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all duration-200",
                  isActive
                    ? "bg-[#A8B98B]/10 text-[#A8B98B] font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  sidebarCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-[#A8B98B]")} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-border/50 space-y-1">
          <button
            onClick={() => setCommandOpen(true)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            <Command className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden whitespace-nowrap flex-1 text-left"
                >
                  Command
                </motion.span>
              )}
            </AnimatePresence>
            {!sidebarCollapsed && (
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                ⌘K
              </kbd>
            )}
          </button>

          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
            )}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-border/50 bg-card/30 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">
              {navItems.find((n) => n.path === location.pathname)?.label || "Vayu Arc"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘K</kbd>
            </button>

            <button
              onClick={() => setQuickAddOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#A8B98B]/10 text-[#A8B98B] hover:bg-[#A8B98B]/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lead</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#A8B98B]/20 text-[#A8B98B]">C</kbd>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <QuickAddLead open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
