import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

interface QuickAddLeadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddLead({ open, onOpenChange }: QuickAddLeadProps) {
  const [form, setForm] = useState({
    fullName: "",
    company: "",
    email: "",
    role: "",
    country: "",
    linkedin: "",
    instagram: "",
    industry: "Real Estate",
    leadSource: "LinkedIn" as "LinkedIn" | "Instagram" | "Referral" | "Website" | "Google" | "Cold Email" | "Other",
    pipelineStage: "Lead Found" as "Lead Found" | "LinkedIn Request Sent" | "Connected" | "Website Researched" | "Socials Found" | "Email Found" | "Cold Email Sent" | "Instagram DM Sent" | "Waiting" | "Follow-up 1" | "Follow-up 2" | "Discovery Call" | "Proposal Sent" | "Client Won" | "Client Lost",
    priorityScore: 50,
    notes: "",
  });

  const utils = trpc.useUtils();
  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => {
      utils.lead.list.invalidate();
      utils.lead.stats.invalidate();
      utils.analytics.kpiSummary.invalidate();
      toast.success("Lead created successfully");
      onOpenChange(false);
      setForm({
        fullName: "", company: "", email: "", role: "", country: "",
        linkedin: "", instagram: "", industry: "Real Estate",
        leadSource: "LinkedIn", pipelineStage: "Lead Found", priorityScore: 50, notes: "",
      });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.company) {
      toast.error("Name and company are required");
      return;
    }
    createLead.mutate(form);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[10%] -translate-x-1/2 w-full max-w-md z-50"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold">Quick Add Lead</h2>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
                    <input
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B] transition-colors"
                      placeholder="John Doe"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Company *</label>
                    <input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B] transition-colors"
                      placeholder="Acme Inc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B] transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                    <input
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B] transition-colors"
                      placeholder="CEO"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
                    <input
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B] transition-colors"
                      placeholder="United States"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.priorityScore}
                      onChange={(e) => setForm({ ...form, priorityScore: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">LinkedIn</label>
                    <input
                      value={form.linkedin}
                      onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B] transition-colors"
                      placeholder="linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Instagram</label>
                    <input
                      value={form.instagram}
                      onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B] transition-colors"
                      placeholder="@handle"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B] transition-colors resize-none"
                    placeholder="Any initial observations..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={createLead.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#A8B98B] text-[#1a2a1a] hover:bg-[#A8B98B]/90 transition-colors disabled:opacity-50"
                  >
                    {createLead.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
