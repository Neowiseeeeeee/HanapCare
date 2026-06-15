import { useMemo } from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Users, Stethoscope, Bed, CalendarCheck, Receipt, AlertTriangle, 
  Activity, ArrowUpRight, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { 
  useGetDashboardStats, useGetRevenueTrend, useGetAppointmentStats, 
  useGetBedOccupancy, useGetRecentActivity, useGetTopDiagnoses, useGetInventoryAlerts 
} from "@workspace/api-client-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { LoadingMetric, LoadingCard } from "@/components/ui/loading-state";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { format } from "date-fns";

const COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  muted: "hsl(var(--muted-foreground))",
  destructive: "hsl(var(--destructive))",
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  chart5: "hsl(var(--chart-5))",
};

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useGetDashboardStats();
  const { data: revenueTrend, isLoading: loadingRevenue } = useGetRevenueTrend();
  const { data: apptStats, isLoading: loadingApptStats } = useGetAppointmentStats();
  const { data: bedOccupancy, isLoading: loadingBeds } = useGetBedOccupancy();
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity();
  const { data: topDiagnoses, isLoading: loadingDiagnoses } = useGetTopDiagnoses();
  const { data: inventoryAlerts, isLoading: loadingAlerts } = useGetInventoryAlerts();

  const appointmentData = useMemo(() => {
    if (!apptStats) return [];
    return [
      { name: "Completed", value: apptStats.completed, color: COLORS.secondary },
      { name: "Ongoing", value: apptStats.ongoing, color: COLORS.accent },
      { name: "Checked In", value: apptStats.checkedIn, color: COLORS.primary },
      { name: "Confirmed", value: apptStats.confirmed, color: COLORS.chart4 },
      { name: "Pending", value: apptStats.pending, color: COLORS.chart5 },
      { name: "Cancelled", value: apptStats.cancelled, color: COLORS.destructive },
    ].filter(d => d.value > 0);
  }, [apptStats]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="pb-10">
      <PageHeader 
        title="Dashboard" 
        description="Overview of hospital operations, patient flow, and critical alerts." 
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/appointments/new">New Appointment</Link>
            </Button>
            <Button asChild>
              <Link href="/patients/new">Register Patient</Link>
            </Button>
          </div>
        }
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6"
      >
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingStats || !stats ? (
            Array.from({ length: 4 }).map((_, i) => <LoadingMetric key={i} />)
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-emerald-500 flex items-center inline-flex">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> +2.4%
                      </span> from last month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.appointmentsToday}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {apptStats?.pending || 0} pending confirmation
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
                    <Bed className="h-4 w-4 text-secondary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.availableBeds} / {stats.availableBeds + stats.occupiedBeds}</div>
                    <div className="mt-2">
                      <Progress 
                        value={(stats.occupiedBeds / (stats.availableBeds + stats.occupiedBeds)) * 100} 
                        className="h-1.5"
                        indicatorClassName={stats.availableBeds < 10 ? "bg-destructive" : "bg-secondary"}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
                    <Receipt className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.pendingBills}</div>
                    <p className="text-xs text-muted-foreground mt-1 text-orange-600/80">
                      Requires collection
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            {loadingRevenue ? <LoadingCard /> : (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue vs expenses (PHP)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTrend || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.destructive} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={COLORS.destructive} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: COLORS.muted, fontSize: 12 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: COLORS.muted, fontSize: 12 }}
                          tickFormatter={(value) => `₱${(value / 1000)}k`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          formatter={(value: number) => [`₱${value.toLocaleString()}`, undefined]}
                        />
                        <Legend iconType="circle" />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area type="monotone" dataKey="expenses" name="Expenses" stroke={COLORS.destructive} strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            {loadingApptStats ? <LoadingCard /> : (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Appointments Today</CardTitle>
                  <CardDescription>Status breakdown</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="h-[220px] w-full">
                    {appointmentData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={appointmentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {appointmentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No appointments today
                      </div>
                    )}
                  </div>
                  <div className="w-full mt-4 grid grid-cols-2 gap-2">
                    {appointmentData.map((entry, i) => (
                      <div key={i} className="flex items-center text-xs">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                        <span className="flex-1 text-muted-foreground">{entry.name}</span>
                        <span className="font-medium">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Triple Row: Wards, Alerts, Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bed Occupancy</CardTitle>
                    <CardDescription>Capacity by ward</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                    <Link href="/wards">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingBeds ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-12" /></div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))
                ) : (
                  bedOccupancy?.map((ward, i) => {
                    const percent = (ward.occupied / ward.totalBeds) * 100;
                    const isHigh = percent >= 90;
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{ward.wardName}</span>
                          <span className="text-muted-foreground">
                            {ward.occupied}/{ward.totalBeds} 
                            <span className="text-xs ml-1">({Math.round(percent)}%)</span>
                          </span>
                        </div>
                        <Progress 
                          value={percent} 
                          className="h-2" 
                          indicatorClassName={isHigh ? "bg-destructive" : "bg-primary"}
                        />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full border-destructive/20 shadow-sm shadow-destructive/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <CardTitle>Action Required</CardTitle>
                  </div>
                </div>
                <CardDescription>Inventory & lab alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingAlerts ? (
                  Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)
                ) : inventoryAlerts?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2 opacity-50" />
                    <p className="text-sm">All systems nominal</p>
                  </div>
                ) : (
                  inventoryAlerts?.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                      <div className="mt-0.5">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-none">{alert.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.type === 'Low Stock' && `Only ${alert.quantity} remaining in stock`}
                          {alert.type === 'Expiring' && `Expires on ${format(new Date(alert.expiryDate!), 'MMM d, yyyy')}`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system logs</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingActivity ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex gap-3"><Skeleton className="h-8 w-8 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-3 w-full" /><Skeleton className="h-2 w-1/2" /></div></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {activity?.map((log, i) => (
                      <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <Activity className="h-3.5 w-3.5" />
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border bg-card shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-xs text-foreground">{log.action}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(log.timestamp), 'HH:mm')}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{log.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
