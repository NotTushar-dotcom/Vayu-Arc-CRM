"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, ExternalLink, Mail, MapPin, 
  DollarSign, FileText, Plus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getClients, createClient } from "@/app/actions";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function loadClients() {
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      await createClient({
        fullName: formData.get("fullName") as string,
        company: formData.get("company") as string,
        email: formData.get("email") as string,
        country: formData.get("country") as string,
        retainerAmount: Number(formData.get("retainerAmount")),
        status: formData.get("status") as string,
      });
      setOpen(false);
      form.reset();
      await loadClients();
    } catch (err) {
      console.error(err);
      alert("Failed to add client.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground text-sm">Loading clients database...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full pb-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your active accounts, retainers, and projects.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Add Client Dialog Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client account. This will also create a lead profile at the CLIENT_WON stage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddClient} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Contact Name</Label>
              <Input id="fullName" name="fullName" placeholder="e.g. John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" name="company" placeholder="e.g. Acme Corp" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" placeholder="e.g. United States" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retainerAmount">Monthly Retainer ($)</Label>
                <Input id="retainerAmount" name="retainerAmount" type="number" placeholder="2500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  name="status"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground flex flex-col items-center border border-dashed rounded-xl bg-card">
            <Building2 className="h-14 w-14 opacity-20 mb-4" />
            <p className="font-medium mb-1">No clients yet</p>
            <p className="text-sm">Click <strong>Add Client</strong> to create your first client account.</p>
          </div>
        ) : (
          clients.map(client => {
            const isActive = client.status === "active";
            const activeProjects = client.projects?.length ?? 0;
            const invoicedTotal = client.invoices?.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0) ?? 0;
            // If no invoices exist, fall back to the lead's estimated budget
            const totalValue = invoicedTotal > 0 ? invoicedTotal : (client.lead?.estimatedBudget ?? 0);
            const valueLabel = invoicedTotal > 0 ? "Total Invoiced" : "Est. Budget";

            return (
              <div key={client.id} className="block group">
                <Card 
                  className="glass overflow-hidden hover:shadow-lg transition-all duration-200 group-hover:border-primary/40 flex flex-col h-full cursor-pointer bg-card"
                  onClick={() => router.push(`/leads/${client.lead.id}`)}
                >
                  {/* Status stripe */}
                  <div className={`h-1.5 w-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                  
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg shadow-inner">
                          {client.lead.fullName
                            ? client.lead.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                            : "C"}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                            {client.lead.company || "No Company"}
                          </h3>
                          <p className="text-sm text-muted-foreground">{client.lead.fullName}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          isActive
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        }
                      >
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-2.5 mb-5 flex-1">
                      {client.lead.country && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 opacity-60 shrink-0" />
                          {client.lead.country}
                        </div>
                      )}
                      {client.lead.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 opacity-60 shrink-0" />
                          <span className="truncate">{client.lead.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 mb-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Retainer</p>
                        <p className="font-semibold text-foreground flex items-center">
                          ${(client.monthlyRetainer ?? 0).toLocaleString()}
                          <span className="text-xs text-muted-foreground font-normal ml-1">/mo</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Projects</p>
                        <p className="font-semibold text-foreground">{activeProjects}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-auto pt-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <DollarSign className="h-3 w-3" />
                        {valueLabel}:{" "}
                        <span className="font-medium text-foreground">${totalValue.toLocaleString()}</span>
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/leads/${client.lead.id}`);
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Profile
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            alert("Invoicing interface coming soon.");
                          }}
                        >
                          <FileText className="h-3 w-3" />
                          Invoices
                        </Button>
                      </div>
                    </div>
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
