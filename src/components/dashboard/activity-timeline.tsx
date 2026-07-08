"use client";

import { motion } from "framer-motion";
import { formatRelativeDate } from "@/lib/utils";
import { 
  UserPlus, Mail, MessageSquare, 
  PhoneCall, FileText, CheckCircle2, MoreHorizontal, Calendar, Star, HelpCircle
} from "lucide-react";
import { Linkedin, Instagram } from "@/components/icons/social-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: Date | string;
}

const getActivityIcon = (type: string) => {
  const t = type.toUpperCase();
  if (t.includes("EMAIL")) return Mail;
  if (t.includes("LINKEDIN")) return Linkedin;
  if (t.includes("INSTAGRAM")) return Instagram;
  if (t.includes("LEAD_ADDED")) return UserPlus;
  if (t.includes("STAGE")) return Star;
  if (t.includes("TASK_CREATED")) return Calendar;
  if (t.includes("TASK_COMPLETED")) return CheckCircle2;
  if (t.includes("CLIENT")) return CheckCircle2;
  return MoreHorizontal;
};

const getActivityColor = (type: string) => {
  const t = type.toUpperCase();
  if (t.includes("LEAD_ADDED")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (t.includes("CLIENT")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold";
  if (t.includes("EMAIL")) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (t.includes("LINKEDIN")) return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
  if (t.includes("INSTAGRAM")) return "bg-pink-500/10 text-pink-500 border-pink-500/20";
  if (t.includes("COMPLETED")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (t.includes("TASK")) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  if (t.includes("STAGE")) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-muted text-muted-foreground border-border";
};

// Fallback activities if none exist yet (helps onboard the user visually)
const FALLBACK_ACTIVITIES = [
  {
    id: "f1",
    type: "LEAD_ADDED",
    title: "System Initialized",
    description: "Welcome to Vayu Arc CRM. Add your first lead to start tracking activity!",
    time: new Date(),
  }
];

export function ActivityTimeline({ initialActivities }: { initialActivities?: Activity[] }) {
  const activities = initialActivities && initialActivities.length > 0 ? initialActivities : FALLBACK_ACTIVITIES;

  return (
    <Card className="col-span-1 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] w-full px-6">
          <div className="relative space-y-6 pb-6 before:absolute before:inset-0 before:ml-[1.4rem] before:h-full before:w-[2px] before:bg-border/50">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              const timeObj = typeof activity.time === "string" ? new Date(activity.time) : activity.time;

              return (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="relative flex gap-4"
                >
                  <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${colorClass} shadow-sm bg-background`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col flex-1 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="text-sm font-semibold">{activity.title}</p>
                      <time className="text-xs text-muted-foreground tabular-nums">
                        {formatRelativeDate(timeObj)}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
