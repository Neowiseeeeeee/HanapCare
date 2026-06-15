import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, Calendar, Activity, FlaskConical, Pill, Receipt, Building2, UserCircle, FileText, ClipboardList, Settings, HeartPulse, Stethoscope, Users2, Bell } from "lucide-react";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "Patient"] },
        { title: "Notifications", url: "/notifications", icon: Bell, roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "Patient"] },
      ],
    },
    {
      title: "Patient Management",
      items: [
        { title: "Patients", url: "/patients", icon: Users, roles: ["Admin", "Doctor", "Nurse", "Receptionist"] },
        { title: "Appointments", url: "/appointments", icon: Calendar, roles: ["Admin", "Doctor", "Receptionist"] },
      ],
    },
    {
      title: "Clinical",
      items: [
        { title: "Doctors", url: "/doctors", icon: Stethoscope, roles: ["Admin", "Receptionist"] },
        { title: "Consultations", url: "/consultations", icon: FileText, roles: ["Admin", "Doctor"] },
        { title: "Vital Signs", url: "/vital-signs", icon: HeartPulse, roles: ["Admin", "Doctor", "Nurse"] },
      ],
    },
    {
      title: "Services",
      items: [
        { title: "Laboratory", url: "/lab-requests", icon: FlaskConical, roles: ["Admin", "Doctor", "Lab Staff"] },
        { title: "Pharmacy", url: "/medicines", icon: Pill, roles: ["Admin", "Doctor", "Pharmacist"] },
      ],
    },
    {
      title: "Facility & Finance",
      items: [
        { title: "Wards & Beds", url: "/wards", icon: Building2, roles: ["Admin", "Nurse", "Receptionist"] },
        { title: "Billing", url: "/billing", icon: Receipt, roles: ["Admin", "Cashier"] },
      ],
    },
    {
      title: "System",
      items: [
        { title: "Staff", url: "/staff", icon: Users2, roles: ["Admin"] },
        { title: "Departments", url: "/departments", icon: Building2, roles: ["Admin"] },
        { title: "Reports", url: "/reports", icon: Activity, roles: ["Admin", "Doctor"] },
        { title: "Audit Logs", url: "/audit-logs", icon: ClipboardList, roles: ["Admin"] },
        { title: "Settings", url: "/settings", icon: Settings, roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "Patient"] },
      ],
    },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <div className="flex items-center gap-2 font-bold text-primary text-xl">
          <Activity className="h-6 w-6" />
          <span>HanapCare</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => {
          const visibleItems = group.items.filter((item) => !user || item.roles.includes(user.role));
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url || location.startsWith(item.url + "/")}
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-semibold truncate max-w-[120px]">{user.fullName}</span>
                <span className="text-xs text-muted-foreground">{user.role}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
