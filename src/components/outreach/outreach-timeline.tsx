"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Mail, Phone, MessageCircle, 
  CheckCircle2, Send, Plus, Reply,
  Calendar, MoreHorizontal
} from "lucide-react";
import { Linkedin, Instagram } from "@/components/icons/social-icons";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";
import { PLATFORMS, MESSAGE_STATUSES, OUTREACH_CONFIG } from "@/lib/constants";
import { addOutreach } from "@/app/actions";

interface OutreachHistoryItem {
  id: string;
  date: Date;
  platform: string;
  messageType: string;
  status: string;
  message: string | null;
  reply: string | null;
}

export function OutreachTimeline({ leadId, initialHistory }: { leadId: string; initialHistory: OutreachHistoryItem[] }) {
  const [history, setHistory] = useState<OutreachHistoryItem[]>(initialHistory);
  const [showLogForm, setShowLogForm] = useState(false);

  // Controlled states for form validation and dynamic selectors
  const [selectedPlatform, setSelectedPlatform] = useState<string>("EMAIL");
  const [selectedMessageType, setSelectedMessageType] = useState<string>("COLD_EMAIL");
  const [selectedStatus, setSelectedStatus] = useState<string>("DRAFT");

  const getPlatformIcon = (platform: string) => {
    switch(platform.toUpperCase()) {
      case "LINKEDIN": return <Linkedin className="h-4 w-4" />;
      case "INSTAGRAM": return <Instagram className="h-4 w-4" />;
      case "EMAIL": return <Mail className="h-4 w-4" />;
      case "PHONE": return <Phone className="h-4 w-4" />;
      case "WHATSAPP": return <MessageCircle className="h-4 w-4" />;
      case "MEETING": return <Calendar className="h-4 w-4" />;
      case "OTHER": return <MoreHorizontal className="h-4 w-4" />;
      default: return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    return MESSAGE_STATUSES.find((s: any) => s.value === status)?.color || "#8a9b92";
  };

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    const config = OUTREACH_CONFIG[platform as keyof typeof OUTREACH_CONFIG];
    if (config) {
      // Set defaults for the new platform
      setSelectedMessageType(config.actions[0]?.value || "");
      setSelectedStatus(config.statuses[0]?.value || "");
    }
  };

  const resetForm = () => {
    setSelectedPlatform("EMAIL");
    setSelectedMessageType("COLD_EMAIL");
    setSelectedStatus("DRAFT");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Outreach History</h3>
        <Button size="sm" className="gap-2 h-8" onClick={() => setShowLogForm(!showLogForm)}>
          <Plus className="h-3.5 w-3.5" />
          {showLogForm ? "Cancel" : "Log Interaction"}
        </Button>
      </div>

      <AnimatePresence>
        {showLogForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              const platform = formData.get("platform") as string;
              const messageType = formData.get("messageType") as string;
              const status = formData.get("status") as string;
              const message = formData.get("message") as string;
              const reply = formData.get("reply") as string;
              
              const newInteraction = await addOutreach(leadId, {
                platform,
                messageType,
                status,
                message,
                reply: reply || null,
              });

              // Convert backend item to component schema
              const mappedInteraction: OutreachHistoryItem = {
                id: newInteraction.id,
                date: new Date(newInteraction.date),
                platform: newInteraction.platform,
                messageType: newInteraction.messageType,
                status: newInteraction.status,
                message: newInteraction.message,
                reply: newInteraction.reply,
              };

              setHistory([mappedInteraction, ...history]);
              setShowLogForm(false);
              resetForm();
              form.reset();
            }} className="overflow-hidden rounded-xl border bg-card p-5 shadow-lg border-border/80 space-y-5"
          >
            <h4 className="font-semibold text-sm">Log New Interaction</h4>
            
            {/* Platform Selector Cards */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">Platform</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {Object.entries(OUTREACH_CONFIG).map(([key, cfg]) => {
                  const isActive = selectedPlatform === key;
                  const brand = cfg.brandColor;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePlatformChange(key)}
                      data-active={isActive}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 gap-1.5 focus:outline-none focus:ring-1 focus:ring-ring select-none ${brand.bg} ${isActive ? `${brand.glow} border-current scale-[1.03]` : 'text-muted-foreground bg-muted/20 border-border/50 hover:bg-muted/40'}`}
                    >
                      <div className={`p-1.5 rounded-lg bg-background/50 border border-border/20 ${isActive ? brand.iconColor : 'text-muted-foreground'}`}>
                        {getPlatformIcon(key)}
                      </div>
                      <span className="text-[11px] font-semibold tracking-wide">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="platform" value={selectedPlatform} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Message Type Selector */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Message Type</label>
                <select 
                  name="messageType" 
                  value={selectedMessageType}
                  onChange={(e) => setSelectedMessageType(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring shadow-sm cursor-pointer hover:bg-muted/10 transition-colors"
                >
                  {OUTREACH_CONFIG[selectedPlatform as keyof typeof OUTREACH_CONFIG]?.actions.map((act) => (
                    <option key={act.value} value={act.value} className="bg-popover text-foreground">
                      {act.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Selector with Dynamic Color Dot */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Status</label>
                <div className="relative flex items-center">
                  <select 
                    name="status" 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring shadow-sm cursor-pointer hover:bg-muted/10 transition-colors"
                  >
                    {OUTREACH_CONFIG[selectedPlatform as keyof typeof OUTREACH_CONFIG]?.statuses.map((stat) => (
                      <option key={stat.value} value={stat.value} className="bg-popover text-foreground">
                        {stat.label}
                      </option>
                    ))}
                  </select>
                  <div 
                    className="absolute left-3 w-2.5 h-2.5 rounded-full border border-black/10 transition-all duration-300" 
                    style={{ 
                      backgroundColor: OUTREACH_CONFIG[selectedPlatform as keyof typeof OUTREACH_CONFIG]?.statuses.find(s => s.value === selectedStatus)?.color || "#8a9b92" 
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Message Sent</label>
                <textarea 
                  name="message" 
                  placeholder={`Write the ${OUTREACH_CONFIG[selectedPlatform as keyof typeof OUTREACH_CONFIG]?.label.toLowerCase()} message content...`}
                  className="w-full min-h-[70px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring shadow-sm" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Reply Received (Optional)</label>
                <textarea 
                  name="reply" 
                  placeholder="Record any response or notes from the lead..."
                  className="w-full min-h-[70px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring shadow-sm" 
                />
              </div>
            </div>

            <Button type="submit" size="default" className="w-full font-medium shadow active:scale-[0.99] transition-all duration-200">
              Save Interaction
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[1.2rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {history.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground bg-card border rounded-lg border-dashed">
            No outreach interactions logged yet for this lead.
          </div>
        ) : (
          history.map((interaction, i) => {
            const statusColor = getStatusColor(interaction.status);
            const statusLabel = MESSAGE_STATUSES.find((s: any) => s.value === interaction.status)?.label || interaction.status;
            
            return (
              <div key={interaction.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-muted-foreground">
                  {getPlatformIcon(interaction.platform)}
                </div>
                
                {/* Card */}
                <Card className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{interaction.messageType.replace(/_/g, ' ')}</span>
                          <Badge variant="outline" className="text-[10px] h-4.5 px-1.5" style={{ color: statusColor, borderColor: `${statusColor}40` }}>
                            {statusLabel}
                          </Badge>
                        </div>
                        <time className="text-xs text-muted-foreground flex items-center gap-1">
                          {format(new Date(interaction.date), "MMM d, h:mm a")} ({formatRelativeDate(new Date(interaction.date))})
                        </time>
                      </div>
                      <div className="text-muted-foreground bg-muted h-7 w-7 rounded flex items-center justify-center shrink-0">
                        {getPlatformIcon(interaction.platform)}
                      </div>
                    </div>
                    
                    {interaction.message && (
                      <div className="text-sm bg-muted/50 p-3 rounded-lg border border-border/50 text-foreground/90 whitespace-pre-line">
                        {interaction.message}
                      </div>
                    )}
                    
                    {interaction.reply && (
                      <div className="text-sm bg-primary/5 p-3 rounded-lg border border-primary/10 text-foreground/90 mt-2 relative before:absolute before:left-4 before:-top-3 before:w-3 before:h-3 before:bg-primary/5 before:border-l before:border-t before:border-primary/10 before:rotate-45">
                        <div className="flex items-center gap-2 mb-1">
                          <Reply className="h-3.5 w-3.5 text-primary" />
                          <span className="font-medium text-primary text-xs">Reply received</span>
                        </div>
                        {interaction.reply}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
