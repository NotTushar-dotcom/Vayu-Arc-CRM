"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ExternalLink, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PIPELINE_STAGES } from "@/lib/constants";
import { updateLead } from "@/app/actions";

interface LeadActionsDropdownProps {
  leadId: string;
  leadCompany: string | null;
  leadEmail: string | null;
  currentStage: string;
}

export function LeadActionsDropdown({
  leadId,
  leadCompany,
  leadEmail,
  currentStage,
}: LeadActionsDropdownProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStageChange = async (newStage: string) => {
    if (newStage === currentStage) return;
    setIsUpdating(true);
    try {
      await updateLead(leadId, { pipelineStage: newStage });
      router.refresh();
    } catch (err) {
      console.error("Failed to update pipeline stage:", err);
      alert("Failed to update pipeline stage.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] bg-background border border-border">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/leads/${leadId}`} className="cursor-pointer flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            View Profile
          </Link>
        </DropdownMenuItem>
        {leadEmail && (
          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-2"
            onClick={() => {
              window.location.href = `mailto:${leadEmail}`;
            }}
          >
            <Mail className="h-4 w-4" />
            Send Email
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Change Stage</DropdownMenuLabel>
        {PIPELINE_STAGES.map(stage => (
          <DropdownMenuItem
            key={stage.value}
            className={`cursor-pointer text-xs ${stage.value === currentStage ? "bg-accent text-accent-foreground font-semibold" : ""}`}
            onClick={() => handleStageChange(stage.value)}
          >
            {stage.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
