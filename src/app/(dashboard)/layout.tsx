"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, Building2, CheckSquare, 
  Clock, BarChart3, Settings, Menu, X, Command,
  LogOut, Plus
} from "lucide-react";
import { logoutAction } from "@/app/actions";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommandPalette } from "@/components/layout/command-palette";
import { QuickAddLead } from "@/components/layout/quick-add-lead";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Create icon mapping
const Icons = {
  "layout-dashboard": LayoutDashboard,
  "users": Users,
  "building-2": Building2,
  "check-square": CheckSquare,
  "clock": Clock,
  "bar-chart-3": BarChart3,
  "settings": Settings,
} as Record<string, any>;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="hidden border-r border-border bg-card md:block z-20 h-full flex-shrink-0 relative overflow-hidden"
          >
            <div className="flex h-full flex-col w-[260px]">
              {/* Logo Area */}
              <div className="flex h-16 items-center px-6 shrink-0">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <span className="font-bold">V</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight">Vayu Arc</span>
                </Link>
              </div>

              {/* Navigation Links */}
              <ScrollArea className="flex-1 px-4 py-4">
                <nav className="flex flex-col gap-1.5">
                  {NAV_ITEMS.map((item) => {
                    const Icon = Icons[item.icon];
                    const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                    
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={cn(
                            "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                            <span>{item.label}</span>
                          </div>
                          {item.shortcut && (
                            <span className="text-[10px] tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                              {item.shortcut}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>

              {/* User Area (Bottom) */}
              <div className="border-t border-border p-4 shrink-0">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors cursor-pointer group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-medium text-xs">
                    AD
                  </div>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">Admin User</span>
                    <span className="truncate text-xs text-muted-foreground">admin@vayuarc.com</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => logoutAction()}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6 z-10 glass">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Search Trigger */}
            <div 
              className="hidden sm:flex items-center w-64 md:w-80 h-9 px-3 rounded-lg border border-input bg-muted/40 text-sm text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => setCommandOpen(true)}
            >
              <span className="flex-1">Search anything...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button size="sm" className="hidden sm:flex gap-2" onClick={() => setQuickAddOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>Add Lead</span>
              <kbd className="ml-1 pointer-events-none inline-flex h-5 select-none items-center rounded border border-primary-foreground/20 bg-primary-foreground/10 px-1.5 font-mono text-[10px] font-medium text-primary-foreground">
                N
              </kbd>
            </Button>
            <Button size="icon" className="sm:hidden" onClick={() => setQuickAddOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full max-w-[1600px] mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <QuickAddLead open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
