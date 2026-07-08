"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, Search, SlidersHorizontal, Download, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { PIPELINE_STAGES, LEAD_SOURCES, COUNTRIES, NEEDS_EDITING_OPTIONS } from "@/lib/constants";
import { createLead } from "@/app/actions";
import Papa from "papaparse";

interface LeadFiltersProps {
  leads?: any[];
}

export function LeadFilters({ leads = [] }: LeadFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Read current filter values from URL
  const currentSearch = searchParams.get("search") || "";
  const currentStage = searchParams.get("stage") || "";
  const currentSource = searchParams.get("source") || "";
  const currentCountry = searchParams.get("country") || "";
  const currentNeedsEditing = searchParams.get("needsEditing") || "";

  // Local filter state for the filter panel
  const [filterStage, setFilterStage] = useState(currentStage);
  const [filterSource, setFilterSource] = useState(currentSource);
  const [filterCountry, setFilterCountry] = useState(currentCountry);
  const [filterNeedsEditing, setFilterNeedsEditing] = useState(currentNeedsEditing);

  // Build and apply URL params
  const applyFilters = useCallback((overrides?: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    const values: Record<string, string> = {
      stage: filterStage,
      source: filterSource,
      country: filterCountry,
      needsEditing: filterNeedsEditing,
      ...overrides,
    };

    for (const [key, value] of Object.entries(values)) {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`/leads?${params.toString()}`);
  }, [searchParams, filterStage, filterSource, filterCountry, filterNeedsEditing, router]);

  // Count active filters (excluding search)
  const activeFilterKeys = ["stage", "source", "country", "needsEditing"];
  const activeFilters = activeFilterKeys.filter(k => searchParams.has(k)).length;

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = (formData.get("search") as string).trim();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    router.push(`/leads?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setFilterStage("");
    setFilterSource("");
    setFilterCountry("");
    setFilterNeedsEditing("");
    router.push("/leads");
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    if (key === "stage") setFilterStage("");
    if (key === "source") setFilterSource("");
    if (key === "country") setFilterCountry("");
    if (key === "needsEditing") setFilterNeedsEditing("");
    router.push(`/leads?${params.toString()}`);
  };

  const getFilterLabel = (key: string): string => {
    const value = searchParams.get(key) || "";
    switch (key) {
      case "stage": return `Stage: ${PIPELINE_STAGES.find(s => s.value === value)?.label || value}`;
      case "source": return `Source: ${LEAD_SOURCES.find(s => s.value === value)?.label || value}`;
      case "country": return `Country: ${value}`;
      case "needsEditing": return `Editing: ${NEEDS_EDITING_OPTIONS.find(o => o.value === value)?.label || value}`;
      default: return value;
    }
  };

  // ─── CSV EXPORT ─────────────────────────────────────────
  const handleExport = () => {
    if (leads.length === 0) {
      alert("No leads to export.");
      return;
    }

    const exportData = leads.map((lead) => ({
      "Full Name": lead.fullName,
      "Company": lead.company || "",
      "Email": lead.email || "",
      "Phone": lead.phone || "",
      "Website": lead.website || "",
      "Country": lead.country || "",
      "City": lead.city || "",
      "Pipeline Stage": lead.pipelineStage,
      "Source": lead.source,
      "Estimated Budget": lead.estimatedBudget || 0,
      "Created At": lead.createdAt,
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vayu_leads_export_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── CSV IMPORT ─────────────────────────────────────────
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          let count = 0;
          for (const row of results.data as any[]) {
            const fullName = row["Full Name"] || row["Name"] || row["fullName"];
            if (!fullName) continue;

            const company = row["Company"] || row["company"] || "";
            const email = row["Email"] || row["email"] || "";
            const phone = row["Phone"] || row["phone"] || "";
            const website = row["Website"] || row["website"] || "";
            const country = row["Country"] || row["country"] || "United States";
            const city = row["City"] || row["city"] || "";
            const budget = parseFloat(row["Estimated Budget"] || row["estimatedBudget"] || "0") || 0;

            await createLead({
              fullName,
              company,
              email,
              phone,
              website,
              country,
              city,
              source: "OTHER",
              pipelineStage: "LEAD_FOUND",
              estimatedBudget: budget,
            });
            count++;
          }
          alert(`Successfully imported ${count} leads!`);
          router.refresh();
        } catch (err) {
          console.error(err);
          alert("Error importing leads. Please make sure the CSV headers match: Full Name, Company, Email, Phone, Website, Country, City, Estimated Budget");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (error) => {
        console.error(error);
        alert("Failed to parse CSV file.");
        setIsImporting(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input for CSV import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        className="hidden" 
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 w-full sm:max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              name="search"
              defaultValue={currentSearch}
              placeholder="Search leads by name, email, company..." 
              className="w-full pl-9 bg-background/50"
            />
          </form>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className={isOpen || activeFilters > 0 ? "border-primary text-primary bg-primary/5" : ""}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeFilters}
              </span>
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleImportClick} 
            disabled={isImporting}
            className="w-full sm:w-auto gap-2"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Import CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            className="w-full sm:w-auto gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-border bg-card/50 glass animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Pipeline Stage</label>
            <Select value={filterStage || "all"} onValueChange={setFilterStage}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {PIPELINE_STAGES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Lead Source</label>
            <Select value={filterSource || "all"} onValueChange={setFilterSource}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {LEAD_SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Country</label>
            <Select value={filterCountry || "all"} onValueChange={setFilterCountry}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Needs Editing</label>
            <Select value={filterNeedsEditing || "all"} onValueChange={setFilterNeedsEditing}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                {NEEDS_EDITING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2 border-t border-border mt-2">
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Reset
            </Button>
            <Button size="sm" onClick={() => { applyFilters(); setIsOpen(false); }}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
      
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {activeFilterKeys.filter(k => searchParams.has(k)).map(key => (
            <Badge key={key} variant="secondary" className="gap-1 px-2 py-1 rounded-full bg-accent text-accent-foreground border-transparent">
              {getFilterLabel(key)}
              <X className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" onClick={() => removeFilter(key)} />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground px-2" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
