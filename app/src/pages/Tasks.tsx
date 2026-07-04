import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Loader2,
  Check,
  Trash2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { cn, formatDate, formatRelativeDate } from "@/lib/utils";
import { toast } from "sonner";

const priorities = ["low", "medium", "high", "urgent"] as const;
const priorityColors: Record<string, string> = {
  low: "text-slate-400 bg-slate-400/10",
  medium: "text-amber-400 bg-amber-400/10",
  high: "text-orange-400 bg-orange-400/10",
  urgent: "text-red-400 bg-red-400/10",
};

export default function Tasks() {
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "overdue">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    dueDate: "",
  });

  const { data, isLoading, refetch } = trpc.task.list.useQuery({
    completed: filter === "pending" ? "No" : filter === "completed" ? "Yes" : undefined,
  });

  const utils = trpc.useUtils();

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      refetch();
      utils.task.stats.invalidate();
      utils.analytics.kpiSummary.invalidate();
      setShowAdd(false);
      setForm({ title: "", description: "", priority: "medium", dueDate: "" });
      toast.success("Task created");
    },
  });

  const toggleComplete = trpc.task.toggleComplete.useMutation({
    onSuccess: () => {
      refetch();
      utils.task.stats.invalidate();
    },
  });

  const deleteTask = trpc.task.delete.useMutation({
    onSuccess: () => {
      refetch();
      utils.task.stats.invalidate();
      toast.success("Task deleted");
    },
  });

  const { data: stats } = trpc.task.stats.useQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    createTask.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {stats?.pending ?? 0} pending, {stats?.dueToday ?? 0} due today
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#A8B98B] text-[#1a2a1a] hover:bg-[#A8B98B]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats?.total ?? 0, color: "text-blue-400" },
          { label: "Pending", value: stats?.pending ?? 0, color: "text-amber-400" },
          { label: "Due Today", value: stats?.dueToday ?? 0, color: "text-orange-400" },
          { label: "Overdue", value: stats?.overdue ?? 0, color: "text-red-400" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(["all", "pending", "completed", "overdue"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
              filter === f
                ? "bg-[#A8B98B]/10 text-[#A8B98B]"
                : "text-muted-foreground hover:bg-secondary"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Add Task Form */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title..."
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B]"
              autoFocus
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none resize-none"
            />
            <div className="flex items-center gap-3">
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as typeof form.priority })}
                className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none"
              />
              <div className="flex-1"></div>
              <button
                type="submit"
                disabled={createTask.isPending || !form.title.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#A8B98B] text-[#1a2a1a] hover:bg-[#A8B98B]/90 transition-colors disabled:opacity-50"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {data?.items.map((task, i) => {
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.completed === "No";
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "flex items-start gap-3 bg-card border border-border rounded-xl p-4 group hover:border-[#A8B98B]/20 transition-colors",
                task.completed === "Yes" && "opacity-60"
              )}
            >
              <button
                onClick={() => toggleComplete.mutate({ id: task.id })}
                className={cn(
                  "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                  task.completed === "Yes"
                    ? "bg-[#A8B98B] border-[#A8B98B] text-[#1a2a1a]"
                    : "border-muted-foreground hover:border-[#A8B98B]"
                )}
              >
                {task.completed === "Yes" && <Check className="w-3 h-3" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className={cn("text-sm font-medium", task.completed === "Yes" && "line-through text-muted-foreground")}>
                  {task.title}
                </div>
                {task.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium", priorityColors[task.priority || "medium"])}>
                    {task.priority || "medium"}
                  </span>
                  {task.dueDate && (
                    <span className={cn("flex items-center gap-1 text-[10px]", isOverdue ? "text-red-400" : "text-muted-foreground")}>
                      <Calendar className="w-3 h-3" />
                      {isOverdue ? `Overdue: ${formatDate(task.dueDate)}` : formatRelativeDate(task.dueDate)}
                    </span>
                  )}
                  {task.leadName && (
                    <span className="text-[10px] text-muted-foreground">
                      {task.leadName} ({task.leadCompany})
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteTask.mutate({ id: task.id })}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}

        {!isLoading && data?.items.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-12">
            No tasks found. Create your first task!
          </div>
        )}
      </div>
    </div>
  );
}
