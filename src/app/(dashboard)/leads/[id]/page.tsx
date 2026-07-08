"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Edit, Calendar, FileText, CheckSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LeadProfileCard } from "@/components/leads/lead-profile-card";
import { OutreachTimeline } from "@/components/outreach/outreach-timeline";
import { LeadForm } from "@/components/leads/lead-form";
import { 
  getLeadById, 
  updateLead, 
  deleteLead,
  addLeadNote, 
  createTask, 
  toggleTaskCompleted,
  addAttachment,
  deleteAttachment
} from "@/app/actions";
import type { Priority } from "@prisma/client";

export default function LeadProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("outreach");

  const { id } = React.use(params);

  useEffect(() => {
    async function loadLead() {
      try {
        const data = await getLeadById(id);
        setLead(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLead();
  }, [id]);

  const handleUpdate = async (data: any) => {
    try {
      const updated = await updateLead(id, data);
      setLead(updated);
      setActiveTab("outreach");
    } catch (err) {
      console.error("Failed to update lead", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLead(id);
      router.push("/leads");
    } catch (err) {
      console.error("Failed to delete lead", err);
      alert("Failed to delete lead.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground text-sm">Loading lead profile...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-muted-foreground text-sm">Lead profile not found.</div>
        <Button asChild size="sm">
          <Link href="/leads">Back to Database</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 pb-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
          <Link href="/leads">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Lead Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View and manage details for {lead.fullName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card & Attachments */}
        <div className="lg:col-span-1 space-y-6">
          <LeadProfileCard lead={{
            ...lead,
            score: lead.priorityScore ?? 50
          }} />

          {/* Attachments Card */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Attachments</h3>
              <div className="relative">
                <Button size="sm" variant="outline" className="h-8 px-2 text-xs flex items-center gap-1 cursor-pointer">
                  <Plus className="h-3.5 w-3.5" /> Upload File
                </Button>
                <input
                  type="file"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                      if (!supabaseUrl || !supabaseKey) {
                        throw new Error("Supabase configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
                      }
                      const filename = `${Date.now()}-${file.name}`;
                      const uploadUrl = `${supabaseUrl}/storage/v1/object/vayu-crm/${filename}`;
                      
                      const res = await fetch(uploadUrl, {
                        method: "POST",
                        headers: {
                          "Authorization": `Bearer ${supabaseKey}`,
                          "apikey": supabaseKey,
                          "Content-Type": file.type,
                        },
                        body: file,
                      });

                      if (!res.ok) throw new Error("Upload failed");

                      // Public URL of the uploaded object
                      const fileUrl = `${supabaseUrl}/storage/v1/object/public/vayu-crm/${filename}`;

                      // Add database record
                      await addAttachment(lead.id, {
                        fileName: file.name,
                        fileUrl,
                        fileSize: file.size,
                        mimeType: file.type,
                      });

                      // Reload lead details
                      const updatedLead = await getLeadById(lead.id);
                      setLead(updatedLead);
                    } catch (err) {
                      console.error("Storage upload error", err);
                      alert("Failed to upload file to Supabase Storage.");
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              {!lead.attachments || lead.attachments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  No attachments yet. Upload documents above.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {lead.attachments.map((file: any) => (
                    <div key={file.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs gap-2 group">
                      <a 
                        href={file.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-primary hover:underline truncate max-w-[140px]"
                      >
                        {file.fileName}
                      </a>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {(file.fileSize / 1024).toFixed(0)} KB
                      </span>
                      <button
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this attachment?")) {
                            await deleteAttachment(file.id, lead.id);
                            const updatedLead = await getLeadById(lead.id);
                            setLead(updatedLead);
                          }
                        }}
                        className="text-destructive hover:text-destructive/80 font-semibold cursor-pointer text-[10px]"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tabs & Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
              <TabsTrigger value="outreach" className="text-xs sm:text-sm gap-2">
                <Calendar className="h-4 w-4 hidden sm:block" />
                Outreach
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs sm:text-sm gap-2">
                <FileText className="h-4 w-4 hidden sm:block" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs sm:text-sm gap-2">
                <CheckSquare className="h-4 w-4 hidden sm:block" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="edit" className="text-xs sm:text-sm gap-2">
                <Edit className="h-4 w-4 hidden sm:block" />
                Edit Lead
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="outreach" className="m-0">
                <OutreachTimeline leadId={lead.id} initialHistory={lead.outreach || []} />
              </TabsContent>
              
              <TabsContent value="notes" className="m-0 space-y-6">
                {/* Add Note Form */}
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <h3 className="text-sm font-semibold mb-3">Add Note</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const formData = new FormData(form);
                    const content = formData.get("content") as string;
                    if (!content.trim()) return;
                    await addLeadNote(lead.id, content);
                    form.reset();
                    // Reload lead profile
                    const data = await getLeadById(lead.id);
                    setLead(data);
                  }} className="flex flex-col gap-3">
                    <textarea
                      name="content"
                      placeholder="Type your note here..."
                      className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                    <Button type="submit" size="sm" className="self-end">Save Note</Button>
                  </form>
                </div>

                {/* Notes List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">All Notes ({lead.notes?.length || 0})</h3>
                  {!lead.notes || lead.notes.length === 0 ? (
                    <div className="rounded-lg border bg-card p-8 text-center border-dashed">
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-3" />
                      <p className="text-sm text-muted-foreground">No notes yet. Add one above to keep track of important details.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {lead.notes.map((note: any) => (
                        <div key={note.id} className="rounded-lg border bg-card p-4 shadow-sm flex flex-col gap-1">
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                          <div className="text-[10px] text-muted-foreground">
                            {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="m-0 space-y-6">
                {/* Add Task Form */}
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <h3 className="text-sm font-semibold mb-3">Create Task</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const formData = new FormData(form);
                    const title = formData.get("title") as string;
                    const priority = formData.get("priority") as Priority;
                    const dueDate = formData.get("dueDate") as string;
                    if (!title.trim()) return;
                    
                    await createTask({
                      title,
                      priority,
                      dueDate: dueDate || null,
                      leadId: lead.id,
                    });
                    form.reset();
                    // Reload lead profile
                    const data = await getLeadById(lead.id);
                    setLead(data);
                  }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-3">
                      <input
                        name="title"
                        placeholder="Task title..."
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        required
                      />
                    </div>
                    <div>
                      <select
                        name="priority"
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        defaultValue="MEDIUM"
                      >
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="HIGH">High Priority</option>
                        <option value="URGENT">Urgent Priority</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="date"
                        name="dueDate"
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="flex justify-end items-center">
                      <Button type="submit" size="sm" className="w-full">Create Task</Button>
                    </div>
                  </form>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Lead Tasks ({lead.tasks?.length || 0})</h3>
                  {!lead.tasks || lead.tasks.length === 0 ? (
                    <div className="rounded-lg border bg-card p-8 text-center border-dashed">
                      <CheckSquare className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-3" />
                      <p className="text-sm text-muted-foreground">No tasks yet. Create one above to assign follow-ups.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {lead.tasks.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={async (e) => {
                                await toggleTaskCompleted(task.id, e.target.checked);
                                // Reload lead profile
                                const data = await getLeadById(lead.id);
                                setLead(data);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "font-medium"}`}>
                                {task.title}
                              </span>
                              {task.dueDate && (
                                <span className="text-[10px] text-muted-foreground">
                                  Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant={task.priority === "HIGH" ? "destructive" : task.priority === "MEDIUM" ? "default" : "secondary"}>
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="edit" className="m-0">
                <LeadForm 
                  initialData={{
                    ...lead,
                    score: lead.priorityScore ?? 50
                  }} 
                  onSubmit={handleUpdate}
                  onDelete={handleDelete}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
