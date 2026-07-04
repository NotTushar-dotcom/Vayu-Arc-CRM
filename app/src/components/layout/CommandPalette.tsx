import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CheckSquare,
  BarChart3,
  Settings,
  ArrowRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/providers/trpc";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pages = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Leads", path: "/leads", icon: Users },
  { label: "Clients", path: "/clients", icon: UserCheck },
  { label: "Tasks", path: "/tasks", icon: CheckSquare },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Settings", path: "/settings", icon: Settings },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: searchResults } = trpc.lead.list.useQuery(
    { search: query, pageSize: 5 },
    { enabled: query.length > 0 && open }
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const filteredPages = pages.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase())
  );

  const leadItems = searchResults?.items ?? [];
  const totalItems = filteredPages.length + leadItems.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex < filteredPages.length) {
        handleSelect(filteredPages[selectedIndex].path);
      } else {
        const lead = leadItems[selectedIndex - filteredPages.length];
        if (lead) handleSelect(`/leads/${lead.id}`);
      }
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search leads, pages..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[320px] overflow-y-auto py-2">
                {filteredPages.length > 0 && (
                  <div className="px-3 pb-1">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2">
                      Pages
                    </span>
                  </div>
                )}
                {filteredPages.map((page, i) => (
                  <button
                    key={page.path}
                    onClick={() => handleSelect(page.path)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors",
                      selectedIndex === i
                        ? "bg-[#A8B98B]/10 text-[#A8B98B]"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    <page.icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{page.label}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </button>
                ))}

                {leadItems.length > 0 && (
                  <div className="px-3 pb-1 pt-2">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2">
                      Leads
                    </span>
                  </div>
                )}
                {leadItems.map((lead, i) => {
                  const idx = filteredPages.length + i;
                  return (
                    <button
                      key={lead.id}
                      onClick={() => handleSelect(`/leads/${lead.id}`)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors",
                        selectedIndex === idx
                          ? "bg-[#A8B98B]/10 text-[#A8B98B]"
                          : "text-foreground hover:bg-secondary"
                      )}
                    >
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <div>{lead.fullName}</div>
                        <div className="text-xs text-muted-foreground">{lead.company}</div>
                      </div>
                      <span className="text-xs text-muted-foreground">{lead.country}</span>
                    </button>
                  );
                })}

                {totalItems === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No results found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
