import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Instagram,
  Mail,
  Star,
  Loader2,
  Download,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { cn, formatDate, getStageColor, getInitials } from "@/lib/utils";
import { toast } from "sonner";

const countries = ["United States", "United Kingdom"];
const leadSources = ["LinkedIn", "Instagram", "Referral", "Website", "Google", "Cold Email", "Other"];
const pipelineStages = [
  "Lead Found", "LinkedIn Request Sent", "Connected", "Website Researched",
  "Socials Found", "Email Found", "Cold Email Sent", "Instagram DM Sent",
  "Waiting", "Follow-up 1", "Follow-up 2", "Discovery Call",
  "Proposal Sent", "Client Won", "Client Lost",
];

export default function Leads() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);

  const { data, isLoading } = trpc.lead.list.useQuery({
    search: search || undefined,
    country: filters.country || undefined,
    industry: filters.industry || undefined,
    leadSource: filters.leadSource || undefined,
    pipelineStage: filters.pipelineStage || undefined,
    needsVideoEditing: filters.needsVideoEditing || undefined,
    page,
    pageSize,
  });

  const toggleSelect = (id: number) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!data?.items) return;
    if (selectedLeads.length === data.items.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(data.items.map((l) => l.id));
    }
  };

  const exportCSV = () => {
    if (!data?.items) return;
    const headers = ["Name", "Company", "Role", "Country", "Email", "Stage", "Priority", "Source"];
    const rows = data.items.map((l) => [
      l.fullName, l.company, l.role || "", l.country || "", l.email || "",
      l.pipelineStage, String(l.priorityScore), l.leadSource,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Leads</h2>
          <p className="text-sm text-muted-foreground">
            {data?.total ?? 0} total leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search leads by name, company, email, country..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border text-sm outline-none focus:border-[#A8B98B] transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
            showFilters ? "bg-[#A8B98B]/10 text-[#A8B98B]" : "text-muted-foreground hover:bg-secondary"
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
          {Object.values(filters).filter(Boolean).length > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#A8B98B] text-[10px] font-medium text-[#1a2a1a] flex items-center justify-center">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Country</label>
            <select
              value={filters.country || ""}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none"
            >
              <option value="">All</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Lead Source</label>
            <select
              value={filters.leadSource || ""}
              onChange={(e) => setFilters({ ...filters, leadSource: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none"
            >
              <option value="">All</option>
              {leadSources.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Pipeline Stage</label>
            <select
              value={filters.pipelineStage || ""}
              onChange={(e) => setFilters({ ...filters, pipelineStage: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none"
            >
              <option value="">All</option>
              {pipelineStages.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Needs Editing</label>
            <select
              value={filters.needsVideoEditing || ""}
              onChange={(e) => setFilters({ ...filters, needsVideoEditing: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none"
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="Maybe">Maybe</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="col-span-full flex justify-end">
            <button
              onClick={() => { setFilters({}); setPage(1); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === (data?.items?.length ?? 0) && (data?.items?.length ?? 0) > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Lead</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Company</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Stage</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Priority</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Source</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Country</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Follow-up</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground w-10"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              )}
              {data?.items.map((lead, i) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.015 }}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8B98B]/30 to-[#2C5C4B]/30 flex items-center justify-center text-xs font-medium text-[#A8B98B]">
                        {getInitials(lead.fullName)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{lead.fullName}</div>
                        <div className="text-xs text-muted-foreground">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{lead.company}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium", getStageColor(lead.pipelineStage || ""))}>
                      {lead.pipelineStage || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#A8B98B]" />
                      <span className="text-xs font-medium">{lead.priorityScore ?? 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{lead.leadSource || "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{lead.country || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-xs",
                      lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date()
                        ? "text-red-400"
                        : "text-muted-foreground"
                    )}>
                      {formatDate(lead.nextFollowUp)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {lead.linkedin && <Linkedin className="w-3.5 h-3.5 text-muted-foreground hover:text-sky-400" />}
                      {lead.instagram && <Instagram className="w-3.5 h-3.5 text-muted-foreground hover:text-pink-400" />}
                      {lead.email && <Mail className="w-3.5 h-3.5 text-muted-foreground hover:text-amber-400" />}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!isLoading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                    No leads found. Try adjusting your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.total)} of {data.total}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs px-2">{page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= data.total}
                className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
