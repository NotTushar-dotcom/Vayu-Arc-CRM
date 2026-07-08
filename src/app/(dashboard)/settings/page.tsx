"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings2, User, Bell, Shield, Paintbrush, Loader2 } from "lucide-react";
import { getAgencySettings, updateAgencySettings } from "@/app/actions";

export default function SettingsPage() {
  const [agencyName, setAgencyName] = useState("Vayu Arc");
  const [agencyEmail, setAgencyEmail] = useState("admin@vayuarc.com");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getAgencySettings();
        if (settings) {
          setAgencyName(settings.agencyName);
          setAgencyEmail(settings.email || "");
          setLogoUrl(settings.logoUrl || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveAgencyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateAgencySettings({
        agencyName,
        email: agencyEmail,
        logoUrl,
      });
      setMessage("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full pb-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your agency preferences, team, and billing.</p>
      </div>

      <Tabs defaultValue="agency" className="w-full flex flex-col md:flex-row gap-6">
        <TabsList className="flex md:flex-col h-auto w-full md:w-64 bg-transparent p-0 gap-2 overflow-x-auto justify-start items-start shrink-0">
          <TabsTrigger value="agency" className="w-full justify-start gap-2 data-[state=active]:bg-muted/50 data-[state=active]:text-primary rounded-lg border border-transparent data-[state=active]:border-border/50 py-2.5 px-4">
            <Settings2 className="h-4 w-4" />
            Agency Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="w-full justify-start gap-2 data-[state=active]:bg-muted/50 data-[state=active]:text-primary rounded-lg border border-transparent data-[state=active]:border-border/50 py-2.5 px-4">
            <Paintbrush className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="account" className="w-full justify-start gap-2 data-[state=active]:bg-muted/50 data-[state=active]:text-primary rounded-lg border border-transparent data-[state=active]:border-border/50 py-2.5 px-4">
            <User className="h-4 w-4" />
            My Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start gap-2 data-[state=active]:bg-muted/50 data-[state=active]:text-primary rounded-lg border border-transparent data-[state=active]:border-border/50 py-2.5 px-4">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="w-full justify-start gap-2 data-[state=active]:bg-muted/50 data-[state=active]:text-primary rounded-lg border border-transparent data-[state=active]:border-border/50 py-2.5 px-4">
            <Shield className="h-4 w-4" />
            Security & Team
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 min-w-0">
          <TabsContent value="agency" className="m-0 space-y-6">
            <form onSubmit={handleSaveAgencyInfo}>
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Agency Information</CardTitle>
                  <CardDescription>Update your agency details and branding.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-2xl border border-dashed border-primary/30 bg-primary/5 flex items-center justify-center text-primary font-bold text-2xl">
                      {agencyName ? agencyName.charAt(0).toUpperCase() : "V"}
                    </div>
                    <div>
                      <Button type="button" variant="outline" size="sm" className="mb-2" onClick={() => {
                        const url = prompt("Enter Logo Image URL:");
                        if (url) setLogoUrl(url);
                      }}>Set Logo URL</Button>
                      <p className="text-xs text-muted-foreground">Or provide a public image URL below.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="agencyName">Agency Name</Label>
                      <Input 
                        id="agencyName" 
                        value={agencyName} 
                        onChange={(e) => setAgencyName(e.target.value)} 
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="agencyEmail">Agency Email</Label>
                      <Input 
                        id="agencyEmail" 
                        type="email"
                        value={agencyEmail} 
                        onChange={(e) => setAgencyEmail(e.target.value)} 
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="logoUrl">Logo URL</Label>
                      <Input 
                        id="logoUrl" 
                        placeholder="https://example.com/logo.png"
                        value={logoUrl} 
                        onChange={(e) => setLogoUrl(e.target.value)} 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border/50 px-6 py-4 flex flex-col items-start gap-4">
                  <div className="flex items-center gap-4">
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                    {message && (
                      <span className={`text-sm font-medium ${message.includes("success") ? "text-emerald-500" : "text-destructive"}`}>
                        {message}
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
          
          <TabsContent value="appearance" className="m-0 space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Theme Preferences</CardTitle>
                <CardDescription>Customize the look and feel of your CRM.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-3 block">Color Theme</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="border-2 border-primary rounded-lg p-1 cursor-pointer">
                        <div className="h-24 rounded bg-background flex items-center justify-center border">
                          <span className="text-sm font-medium">Dark Teal (Active)</span>
                        </div>
                      </div>
                      <div className="border border-border rounded-lg p-1 cursor-pointer hover:border-primary/50 transition-colors opacity-50" onClick={() => alert("Theme selection is locked to Dark Teal for brand consistency.")}>
                        <div className="h-24 rounded bg-[#0d1a1a] flex items-center justify-center border border-white/10">
                          <span className="text-sm font-medium text-white/80">Forest Night</span>
                        </div>
                      </div>
                      <div className="border border-border rounded-lg p-1 cursor-pointer hover:border-primary/50 transition-colors opacity-50" onClick={() => alert("Theme selection is locked to Dark Teal for brand consistency.")}>
                        <div className="h-24 rounded bg-white flex items-center justify-center border border-black/10">
                          <span className="text-sm font-medium text-black/80">Light Mode</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="m-0 space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what alerts you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Lead Added</Label>
                      <p className="text-sm text-muted-foreground">Receive an email when a new lead is captured via forms.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Client Won</Label>
                      <p className="text-sm text-muted-foreground">Receive an email when a lead converts to a client.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Summary</Label>
                      <p className="text-sm text-muted-foreground">A daily digest of follow-ups and tasks due.</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="m-0 space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input defaultValue="Admin User" disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input defaultValue="admin@vayuarc.com" disabled />
                  <p className="text-xs text-muted-foreground">Contact support to change your primary email.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="m-0 space-y-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage who has access to your CRM.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Shield className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-3" />
                  <h3 className="font-medium">Team management</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">You are currently on the single-user plan. Upgrade to add team members.</p>
                  <Button variant="outline">Upgrade Plan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
