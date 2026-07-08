"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE_STAGES } from "@/lib/constants";

interface FunnelItem {
  stage: string;
  count: number;
}

export function SalesFunnel({ initialData }: { initialData?: FunnelItem[] }) {
  const data = (initialData || []).map((item) => {
    // Dynamically find color from PIPELINE_STAGES
    let stageKey = "LEAD_FOUND";
    if (item.stage === "Contacted") stageKey = "COLD_EMAIL_SENT";
    else if (item.stage === "Replied") stageKey = "CONNECTED";
    else if (item.stage === "Meeting") stageKey = "DISCOVERY_CALL";
    else if (item.stage === "Proposal") stageKey = "PROPOSAL_SENT";
    else if (item.stage === "Won") stageKey = "CLIENT_WON";

    const stageConfig = PIPELINE_STAGES.find(s => s.value === stageKey);
    return {
      ...item,
      color: stageConfig?.color || "hsl(var(--primary))",
    };
  });

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Sales Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="stage" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
