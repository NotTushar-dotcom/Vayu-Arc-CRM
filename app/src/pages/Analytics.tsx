import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Mail,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

const COLORS = ["#A8B98B", "#6F9270", "#2C5C4B", "#4A7C6F", "#8BA88C", "#25343D", "#3d5c4b"];

export default function Analytics() {
  const { data: kpiSummary } = trpc.analytics.kpiSummary.useQuery();
  const { data: monthlyData } = trpc.analytics.monthlyPerformance.useQuery();
  const { data: sourceData } = trpc.analytics.leadSourceBreakdown.useQuery();
  const { data: outreachData } = trpc.analytics.outreachPerformance.useQuery();
  const { data: funnelData } = trpc.analytics.pipelineFunnel.useQuery();
  const { data: priorityData } = trpc.analytics.priorityDistribution.useQuery();
  const { data: revenueData } = trpc.analytics.revenueOverview.useQuery();

  const kpis = [
    { label: "Total Leads", value: kpiSummary?.totalLeads ?? 0, icon: Users, color: "#A8B98B" },
    { label: "Active Clients", value: kpiSummary?.totalClients ?? 0, icon: Target, color: "#6F9270" },
    { label: "Total Outreach", value: kpiSummary?.totalOutreach ?? 0, icon: Mail, color: "#2C5C4B" },
    { label: "Pending Tasks", value: kpiSummary?.pendingTasks ?? 0, icon: Activity, color: "#4A7C6F" },
    { label: "Win Rate", value: `${kpiSummary?.winRate ?? 0}%`, icon: TrendingUp, color: "#8BA88C" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground">Performance insights and trends</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <kpi.icon className="w-4 h-4 mb-2" style={{ color: kpi.color }} />
            <div className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Monthly Performance</h3>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData ?? []}>
              <defs>
                <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A8B98B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A8B98B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradClients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2C5C4B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2C5C4B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="leadsAdded" stroke="#A8B98B" fill="url(#gradLeads)" strokeWidth={2} name="Leads" />
              <Area type="monotone" dataKey="clientsWon" stroke="#2C5C4B" fill="url(#gradClients)" strokeWidth={2} name="Clients" />
              <Area type="monotone" dataKey="outreachSent" stroke="#6F9270" fill="transparent" strokeWidth={2} name="Outreach" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Lead Sources */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Lead Sources</h3>
            <PieChartIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sourceData?.filter((s) => s.count > 0) ?? []}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="count"
                nameKey="source"
              >
                {(sourceData ?? []).filter((s) => s.count > 0).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Outreach Performance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Outreach Performance by Platform</h3>
          <Mail className="w-4 h-4 text-muted-foreground" />
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={outreachData ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="platform" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="total" fill="#A8B98B" radius={[4, 4, 0, 0]} name="Total Sent" />
            <Bar dataKey="replied" fill="#2C5C4B" radius={[4, 4, 0, 0]} name="Replied" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pipeline & Priority Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold mb-4">Pipeline Funnel</h3>
          <div className="space-y-2">
            {(funnelData ?? []).map((stage, i) => (
              <div key={stage.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 truncate">{stage.name}</span>
                <div className="flex-1 h-7 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, stage.count * 10)}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                    className="h-full rounded-full flex items-center justify-end px-2"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  >
                    {stage.count > 0 && (
                      <span className="text-[10px] font-medium text-white">{stage.count}</span>
                    )}
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={priorityData ?? []}
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={4}
                dataKey="count"
                nameKey="priority"
                label={({ priority, count }) => `${priority.split(" ")[0]}: ${count}`}
              >
                <Cell fill="#A8B98B" />
                <Cell fill="#6F9270" />
                <Cell fill="#25343D" />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Revenue */}
      {revenueData && (revenueData.paid > 0 || revenueData.pending > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold mb-4">Revenue Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Paid", value: revenueData.paid, color: "text-green-400" },
              { label: "Pending", value: revenueData.pending, color: "text-amber-400" },
              { label: "Overdue", value: revenueData.overdue, color: "text-red-400" },
            ].map((item) => (
              <div key={item.label} className="bg-secondary/50 rounded-lg p-4 text-center">
                <div className={cn("text-2xl font-bold", item.color)}>${item.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
