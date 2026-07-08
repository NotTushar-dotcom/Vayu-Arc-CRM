"use client";

import { motion } from "framer-motion";
import {
  Users, UserPlus, Mail, Reply, PhoneCall,
  Building2, TrendingUp, Clock, MessageSquare,
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/social-icons";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// All icons that can be requested by name from a Server Component.
// Only strings cross the Server→Client boundary, then we resolve here.
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  UserPlus,
  Mail,
  Reply,
  PhoneCall,
  Building2,
  TrendingUp,
  Clock,
  MessageSquare,
  Linkedin: LinkedinIcon,
};

interface StatCardProps {
  title: string;
  value: string | number;
  /** Pass an icon name string (e.g. "Users") — resolved to Lucide inside this Client Component */
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  className,
  delay = 0,
}: StatCardProps) {
  const Icon = ICON_MAP[icon] ?? Users;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={cn("overflow-hidden group", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="rounded-full bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {trend && (
              <p className="text-xs text-muted-foreground">
                <span
                  className={cn(
                    "font-medium",
                    trend.isPositive ? "text-emerald-500" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : "-"}
                  {Math.abs(trend.value)}%
                </span>{" "}
                from last month
              </p>
            )}
            {description && !trend && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
