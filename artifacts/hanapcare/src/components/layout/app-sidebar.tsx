import { useLocation, Link } from "wouter";
import { useSearch } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSupportUnread } from "@/hooks/useSupportUnread";
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard, Users, Calendar, Activity, FlaskConical, Pill, Receipt,
  Building2, FileText, ClipboardList, Settings, HeartPulse, Stethoscope,
  Users2, Bell, CreditCard, User, Inbox,
} from "lucide-react";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";

const BADGE_CAP = 99;

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none tabular-nums">
      {count > BADGE_CAP ? `${BADGE_CAP}+` : count}
    </span>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const search = useSearch();
  const { user } = useAuth();
  const { total: unreadTotal } = useSupportUnread();

  const isActive = (url: string) => {
    const [path, qs] = url.split("?");
    if (!qs) return location === path || location.startsWith(path + "/");
    return location === path && search.includes(qs);
  };

  const navigation = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier"],
        },
        {
          title: "Notifications",
          url: "/notifications",
          icon: Bell,
          roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier"],
        },
      ],
    },
    {
      title: "My Portal",
      items: [
        { title: "Overview", url: "/dashboard", icon: LayoutDashboard, roles: ["Patient"] },
        { title: "My Appointments", url: "/dashboard?tab=appointments", icon: Calendar, roles: ["Patient"] },
        { title: "My Records", url: "/dashboard?tab=records", icon: FileText, roles: ["Patient"] },
        { title: "Billing", url: "/dashboard?tab=billing", icon: CreditCard, roles: ["Patient"] },
        { title: "My Profile", url: "/dashboard?tab=profile", icon: User, roles: ["Patient"] },
      ],
    },
    {
      title: "Support",
      items: [
        { title: "Chat Queue", url: "/dashboard", icon: Inbox, roles: ["Support"], badge: unreadTotal },
        { title: "Notifications", url: "/notifications", icon: Bell, roles: ["Support"] },
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
        { title: "Dispensing", url: "/dispensing", icon: Pill, roles: ["Admin", "Pharmacist"] },
      ],
    },
    {
      title: "Facility & Finance",
      items: [
        { title: "Wards & Beds", url: "/wards", icon: Building2, roles: ["Admin", "Nurse", "Receptionist"] },
        { title: "Billing", url: "/billing", icon: Receipt, roles: ["Admin", "Cashier"] },
        { title: "Payments", url: "/payments", icon: CreditCard, roles: ["Admin", "Cashier"] },
      ],
    },
    {
      title: "System",
      items: [
        { title: "Staff", url: "/staff", icon: Users2, roles: ["Admin"] },
        { title: "Departments", url: "/departments", icon: Building2, roles: ["Admin"] },
        { title: "Reports", url: "/reports", icon: Activity, roles: ["Admin", "Doctor"] },
        { title: "Audit Logs", url: "/audit-logs", icon: ClipboardList, roles: ["Admin"] },
      ],
    },
    {
      title: "Account",
      items: [
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
          roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "Patient", "Support"],
        },
      ],
    },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center justify-start border-b px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <HanapCareLogoIcon size={30} />
          <span className="font-bold text-lg text-sidebar-foreground">
            Hanap<span className="text-sky-400">Care</span>
          </span>
        </Link>
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
                  {visibleItems.map((item) => {
                    const badge = (item as { badge?: number }).badge ?? 0;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={item.title}
                        >
                          <Link href={item.url} className="flex items-center gap-2">
                            <item.icon />
                            <span className="flex-1">{item.title}</span>
                            <UnreadBadge count={badge} />
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        {user && (
          <div className="flex items-center gap-3 px-1 py-1">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="text-sm font-semibold">{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate leading-none">{user.fullName}</p>
              <p className="text-xs text-sidebar-foreground/50 mt-0.5 truncate">{user.role}</p>
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
