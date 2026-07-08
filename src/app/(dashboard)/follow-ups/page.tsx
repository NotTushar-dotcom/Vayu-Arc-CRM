"use client";

import { useState, useEffect } from "react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { 
  Calendar, CheckCircle2, Clock, Mail, 
  MessageCircle, Phone, ArrowRight, Loader2
} from "lucide-react";
import { Linkedin } from "@/components/icons/social-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getFollowUps, toggleTaskCompleted } from "@/app/actions";

interface FollowUp {
  id: string;
  leadId: string | null;
  leadName: string;
  company: string;
  dueDate: Date | string;
  type: string;
  notes: string;
  status: string;
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFollowUps() {
    try {
      const data = await getFollowUps();
      // Map to local component type
      const mapped = data.map((item: any) => ({
        ...item,
        dueDate: new Date(item.dueDate),
      }));
      setFollowUps(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFollowUps();
  }, []);

  const getPlatformIcon = (type: string) => {
    switch(type.toUpperCase()) {
      case "LINKEDIN": return <Linkedin className="h-4 w-4" />;
      case "EMAIL": return <Mail className="h-4 w-4" />;
      case "PHONE": return <Phone className="h-4 w-4" />;
      case "WHATSAPP": return <MessageCircle className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const markComplete = async (id: string) => {
    try {
      // Optimistic update
      setFollowUps(prev => prev.filter(f => f.id !== id));
      await toggleTaskCompleted(id, true);
    } catch (err) {
      console.error(err);
      loadFollowUps(); // revert
    }
  };

  const pendingFollowUps = followUps.filter(f => f.status === "PENDING");
  
  const overdue = pendingFollowUps.filter(f => {
    const d = f.dueDate as Date;
    return isPast(d) && !isToday(d);
  });
  
  const today = pendingFollowUps.filter(f => isToday(f.dueDate as Date));
  
  const tomorrow = pendingFollowUps.filter(f => isTomorrow(f.dueDate as Date));
  
  const upcoming = pendingFollowUps.filter(f => {
    const d = f.dueDate as Date;
    return !isPast(d) && !isToday(d) && !isTomorrow(d);
  });

  const sections = [
    { title: "Overdue", data: overdue, color: "text-destructive", badgeColor: "bg-destructive/10 text-destructive border-destructive/20" },
    { title: "Today", data: today, color: "text-amber-500", badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { title: "Tomorrow", data: tomorrow, color: "text-blue-500", badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { title: "Upcoming", data: upcoming, color: "text-primary", badgeColor: "bg-primary/10 text-primary border-primary/20" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full pb-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
        <p className="text-muted-foreground mt-1">Don&apos;t let any leads slip through the cracks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map(section => (
          <Card key={section.title} className="glass">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className={section.color}>{section.title}</span>
                <Badge variant="outline" className={section.badgeColor}>
                  {section.data.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {section.data.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center">
                  <CheckCircle2 className="h-8 w-8 opacity-20 mb-2 text-emerald-500" />
                  All caught up!
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {section.data.map(item => (
                    <div key={item.id} className="p-4 hover:bg-muted/30 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm leading-tight">{item.leadName}</p>
                          <p className="text-xs text-muted-foreground">{item.company}</p>
                        </div>
                        <div className="text-muted-foreground h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                          {getPlatformIcon(item.type)}
                        </div>
                      </div>
                      <p className="text-xs text-foreground/80 mb-4 line-clamp-2">{item.notes}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(item.dueDate as Date, "MMM d")}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                            onClick={() => markComplete(item.id)}
                            title="Mark as complete"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          {item.leadId && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-primary hover:bg-primary/10 hover:text-primary"
                              title="View Lead"
                              asChild
                            >
                              <Link href={`/leads/${item.leadId}`}>
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
