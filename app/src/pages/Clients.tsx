import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  UserCheck,
  DollarSign,
  FolderKanban,
  FileText,
  Search,
  Loader2,
  TrendingUp,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { cn } from "@/lib/utils";

export default function Clients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: clientData, isLoading } = trpc.clientManager.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const { data: stats } = trpc.clientManager.stats.useQuery();

  const statusColors: Record<string, string> = {
    active: "text-green-400 bg-green-400/10",
    paused: "text-amber-400 bg-amber-400/10",
    churned: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Clients</h2>
          <p className="text-sm text-muted-foreground">
            {stats?.active ?? 0} active clients · ${(stats?.totalRevenue ?? 0).toLocaleString()} total revenue
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats?.total ?? 0, icon: UserCheck, color: "text-blue-400" },
          { label: "Active", value: stats?.active ?? 0, icon: TrendingUp, color: "text-green-400" },
          { label: "Paused", value: stats?.paused ?? 0, icon: Pause, color: "text-amber-400" },
          { label: "Churned", value: stats?.churned ?? 0, icon: AlertTriangle, color: "text-red-400" },
          { label: "Active Projects", value: stats?.activeProjects ?? 0, icon: FolderKanban, color: "text-[#A8B98B]" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <stat.icon className={cn("w-4 h-4 mb-2", stat.color)} />
            <div className={cn("text-xl font-bold", stat.color)}>{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-[#A8B98B]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-sm outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      {/* Client Cards */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientData?.items.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-[#A8B98B]/30 transition-colors cursor-pointer"
            onClick={() => navigate(`/clients/${client.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8B98B]/30 to-[#2C5C4B]/30 flex items-center justify-center text-sm font-medium text-[#A8B98B]">
                  {client.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "??"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{client.fullName}</h3>
                  <p className="text-xs text-muted-foreground">{client.company}</p>
                </div>
              </div>
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium", statusColors[client.status ?? "active"])}>
                {client.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-secondary/50 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1">
                  <DollarSign className="w-3 h-3 text-[#A8B98B]" />
                  <span className="text-sm font-semibold">${client.monthlyRetainer ?? "0"}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Monthly</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1">
                  <FolderKanban className="w-3 h-3 text-blue-400" />
                  <span className="text-sm font-semibold">{client.activeProjects ?? 0}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Projects</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2">
                <div className="flex items-center justify-center gap-1">
                  <FileText className="w-3 h-3 text-amber-400" />
                  <span className="text-sm font-semibold">${client.totalRevenue ?? "0"}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Revenue</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>{client.industry}</span>
              <span>{client.country}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {!isLoading && clientData?.items.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-12">
          No clients found. Convert a lead to get started.
        </div>
      )}
    </div>
  );
}
