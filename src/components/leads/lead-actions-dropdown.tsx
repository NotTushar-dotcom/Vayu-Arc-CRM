"use client";

import Link from "next/link";
import { MoreHorizontal, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}: LeadActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
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
          <DropdownMenuItem asChild>
            <a 
              href={`mailto:${leadEmail}`}
              className="cursor-pointer flex items-center gap-2 w-full"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </a>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
