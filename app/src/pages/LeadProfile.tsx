import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MapPin,
  Clock,
  Star,
  Edit3,
  Save,
  X,
  MessageSquare,
  History,
  Plus,
  Loader2,
  UserCheck,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { cn, formatDate, formatDateTime, getStageColor, getPriorityColor } from "@/lib/utils";
import { toast } from "sonner";

const pipelineStages = [
  "Lead Found", "LinkedIn Request Sent", "Connected", "Website Researched",
  "Socials Found", "Email Found", "Cold Email Sent", "Instagram DM Sent",
  "Waiting", "Follow-up 1", "Follow-up 2", "Discovery Call",
  "Proposal Sent", "Client Won", "Client Lost",
];

export default function LeadProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const leadId = Number(id);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "outreach" | "activity">("overview");
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [outreachForm, setOutreachForm] = useState({ platform: "Email" as "LinkedIn" | "Instagram" | "Email" | "Phone" | "WhatsApp", messageType: "", message: "" });

  const { data: lead, isLoading, refetch } = trpc.lead.getById.useQuery({ id: leadId });
  const utils = trpc.useUtils();

  const updateLead = trpc.lead.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditing(false);
      toast.success("Lead updated");
    },
  });

  const updateStage = trpc.lead.updateStage.useMutation({
    onSuccess: () => {
      refetch();
      utils.lead.stats.invalidate();
      toast.success("Stage updated");
    },
  });

  const addNote = trpc.lead.addNote.useMutation({
    onSuccess: () => {
      refetch();
      setNoteText("");
      toast.success("Note added");
    },
  });

  const addOutreach = trpc.lead.addOutreach.useMutation({
    onSuccess: () => {
      refetch();
      setOutreachForm({ platform: "Email", messageType: "", message: "" });
      toast.success("Outreach recorded");
    },
  });

  const convertToClient = trpc.clientManager.create.useMutation({
    onSuccess: () => {
      refetch();
      utils.clientManager.list.invalidate();
      toast.success("Converted to client!");
    },
  });

  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const handleEdit = () => {
    if (!lead) return;
    setEditForm({
      fullName: lead.fullName,
      company: lead.company,
      role: lead.role || "",
      email: lead.email || "",
      phone: lead.phone || "",
      website: lead.website || "",
      linkedin: lead.linkedin || "",
      instagram: lead.instagram || "",
      country: lead.country || "",
      city: lead.city || "",
      industry: lead.industry || "",
      services: lead.services || "",
      followers: lead.followers || "",
      estimatedBudget: lead.estimatedBudget || "",
    });
    setEditing(true);
  };

  const handleSave = () => {
    updateLead.mutate({
      id: leadId,
      data: {
        fullName: editForm.fullName,
        company: editForm.company,
        role: editForm.role || undefined,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        website: editForm.website || undefined,
        linkedin: editForm.linkedin || undefined,
        instagram: editForm.instagram || undefined,
        country: editForm.country || undefined,
        city: editForm.city || undefined,
        industry: editForm.industry || undefined,
        services: editForm.services || undefined,
        followers: editForm.followers || undefined,
        estimatedBudget: editForm.estimatedBudget || undefined,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Lead not found
      </div>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: UserCheck },
    { id: "notes" as const, label: `Notes (${lead.notes?.length ?? 0})`, icon: Edit3 },
    { id: "outreach" as const, label: `Outreach (${lead.outreach?.length ?? 0})`, icon: MessageSquare },
    { id: "activity" as const, label: "Activity", icon: History },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/leads")}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A8B98B]/30 to-[#2C5C4B]/30 flex items-center justify-center text-lg font-semibold text-[#A8B98B]">
              {lead.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{lead.fullName}</h2>
              <p className="text-sm text-muted-foreground">{lead.role} at {lead.company}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lead.isClient !== "Yes" && (
            <button
              onClick={() => convertToClient.mutate({ leadId })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#A8B98B] text-[#1a2a1a] hover:bg-[#A8B98B]/90 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Convert to Client
            </button>
          )}
          {!editing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#A8B98B] text-[#1a2a1a] hover:bg-[#A8B98B]/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stage Pipeline */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pipeline Stage</span>
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium", getStageColor(lead.pipelineStage || ""))}>
            {lead.pipelineStage || "—"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pipelineStages.map((stage) => (
            <button
              key={stage}
              onClick={() => updateStage.mutate({ id: leadId, stage: stage as "Lead Found" | "LinkedIn Request Sent" | "Connected" | "Website Researched" | "Socials Found" | "Email Found" | "Cold Email Sent" | "Instagram DM Sent" | "Waiting" | "Follow-up 1" | "Follow-up 2" | "Discovery Call" | "Proposal Sent" | "Client Won" | "Client Lost" })}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all",
                (lead.pipelineStage || "") === stage
                  ? "bg-[#A8B98B] text-[#1a2a1a]"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              )}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2",
              activeTab === tab.id
                ? "text-[#A8B98B] border-[#A8B98B]"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Info */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold">Contact Information</h3>
              <div className="space-y-3">
                {[
                  { icon: Mail, label: "Email", value: lead.email },
                  { icon: Phone, label: "Phone", value: lead.phone },
                  { icon: Globe, label: "Website", value: lead.website },
                  { icon: MapPin, label: "Location", value: [lead.city, lead.country].filter(Boolean).join(", ") },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      {editing ? (
                        <input
                          value={editForm[item.label.toLowerCase()] || ""}
                          onChange={(e) => setEditForm({ ...editForm, [item.label.toLowerCase()]: e.target.value })}
                          className="w-full px-2 py-1 mt-0.5 rounded bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B]"
                        />
                      ) : (
                        <div className="text-sm">{item.value || "—"}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Profiles */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold">Social Profiles</h3>
              <div className="space-y-3">
                {[
                  { icon: Linkedin, label: "LinkedIn", value: lead.linkedin, color: "text-sky-400" },
                  { icon: Instagram, label: "Instagram", value: lead.instagram, color: "text-pink-400" },
                  { icon: Twitter, label: "X / Twitter", value: lead.x, color: "text-slate-300" },
                  { icon: Youtube, label: "YouTube", value: lead.youtube, color: "text-red-400" },
                  { icon: Facebook, label: "Facebook", value: lead.facebook, color: "text-blue-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className={cn("w-4 h-4 mt-0.5", item.color)} />
                    <div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      {editing ? (
                        <input
                          value={editForm[item.label.toLowerCase()] || ""}
                          onChange={(e) => setEditForm({ ...editForm, [item.label.toLowerCase()]: e.target.value })}
                          className="w-full px-2 py-1 mt-0.5 rounded bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B]"
                        />
                      ) : (
                        <div className="text-sm">{item.value || "—"}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Research */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold">Research</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Industry</div>
                  {editing ? (
                    <input
                      value={editForm.industry || ""}
                      onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                      className="w-full px-2 py-1 mt-0.5 rounded bg-secondary border border-border text-sm outline-none"
                    />
                  ) : (
                    <div className="text-sm">{lead.industry || "—"}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Services</div>
                  {editing ? (
                    <input
                      value={editForm.services || ""}
                      onChange={(e) => setEditForm({ ...editForm, services: e.target.value })}
                      className="w-full px-2 py-1 mt-0.5 rounded bg-secondary border border-border text-sm outline-none"
                    />
                  ) : (
                    <div className="text-sm">{lead.services || "—"}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                  {editing ? (
                    <input
                      value={editForm.followers || ""}
                      onChange={(e) => setEditForm({ ...editForm, followers: e.target.value })}
                      className="w-full px-2 py-1 mt-0.5 rounded bg-secondary border border-border text-sm outline-none"
                    />
                  ) : (
                    <div className="text-sm">{lead.followers || "—"}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Posting Frequency</div>
                  <div className="text-sm">{lead.postingFrequency || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Video Quality</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-[#A8B98B]" />
                    <span className="text-sm font-medium">{lead.videoQualityRating}/10</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Branding</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-[#A8B98B]" />
                    <span className="text-sm font-medium">{lead.brandingRating}/10</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Needs Video Editing</div>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1",
                    lead.needsVideoEditing === "Yes" ? "text-green-400 bg-green-400/10" :
                    lead.needsVideoEditing === "Maybe" ? "text-amber-400 bg-amber-400/10" :
                    "text-red-400 bg-red-400/10"
                  )}>
                    {lead.needsVideoEditing}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Estimated Budget</div>
                  {editing ? (
                    <input
                      value={editForm.estimatedBudget || ""}
                      onChange={(e) => setEditForm({ ...editForm, estimatedBudget: e.target.value })}
                      className="w-full px-2 py-1 mt-0.5 rounded bg-secondary border border-border text-sm outline-none"
                    />
                  ) : (
                    <div className="text-sm">{lead.estimatedBudget || "—"}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Priority Score</div>
                  <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-1", getPriorityColor(lead.priorityScore ?? 0))}>
                    {lead.priorityScore ?? 0}/100
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Lead Source</div>
                  <div className="text-sm">{lead.leadSource}</div>
                </div>
              </div>
            </div>

            {/* Key Dates */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold">Key Dates</h3>
              <div className="space-y-3">
                {[
                  { label: "Added", date: lead.addedDate },
                  { label: "Last Contact", date: lead.lastContactDate },
                  { label: "Next Follow-up", date: lead.nextFollowUp },
                  ...(lead.clientSince ? [{ label: "Client Since", date: lead.clientSince }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="text-sm">{formatDate(item.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex gap-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B] resize-none"
                />
                <button
                  onClick={() => { if (noteText.trim()) addNote.mutate({ leadId, content: noteText }); }}
                  disabled={!noteText.trim() || addNote.isPending}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[#A8B98B] text-[#1a2a1a] hover:bg-[#A8B98B]/90 transition-colors disabled:opacity-50 self-end"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {(lead.notes ?? []).length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No notes yet. Add your first note above.
                </div>
              )}
              {(lead.notes ?? []).map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="text-[10px] text-muted-foreground mt-2">
                    {formatDateTime(note.createdAt)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "outreach" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <h4 className="text-sm font-medium mb-3">Log Outreach</h4>
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={outreachForm.platform}
                  onChange={(e) => setOutreachForm({ ...outreachForm, platform: e.target.value as typeof outreachForm.platform })}
                  className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none"
                >
                  {["LinkedIn", "Instagram", "Email", "Phone", "WhatsApp"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input
                  value={outreachForm.messageType}
                  onChange={(e) => setOutreachForm({ ...outreachForm, messageType: e.target.value })}
                  placeholder="Message type"
                  className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none"
                />
                <button
                  onClick={() => {
                    if (outreachForm.messageType.trim()) {
                      addOutreach.mutate({ leadId, ...outreachForm });
                    }
                  }}
                  disabled={!outreachForm.messageType.trim()}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-[#A8B98B] text-[#1a2a1a] hover:bg-[#A8B98B]/90 transition-colors disabled:opacity-50"
                >
                  Log
                </button>
              </div>
              <textarea
                value={outreachForm.message}
                onChange={(e) => setOutreachForm({ ...outreachForm, message: e.target.value })}
                placeholder="Message content (optional)"
                rows={2}
                className="w-full mt-3 px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none resize-none"
              />
            </div>

            <div className="space-y-3">
              {(lead.outreach ?? []).length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No outreach recorded yet.
                </div>
              )}
              {(lead.outreach ?? []).map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary">
                        {activity.platform}
                      </span>
                      <span className="text-sm font-medium">{activity.messageType}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full",
                      activity.status === "Replied" ? "text-green-400 bg-green-400/10" :
                      activity.status === "Sent" ? "text-blue-400 bg-blue-400/10" :
                      "text-muted-foreground bg-secondary"
                    )}>
                      {activity.status}
                    </span>
                  </div>
                  {activity.message && (
                    <p className="text-sm text-muted-foreground mt-2">{activity.message}</p>
                  )}
                  {activity.reply && (
                    <div className="mt-2 p-2 rounded-lg bg-[#A8B98B]/5 border border-[#A8B98B]/20">
                      <span className="text-[10px] text-[#A8B98B] font-medium">Reply:</span>
                      <p className="text-sm mt-0.5">{activity.reply}</p>
                    </div>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-2">
                    {formatDateTime(activity.date)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            {/* Activity items would be fetched from a separate endpoint */}
            <div className="text-center text-muted-foreground text-sm py-8">
              Activity log coming soon.
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
