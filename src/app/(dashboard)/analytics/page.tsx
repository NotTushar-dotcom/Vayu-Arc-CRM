"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Target, Activity, Loader2 } from "lucide-react";
import { getAnalyticsData } from "@/app/actions";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAnalyticsData();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const conversionRate = data?.conversionRate || 0;
  const mrr = data?.mrr || 0;
  const avgDaysToClose = data?.avgDaysToClose || 14;
  const activeClients = data?.activeClients || 0;
  const sourceData = data?.sourceData || [];
  const conversionData = data?.conversionData || [];

  return (
    <div className="flex flex-col gap-6 h-full pb-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your agency&apos;s performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Won clients / total leads
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (MRR)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mrr.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active contract value
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Close</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDaysToClose} Days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average sales cycle
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active retainers
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Pipeline Growth</CardTitle>
              <CardDescription>Metrics across the entire funnel over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {conversionData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No monthly activity tracked yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={conversionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--vayu-mint))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--vayu-mint))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Area type="monotone" dataKey="leads" name="Leads Added" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorLeads)" />
                    <Area type="monotone" dataKey="clients" name="Clients Won" stroke="hsl(var(--vayu-mint))" fillOpacity={1} fill="url(#colorClients)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Leads by Source</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {sourceData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No lead sources tracked yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} fontSize={12} fill="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card className="glass flex items-center justify-center">
              <div className="text-center p-6 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <h3 className="font-medium text-foreground mb-1">More detailed reports coming soon</h3>
                <p className="text-sm">We are building advanced AI-powered insights for your agency.</p>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="conversion" className="pt-4">
          <Card className="glass h-[400px] flex flex-col p-6">
            <h3 className="font-semibold text-lg mb-2">Conversion Rates</h3>
            <p className="text-sm text-muted-foreground mb-6">Percentage of leads moving from stage to stage.</p>
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Contacted → Replied</span>
                  <span className="font-semibold">
                    {data?.funnel?.contacted > 0 ? ((data.funnel.responses / data.funnel.contacted) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${data?.funnel?.contacted > 0 ? (data.funnel.responses / data.funnel.contacted) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Replied → Won</span>
                  <span className="font-semibold">
                    {data?.funnel?.responses > 0 ? ((data.funnel.won / data.funnel.responses) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-vayu-mint" style={{ width: `${data?.funnel?.responses > 0 ? (data.funnel.won / data.funnel.responses) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="pt-4">
          <Card className="glass h-[400px] flex items-center justify-center p-6 text-center text-muted-foreground">
            <div>
              <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium text-foreground mb-1">Source breakdown analysis</p>
              <p className="text-xs max-w-md">Detailed metrics on acquisition channel performance and client conversion rates per channel.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
