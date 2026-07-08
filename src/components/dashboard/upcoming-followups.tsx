"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Clock, ExternalLink, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { isOverdue } from "@/lib/utils";

interface FollowUpItem {
  id: string;
  leadId: string;
  name: string;
  company: string;
  dueDate: Date | string;
  stage: string; // priority (e.g. HIGH, MEDIUM, LOW)
  type: string; // title (e.g. Follow up email)
}

export function UpcomingFollowups({ initialFollowUps }: { initialFollowUps?: FollowUpItem[] }) {
  const followUps = initialFollowUps || [];

  return (
    <Card className="col-span-1 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Follow-ups</CardTitle>
        <Button variant="ghost" size="sm" asChild className="text-xs">
          <Link href="/follow-ups">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] w-full px-6">
          <div className="space-y-4 pb-6">
            {followUps.length === 0 ? (
              <div className="py-20 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
                <Calendar className="h-10 w-10 opacity-20 mb-3" />
                No pending follow-up tasks due.
              </div>
            ) : (
              followUps.map((item, i) => {
                const dateObj = typeof item.dueDate === "string" ? new Date(item.dueDate) : item.dueDate;
                const overdue = isOverdue(dateObj);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/50 ${overdue ? "text-destructive" : "text-primary"}`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold leading-none">{item.name}</p>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">{item.stage}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.company}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className={`text-[10px] font-medium ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                            {overdue ? "Overdue: " : "Due: "}{format(dateObj, "MMM d, yyyy")}
                          </span>
                          <span className="text-[10px] text-muted-foreground">• {item.type}</span>
                        </div>
                      </div>
                    </div>
                    {item.leadId && (
                      <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/leads/${item.leadId}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
