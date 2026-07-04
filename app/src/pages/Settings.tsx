import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Palette, Building2, Sparkles } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function Settings() {
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    agencyName: "",
    email: "",
    logoUrl: "",
    primaryColor: "#A8B98B",
    secondaryColor: "#6F9270",
    accentColor: "#2C5C4B",
    darkColor: "#25343D",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        agencyName: settings.agencyName || "",
        email: settings.email || "",
        logoUrl: settings.logoUrl || "",
        primaryColor: settings.primaryColor || "#A8B98B",
        secondaryColor: settings.secondaryColor || "#6F9270",
        accentColor: settings.accentColor || "#2C5C4B",
        darkColor: settings.darkColor || "#25343D",
      });
    }
  }, [settings]);

  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Settings saved");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your agency preferences</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Agency Info */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-[#A8B98B]" />
              <h3 className="text-sm font-semibold">Agency Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Agency Name</label>
                <input
                  value={form.agencyName}
                  onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B]"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Logo URL</label>
              <input
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B]"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Brand Colors */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-[#A8B98B]" />
              <h3 className="text-sm font-semibold">Brand Colors</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Primary", key: "primaryColor" as const },
                { label: "Secondary", key: "secondaryColor" as const },
                { label: "Accent", key: "accentColor" as const },
                { label: "Dark", key: "darkColor" as const },
              ].map((color) => (
                <div key={color.key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{color.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form[color.key]}
                      onChange={(e) => setForm({ ...form, [color.key]: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                    />
                    <input
                      value={form[color.key]}
                      onChange={(e) => setForm({ ...form, [color.key]: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-[#A8B98B] uppercase"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Color Preview */}
            <div className="mt-4">
              <label className="text-xs text-muted-foreground mb-2 block">Preview</label>
              <div className="flex rounded-xl overflow-hidden h-12">
                <div className="flex-1" style={{ backgroundColor: form.primaryColor }} />
                <div className="flex-1" style={{ backgroundColor: form.secondaryColor }} />
                <div className="flex-1" style={{ backgroundColor: form.accentColor }} />
                <div className="flex-1" style={{ backgroundColor: form.darkColor }} />
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#A8B98B]" />
              <h3 className="text-sm font-semibold">Keyboard Shortcuts</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { keys: "⌘K", action: "Command palette" },
                { keys: "C", action: "Quick add lead" },
                { keys: "G → D", action: "Go to Dashboard" },
                { keys: "G → L", action: "Go to Leads" },
                { keys: "G → C", action: "Go to Clients" },
                { keys: "G → T", action: "Go to Tasks" },
                { keys: "G → A", action: "Go to Analytics" },
                { keys: "G → S", action: "Go to Settings" },
              ].map((shortcut) => (
                <div key={shortcut.action} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                  <kbd className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateSettings.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-[#A8B98B] text-[#1a2a1a] hover:bg-[#A8B98B]/90 transition-colors disabled:opacity-50"
            >
              {updateSettings.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </motion.form>
      )}
    </div>
  );
}
