import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  Users,
  UserPlus,
  Mail,
  Linkedin,
  Instagram,
  MessageSquare,
  Phone,
  UserCheck,
  TrendingUp,
  Clock,
  ChevronRight,
  Target,
  BarChart3,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { cn, formatRelativeDate } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#A8B98B", "#6F9270", "#2C5C4B", "#4A7C6F", "#8BA88C", "#25343D"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats } = trpc.lead.stats.useQuery();
  const { data: taskStats } = trpc.task.stats.useQuery();
  const { data: activities } = trpc.lead.recentActivity.useQuery();
  const { data: pipelineData } = trpc.lead.pipelineDistribution.useQuery();
  const { data: countryData } = trpc.lead.countryDistribution.useQuery();
  const { data: monthlyData } = trpc.analytics.monthlyPerformance.useQuery();

  const kpiCards = [
    { label: "Total Leads", value: stats?.totalLeads ?? 0, icon: Users, color: "text-blue-400 bg-blue-400/10" },
    { label: "New Leads", value: stats?.newLeads ?? 0, icon: UserPlus, color: "text-emerald-400 bg-emerald-400/10" },
    { label: "Emails Sent", value: stats?.emailsSent ?? 0, icon: Mail, color: "text-amber-400 bg-amber-400/10" },
    { label: "LinkedIn", value: stats?.linkedinSent ?? 0, icon: Linkedin, color: "text-sky-400 bg-sky-400/10" },
    { label: "Instagram DMs", value: stats?.instagramSent ?? 0, icon: Instagram, color: "text-pink-400 bg-pink-400/10" },
    { label: "Replies", value: stats?.repliesReceived ?? 0, icon: MessageSquare, color: "text-violet-400 bg-violet-400/10" },
    { label: "Discovery Calls", value: stats?.discoveryCalls ?? 0, icon: Phone, color: "text-teal-400 bg-teal-400/10" },
    { label: "Clients Closed", value: stats?.clientsClosed ?? 0, icon: UserCheck, color: "text-green-400 bg-green-400/10" },
    { label: "Win Rate", value: `${stats?.winRate ?? 0}%`, icon: TrendingUp, color: "text-[#A8B98B] bg-[#A8B98B]/10" },
    { label: "Follow-ups Due", value: stats?.followUpsDue ?? 0, icon: Clock, color: "text-orange-400 bg-orange-400/10" },
  ];

  const topPipelineStages = pipelineData?.filter((s) => s.count > 0).slice(0, 8) ?? [];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            className="bg-card border border-border rounded-xl p-4 hover:border-[#A8B98B]/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2 rounded-lg", card.color)}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Monthly Performance</h3>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData ?? []}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A8B98B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A8B98B" stopOpacity={0} />
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
              <Area
                type="monotone"
                dataKey="leadsAdded"
                stroke="#A8B98B"
                fillOpacity={1}
                fill="url(#colorLeads)"
                strokeWidth={2}
                name="Leads"
              />
              <Area
                type="monotone"
                dataKey="clientsWon"
                stroke="#2C5C4B"
                fill="transparent"
                strokeWidth={2}
                name="Clients"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Country Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Country Distribution</h3>
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={countryData ?? []}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
                nameKey="country"
              >
                {(countryData ?? []).map((_, index) => (
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
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {(countryData ?? []).slice(0, 4).map((c, i) => (
              <div key={c.country} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] text-muted-foreground">{c.country}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pipeline & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Pipeline Distribution</h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {topPipelineStages.map((stage, i) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-28 truncate">{stage.stage}</span>
                <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (stage.count / (stats?.totalLeads || 1)) * 100)}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
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

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <button
              onClick={() => navigate("/leads")}
              className="text-xs text-[#A8B98B] hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-hide">
            {(activities ?? []).slice(0, 10).map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.03 }}
                className="flex items-start gap-3 text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-[#A8B98B] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate">{activity.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  {formatRelativeDate(activity.createdAt)}
                </span>
              </motion.div>
            ))}
            {(!activities || activities.length === 0) && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No recent activity
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tasks Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Task Overview</h3>
          <button
            onClick={() => navigate("/tasks")}
            className="text-xs text-[#A8B98B] hover:underline"
          >
            View all tasks
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Tasks", value: taskStats?.total ?? 0, color: "text-blue-400" },
            { label: "Pending", value: taskStats?.pending ?? 0, color: "text-amber-400" },
            { label: "Due Today", value: taskStats?.dueToday ?? 0, color: "text-orange-400" },
            { label: "Overdue", value: taskStats?.overdue ?? 0, color: "text-red-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-secondary/50 rounded-lg p-3">
              <div className={cn("text-xl font-bold", stat.color)}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
