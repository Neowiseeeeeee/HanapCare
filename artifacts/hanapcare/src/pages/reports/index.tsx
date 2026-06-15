import { useGetDashboardStats, useGetRevenueTrend, useGetAppointmentStats } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading-state";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  destructive: "hsl(var(--destructive))",
};

export default function Reports() {
  const { data: revenueTrend, isLoading: loadingRev } = useGetRevenueTrend();
  const { data: apptStats, isLoading: loadingAppt } = useGetAppointmentStats();

  const appointmentData = apptStats ? [
    { name: "Completed", value: apptStats.completed, fill: COLORS.secondary },
    { name: "Ongoing", value: apptStats.ongoing, fill: COLORS.accent },
    { name: "Checked In", value: apptStats.checkedIn, fill: COLORS.primary },
    { name: "Cancelled", value: apptStats.cancelled, fill: COLORS.destructive },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="pb-10">
      <PageHeader 
        title="Analytics & Reports" 
        description="Hospital performance and statistical insights."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Performance (YTD)</CardTitle>
            <CardDescription>Revenue vs Expenses trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRev ? <div className="h-[300px] animate-pulse bg-muted rounded-md" /> : (
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend || []} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.destructive} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.destructive} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: "hsl(var(--muted-foreground))"}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: "hsl(var(--muted-foreground))"}} tickFormatter={(val) => `₱${val/1000}k`} />
                    <Tooltip contentStyle={{backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px"}} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="expenses" stroke={COLORS.destructive} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Status Distribution</CardTitle>
            <CardDescription>Breakdown of today's appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAppt ? <div className="h-[300px] animate-pulse bg-muted rounded-md" /> : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {appointmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px"}} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Activity</CardTitle>
            <CardDescription>Patient volume by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md text-muted-foreground">
              More charts coming soon
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
