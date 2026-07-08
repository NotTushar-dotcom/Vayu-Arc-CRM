"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import { 
  Search, Users, Building2, CheckSquare, 
  Settings, UserPlus, FileText 
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl border-border bg-background sm:max-w-[600px] [&>button]:hidden">
        <CommandPrimitive className="flex h-full w-full flex-col overflow-hidden rounded-md bg-transparent">
          <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
            <CommandPrimitive.Input 
              placeholder="Search leads, clients, or commands..." 
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
            />
          </div>
          
          <CommandPrimitive.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-track]:bg-transparent">
            <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </CommandPrimitive.Empty>
            
            <CommandPrimitive.Group heading="Navigation" className="p-1 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {NAV_ITEMS.map((item) => (
                <CommandPrimitive.Item
                  key={item.href}
                  onSelect={() => runCommand(() => router.push(item.href))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground text-foreground gap-2"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Go to {item.label}</span>
                </CommandPrimitive.Item>
              ))}
            </CommandPrimitive.Group>
            
            <CommandPrimitive.Group heading="Actions" className="p-1 text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 mt-2">
              <CommandPrimitive.Item
                onSelect={() => runCommand(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "n" })))}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground text-foreground gap-2"
              >
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <span>Add new lead...</span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  N
                </kbd>
              </CommandPrimitive.Item>
            </CommandPrimitive.Group>
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
