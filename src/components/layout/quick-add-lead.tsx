"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { quickAddLeadSchema, type QuickAddLeadInput } from "@/lib/validations";
import { LEAD_SOURCES, PIPELINE_STAGES } from "@/lib/constants";
import { createLead } from "@/app/actions";

export function QuickAddLead({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<QuickAddLeadInput>({
    resolver: zodResolver(quickAddLeadSchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      source: "OTHER",
      pipelineStage: "LEAD_FOUND",
    },
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.key === "n" && 
        !e.metaKey && !e.ctrlKey &&
        (document.activeElement?.tagName !== "INPUT" && 
         document.activeElement?.tagName !== "TEXTAREA")
      ) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  const onSubmit = async (data: QuickAddLeadInput) => {
    setIsLoading(true);
    setError("");
    
    try {
      await createLead(data);
      form.reset();
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError("Failed to create lead");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) form.reset();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quick Add Lead</DialogTitle>
          <DialogDescription>
            Add a new lead to your pipeline instantly.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              placeholder="e.g. John Doe" 
              {...form.register("fullName")} 
            />
            {form.formState.errors.fullName && (
              <p className="text-[10px] text-destructive">{form.formState.errors.fullName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="john@example.com" 
              {...form.register("email")} 
            />
            {form.formState.errors.email && (
              <p className="text-[10px] text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input 
              id="company" 
              placeholder="e.g. Acme Corp" 
              {...form.register("company")} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select 
                onValueChange={(val) => form.setValue("source", val as any)} 
                defaultValue={form.getValues("source")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select 
                onValueChange={(val) => form.setValue("pipelineStage", val as any)} 
                defaultValue={form.getValues("pipelineStage")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {error && <p className="text-sm text-destructive">{error}</p>}
          
          <div className="flex justify-end pt-4 gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
