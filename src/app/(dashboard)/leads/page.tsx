import Link from "next/link";
import { format } from "date-fns";
import { Mail, MapPin } from "lucide-react";

import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadActionsDropdown } from "@/components/leads/lead-actions-dropdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { PIPELINE_STAGES } from "@/lib/constants";
import { getLeads } from "@/app/actions";

export const metadata = {
  title: "Leads | Vayu Arc CRM",
};

interface PageProps {
  searchParams: Promise<{
    search?: string;
    stage?: string;
    source?: string;
    country?: string;
    needsEditing?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const leads = await getLeads(resolvedParams);

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads Database</h1>
        <p className="text-muted-foreground mt-1">Manage, filter, and track all your potential clients.</p>
      </div>

      <LeadFilters leads={leads} />

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex-1 overflow-hidden flex flex-col">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[300px]">Lead</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead className="w-[70px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No leads found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => {
                const stageInfo = PIPELINE_STAGES.find(s => s.value === lead.pipelineStage);
                const priorityScore = lead.priorityScore ?? 0;
                const scoreColor = priorityScore >= 80 ? "bg-emerald-500" : priorityScore >= 60 ? "bg-amber-500" : "bg-muted-foreground";
                
                return (
                  <TableRow key={lead.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                          {lead.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <Link href={`/leads/${lead.id}`} className="font-semibold truncate hover:text-primary transition-colors">
                            {lead.fullName}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">{lead.company || "No Company"}</span>
                            {lead.email && (
                              <span className="hidden sm:inline-flex items-center gap-1 truncate text-primary/70">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="font-normal" style={{ 
                        backgroundColor: `${stageInfo?.color}15`,
                        color: stageInfo?.color,
                        borderColor: `${stageInfo?.color}30`
                      }}>
                        {stageInfo?.label || lead.pipelineStage}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 opacity-70" />
                        {lead.country || "Unknown"}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${scoreColor}`} style={{ width: `${priorityScore}%` }} />
                        </div>
                        <span className="text-xs font-medium">{priorityScore}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-sm text-muted-foreground">
                      {lead.lastContactDate ? format(new Date(lead.lastContactDate), "MMM d, yyyy") : "Never"}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <LeadActionsDropdown
                          leadId={lead.id}
                          leadCompany={lead.company}
                          leadEmail={lead.email}
                          currentStage={lead.pipelineStage}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        
        <div className="border-t p-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>Showing {leads.length} of {leads.length} leads</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
