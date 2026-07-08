"use client";

import { 
  Building2, Globe, Mail, MapPin, 
  Phone, Briefcase, Video, Edit3, Trash2
} from "lucide-react";
import { Linkedin, Instagram } from "@/components/icons/social-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/lib/constants";

export function LeadProfileCard({ lead }: { lead: any }) {
  const stageInfo = PIPELINE_STAGES.find(s => s.value === lead.pipelineStage);
  const scoreColor = lead.score >= 80 ? "text-emerald-500" : lead.score >= 60 ? "text-amber-500" : "text-muted-foreground";

  return (
    <Card className="h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 flex gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>

      <CardHeader className="pb-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xl shadow-inner border border-primary/20">
            {lead.fullName.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{lead.fullName}</h2>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
              <Briefcase className="h-3.5 w-3.5" />
              {lead.role} {lead.company && `at ${lead.company}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" style={{ 
              backgroundColor: `${stageInfo?.color}15`,
              color: stageInfo?.color,
              borderColor: `${stageInfo?.color}30`
            }}>
              {stageInfo?.label}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              Score: <span className={scoreColor}>{lead.score}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-6">
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</h3>
          
          <div className="space-y-2 text-sm">
            {lead.email && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <a href={`mailto:${lead.email}`} className="hover:text-primary transition-colors truncate">
                  {lead.email}
                </a>
              </div>
            )}
            
            {lead.phone && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <a href={`tel:${lead.phone}`} className="hover:text-primary transition-colors truncate">
                  {lead.phone}
                </a>
              </div>
            )}
            
            {(lead.city || lead.country) && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="truncate">
                  {[lead.city, lead.country].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Social & Web</h3>
          
          <div className="space-y-2 text-sm">
            {lead.website && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </div>
                <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors truncate text-primary">
                  {lead.website}
                </a>
              </div>
            )}
            
            {lead.linkedin && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                </div>
                <a href={`https://linkedin.com/in/${lead.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors truncate">
                  linkedin.com/in/{lead.linkedin}
                </a>
              </div>
            )}
            
            {lead.instagram && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Instagram className="h-4 w-4 text-[#E1306C]" />
                </div>
                <a href={`https://instagram.com/${lead.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors truncate">
                  {lead.instagram.startsWith('@') ? lead.instagram : `@${lead.instagram}`}
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Qualification</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 p-3 rounded-lg flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground">Video Quality</span>
              <div className="flex items-center gap-1.5 font-medium text-sm">
                <Video className="h-3.5 w-3.5 text-primary" />
                {lead.videoQuality || 0}/10
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-lg flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground">Est. Budget</span>
              <div className="font-medium text-sm">
                ${lead.estimatedBudget ? lead.estimatedBudget.toLocaleString() : "Unknown"}
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-lg flex flex-col gap-1 col-span-2">
              <span className="text-[10px] text-muted-foreground">Needs Editing</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={
                  lead.needsEditing === 'YES' ? 'text-emerald-500 border-emerald-500/30' : 
                  lead.needsEditing === 'NO' ? 'text-destructive border-destructive/30' : 
                  'text-amber-500 border-amber-500/30'
                }>
                  {lead.needsEditing || 'MAYBE'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
