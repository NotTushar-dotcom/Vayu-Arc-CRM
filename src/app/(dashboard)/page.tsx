import Link from "next/link";
import { Building2, DollarSign, MapPin } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { SalesFunnel } from "@/components/dashboard/sales-funnel";
import { CountryDistribution } from "@/components/dashboard/country-distribution";
import { MonthlyPerformance } from "@/components/dashboard/monthly-performance";
import { UpcomingFollowups } from "@/components/dashboard/upcoming-followups";
import { getDashboardStats, getClients } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard | Vayu Arc CRM",
};

export default async function DashboardPage() {
  const [stats, clients] = await Promise.all([
    getDashboardStats(),
    getClients(),
  ]);

  const totalLeads = stats.totalLeads;
  const newLeads = stats.newLeads;
  const emailsSent = stats.outreachPlatforms["EMAIL"] || 0;
  const linkedinRequests = stats.outreachPlatforms["LINKEDIN"] || 0;
  const replies = stats.funnel.responses;
  const closed = stats.won;
  const winRate = totalLeads > 0 ? ((closed / totalLeads) * 100).toFixed(0) + "%" : "0%";
  const instagramDMs = stats.outreachPlatforms["INSTAGRAM"] || 0;
  const discoveryCalls = stats.discoveryCalls;
  const followUpsDue = stats.followUpsDue;

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your agency today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard 
          title="Total Leads" 
          value={totalLeads.toString()} 
          icon="Users" 
          trend={{ value: 12, isPositive: true }} 
          delay={0}
        />
        <StatCard 
          title="New Leads" 
          value={newLeads.toString()} 
          description="Added last 30 days"
          icon="UserPlus" 
          delay={0.1}
        />
        <StatCard 
          title="Emails Sent" 
          value={emailsSent.toString()} 
          description="Total tracked"
          icon="Mail" 
          delay={0.1}
        />
        <StatCard 
          title="LinkedIn Requests" 
          value={linkedinRequests.toString()} 
          description="Total tracked"
          icon="Linkedin" 
          delay={0.2}
        />
        <StatCard 
          title="Replies Received" 
          value={replies.toString()} 
          trend={{ value: 8, isPositive: true }}
          icon="Reply" 
          delay={0.2}
        />
        
        <StatCard 
          title="Discovery Calls" 
          value={discoveryCalls.toString()} 
          description="Leads in stage"
          icon="PhoneCall" 
          delay={0.3}
          className="hidden xl:block"
        />
        <StatCard 
          title="Clients Closed" 
          value={closed.toString()} 
          trend={{ value: 2, isPositive: true }}
          icon="Building2" 
          delay={0.3}
          className="hidden xl:block"
        />
        <StatCard 
          title="Win Rate" 
          value={winRate} 
          trend={{ value: 1.2, isPositive: true }}
          icon="TrendingUp" 
          delay={0.4}
          className="hidden xl:block"
        />
        <StatCard 
          title="Follow-ups Due" 
          value={followUpsDue.toString()} 
          description="Tasks pending today"
          icon="Clock" 
          delay={0.4}
          className="hidden xl:block"
        />
        <StatCard 
          title="Instagram DMs" 
          value={instagramDMs.toString()} 
          description="Total DMs"
          icon="MessageSquare" 
          delay={0.5}
          className="hidden xl:block"
        />
      </div>

      {/* Client Cards Section */}
      {clients.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Active Clients</h2>
              <Badge variant="secondary" className="text-xs">{clients.length}</Badge>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/clients">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clients.slice(0, 3).map((client) => {
              const isActive = client.status === "active";
              const totalInvoiced = client.invoices?.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0) || 0;
              const displayValue = totalInvoiced > 0 ? totalInvoiced : (client.lead?.estimatedBudget || 0);

              return (
                <Link key={client.id} href={`/leads/${client.lead.id}`} className="block group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group-hover:border-primary/40 cursor-pointer bg-[hsl(160_20%_7%)] border-border/50">
                    <div className={`h-1.5 w-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                            {client.lead.fullName
                              ? client.lead.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                              : "C"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                              {client.lead.company || "No Company"}
                            </h3>
                            <p className="text-xs text-muted-foreground">{client.lead.fullName}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                          }`}
                        >
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${(client.monthlyRetainer ?? 0).toLocaleString()}/mo
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {client.lead.country || "N/A"}
                        </span>
                        <span className="font-medium text-foreground">
                          Value: ${displayValue.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <ActivityTimeline initialActivities={stats.recentActivities} />
        <UpcomingFollowups initialFollowUps={stats.upcomingFollowUps} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SalesFunnel initialData={stats.funnelData} />
        <CountryDistribution initialData={stats.countryData} />
      </div>
      
      <div className="grid gap-6 grid-cols-1">
        <MonthlyPerformance initialData={stats.performanceData} />
      </div>
    </div>
  );
}
