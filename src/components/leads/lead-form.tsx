"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2, Globe, Mail, MapPin,
  Phone, User, Calendar, Save, Trash2
} from "lucide-react";
import { Linkedin, Instagram } from "@/components/icons/social-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { leadCreateSchema, type LeadCreateInput } from "@/lib/validations";
import { PIPELINE_STAGES, LEAD_SOURCES, COUNTRIES, NEEDS_EDITING_OPTIONS } from "@/lib/constants";

interface LeadFormProps {
  initialData?: any;
  onSubmit: (data: LeadCreateInput) => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function LeadForm({ initialData, onSubmit, onDelete, isLoading }: LeadFormProps) {
  const form = useForm<LeadCreateInput>({
    resolver: zodResolver(leadCreateSchema),
    defaultValues: initialData || {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      role: "",
      country: "",
      city: "",
      website: "",
      linkedin: "",
      instagram: "",
      source: "OTHER",
      pipelineStage: "LEAD_FOUND",
      needsEditing: "MAYBE",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Personal & Company */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Personal & Company
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input {...form.register("fullName")} placeholder="John Doe" />
              {form.formState.errors.fullName && (
                <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <div className="relative">
                  <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input {...form.register("company")} className="pl-9" placeholder="Acme Corp" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role / Title</Label>
                <Input {...form.register("role")} placeholder="CEO" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  onValueChange={(val) => form.setValue("country", val)}
                  defaultValue={form.getValues("country") || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input {...form.register("city")} className="pl-9" placeholder="New York" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input {...form.register("email")} type="email" className="pl-9" placeholder="john@example.com" />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input {...form.register("phone")} className="pl-9" placeholder="+1 234 567 8900" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <div className="relative">
                <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input {...form.register("website")} className="pl-9" placeholder="https://example.com" />
              </div>
              {form.formState.errors.website && (
                <p className="text-xs text-destructive">{form.formState.errors.website.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input {...form.register("linkedin")} className="pl-9" placeholder="linkedin.com/in/johndoe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input {...form.register("instagram")} className="pl-9" placeholder="@johndoe" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline & Source */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Pipeline & Source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pipeline Stage</Label>
              <Select
                onValueChange={(val) => form.setValue("pipelineStage", val as any)}
                defaultValue={form.getValues("pipelineStage")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage..." />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lead Source</Label>
              <Select
                onValueChange={(val) => form.setValue("source", val as any)}
                defaultValue={form.getValues("source")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source..." />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Research & Qualification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Qualification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Video Quality (1-10)</Label>
                <Input {...form.register("videoQuality")} type="number" min="0" max="10" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Branding Rating (1-10)</Label>
                <Input {...form.register("brandingRating")} type="number" min="0" max="10" placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Est. Budget ($)</Label>
                <Input {...form.register("estimatedBudget")} type="number" placeholder="5000" />
              </div>
              <div className="space-y-2">
                <Label>Needs Editing?</Label>
                <Select
                  onValueChange={(val) => form.setValue("needsEditing", val as any)}
                  defaultValue={form.getValues("needsEditing")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {NEEDS_EDITING_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-6">
        {initialData && onDelete ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => {
              if (confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
                onDelete();
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete Lead
          </Button>
        ) : (
          <div></div> // Empty div to keep save button on the right
        )}
        <Button type="submit" disabled={isLoading} className="gap-2 px-8">
          <Save className="h-4 w-4" />
          {initialData ? "Save Changes" : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}

