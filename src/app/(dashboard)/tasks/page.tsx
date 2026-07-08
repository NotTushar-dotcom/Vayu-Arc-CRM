"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  CheckCircle2, Circle, Clock, MoreHorizontal, Plus, 
  Calendar as CalendarIcon, Flag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { isOverdue, formatRelativeDate } from "@/lib/utils";
import { getTasks, createTask, toggleTaskCompleted } from "@/app/actions";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === id ? { ...t, completed } : t));
      await toggleTaskCompleted(id, completed);
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await createTask({
        title: newTaskTitle,
        priority: "MEDIUM",
      });
      setNewTaskTitle("");
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "HIGH": return "text-destructive border-destructive/30 bg-destructive/10";
      case "MEDIUM": return "text-amber-500 border-amber-500/30 bg-amber-500/10";
      case "LOW": return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
      default: return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground text-sm">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full pb-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your to-dos and stay on top of your workflow.</p>
        </div>
      </div>

      <Card className="glass shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="pending" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
              </TabsList>
              
              <div className="relative w-full sm:w-auto min-w-[320px]">
                <Input 
                  placeholder="Quick add task and press Enter..." 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="pr-10 bg-background"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateTask();
                    }
                  }}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={handleCreateTask}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="pending" className="m-0 outline-none">
              <TaskList tasks={tasks.filter(t => !t.completed)} toggleTask={handleToggleTask} getPriorityColor={getPriorityColor} />
            </TabsContent>
            
            <TabsContent value="completed" className="m-0 outline-none">
              <TaskList tasks={tasks.filter(t => t.completed)} toggleTask={handleToggleTask} getPriorityColor={getPriorityColor} />
            </TabsContent>
            
            <TabsContent value="all" className="m-0 outline-none">
              <TaskList tasks={tasks} toggleTask={handleToggleTask} getPriorityColor={getPriorityColor} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskList({ tasks, toggleTask, getPriorityColor }: { tasks: any[], toggleTask: (id: string, completed: boolean) => void, getPriorityColor: (p: string) => string }) {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
        <CheckCircle2 className="h-12 w-12 opacity-20 mb-4" />
        <p>No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => {
        const overdue = !task.completed && task.dueDate && isOverdue(new Date(task.dueDate));
        
        return (
          <div 
            key={task.id} 
            className={`group flex items-center gap-3 p-3 sm:p-4 rounded-xl border bg-card transition-all hover:border-primary/30 ${task.completed ? 'opacity-60' : 'hover:shadow-sm'}`}
          >
            <button 
              onClick={() => toggleTask(task.id, !task.completed)}
              className={`shrink-0 transition-colors ${task.completed ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </p>
                {task.lead && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    Lead: {task.lead.fullName}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3 shrink-0 mt-2 sm:mt-0">
                <Badge variant="outline" className={`h-5 px-1.5 text-[10px] gap-1 font-medium ${getPriorityColor(task.priority)}`}>
                  <Flag className="h-3 w-3" />
                  {task.priority}
                </Badge>
                
                {task.dueDate && (
                  <div className={`flex items-center gap-1.5 text-xs font-medium w-[110px] sm:justify-end ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {overdue ? 'Overdue' : formatRelativeDate(new Date(task.dueDate))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
