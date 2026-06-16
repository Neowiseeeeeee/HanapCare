import { useLocation, Link } from "wouter";
import { useSearch } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSupportUnread } from "@/hooks/useSupportUnread";
import { useTicketsUnread } from "@/hooks/useTicketsUnread";
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
  Users2, Bell, CreditCard, User, Inbox, UserPlus, CalendarDays, Banknote,
  Clock, CalendarOff, MessageSquare, HelpCircle, LogOut,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";
import type { Role } from "@/lib/auth";

const BADGE_CAP = 99;

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none tabular-nums">
      {count > BADGE_CAP ? `${BADGE_CAP}+` : count}
    </span>
  );
}

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: Role[];
  badge?: number;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export function AppSidebar() {
  const [location] = useLocation();
  const search = useSearch();
  const { user, logout } = useAuth();
  const { total: unreadTotal } = useSupportUnread();
  const { count: ticketsCount } = useTicketsUnread();

  const isActive = (url: string) => {
    const [path, qs] = url.split("?");
    if (!qs) return location === path || location.startsWith(path + "/");
    return location === path && search.includes(qs);
  };

  const navigation: NavGroup[] = [
    // ── OVERVIEW ─────────────────────────────
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "HR Manager"],
        },
        {
          title: "Chat Queue",
          url: "/dashboard",
          icon: Inbox,
          roles: ["Support"],
          badge: unreadTotal,
        },
        {
          title: "Notifications",
          url: "/notifications",
          icon: Bell,
          roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "Support", "HR Manager"],
        },
      ],
    },
    // ── MY PORTAL ─────────────────────────────
    {
      title: "My Portal",
      items: [
        { title: "Overview", url: "/dashboard", icon: LayoutDashboard, roles: ["Patient"] },
        { title: "My Appointments", url: "/dashboard?tab=appointments", icon: Calendar, roles: ["Patient"] },
        { title: "My Medical Records", url: "/dashboard?tab=records", icon: FileText, roles: ["Patient"] },
        { title: "My Prescriptions", url: "/dashboard?tab=prescriptions", icon: Pill, roles: ["Patient"] },
        { title: "My Lab Results", url: "/dashboard?tab=lab-results", icon: FlaskConical, roles: ["Patient"] },
        { title: "My Billing", url: "/dashboard?tab=billing", icon: CreditCard, roles: ["Patient"] },
        { title: "My Support", url: "/my-support", icon: HelpCircle, roles: ["Patient"] },
        { title: "My Profile", url: "/dashboard?tab=profile", icon: User, roles: ["Patient"] },
      ],
    },
    // ── PATIENT CARE ──────────────────────────
    {
      title: "Patient Care",
      items: [
        { title: "Patients", url: "/patients", icon: Users, roles: ["Admin"] },
        { title: "My Patients", url: "/patients", icon: Users, roles: ["Doctor"] },
        { title: "Assigned Patients", url: "/patients", icon: Users, roles: ["Nurse"] },
        { title: "Patient Registration", url: "/patients", icon: UserPlus, roles: ["Receptionist"] },
        { title: "Appointments", url: "/appointments", icon: Calendar, roles: ["Admin", "Receptionist"] },
        { title: "My Appointments", url: "/appointments", icon: Calendar, roles: ["Doctor"] },
        { title: "Consultations", url: "/consultations", icon: FileText, roles: ["Admin", "Doctor"] },
        { title: "Vital Signs", url: "/vital-signs", icon: HeartPulse, roles: ["Nurse"] },
        { title: "Nursing Notes", url: "/nursing-notes", icon: ClipboardList, roles: ["Nurse"] },
      ],
    },
    // ── CLINICAL ──────────────────────────────
    {
      title: "Clinical",
      items: [
        { title: "Doctors", url: "/doctors", icon: Stethoscope, roles: ["Admin"] },
        { title: "Vital Signs", url: "/vital-signs", icon: HeartPulse, roles: ["Admin", "Doctor"] },
        { title: "Laboratory Requests", url: "/lab-requests", icon: FlaskConical, roles: ["Doctor"] },
        { title: "Prescriptions", url: "/prescriptions", icon: Pill, roles: ["Doctor"] },
      ],
    },
    // ── SCHEDULING ────────────────────────────
    {
      title: "Scheduling",
      items: [
        { title: "Doctor Availability", url: "/doctor-availability", icon: Stethoscope, roles: ["Receptionist"] },
        { title: "Wards & Beds", url: "/wards", icon: Building2, roles: ["Receptionist"] },
      ],
    },
    // ── WARD MANAGEMENT ───────────────────────
    {
      title: "Ward Management",
      items: [
        { title: "Wards & Beds", url: "/wards", icon: Building2, roles: ["Admin", "Nurse"] },
        { title: "Bed Assignments", url: "/beds", icon: Building2, roles: ["Nurse"] },
      ],
    },
    // ── MEDICATION ────────────────────────────
    {
      title: "Medication",
      items: [
        { title: "Medication Administration", url: "/medication-admin", icon: Pill, roles: ["Nurse"] },
      ],
    },
    // ── PHARMACY ──────────────────────────────
    {
      title: "Pharmacy",
      items: [
        { title: "Prescriptions", url: "/prescriptions", icon: ClipboardList, roles: ["Admin", "Pharmacist"] },
        { title: "Medicines", url: "/medicines", icon: Pill, roles: ["Admin", "Pharmacist"] },
        { title: "Dispensing", url: "/dispensing", icon: Receipt, roles: ["Admin", "Pharmacist"] },
      ],
    },
    // ── LABORATORY ────────────────────────────
    {
      title: "Laboratory",
      items: [
        { title: "Lab Requests", url: "/lab-requests", icon: FlaskConical, roles: ["Admin", "Lab Staff"] },
        { title: "Test Processing", url: "/lab-requests?tab=processing", icon: FlaskConical, roles: ["Lab Staff"] },
        { title: "Results Management", url: "/lab-requests?tab=results", icon: FileText, roles: ["Lab Staff"] },
      ],
    },
    // ── FINANCE ───────────────────────────────
    {
      title: "Finance",
      items: [
        { title: "Billing", url: "/billing", icon: Receipt, roles: ["Admin", "Cashier"] },
        { title: "Payments", url: "/payments", icon: CreditCard, roles: ["Admin", "Cashier"] },
      ],
    },
    // ── SUPPORT TOOLS ─────────────────────────
    {
      title: "Support Tools",
      items: [
        { title: "Tickets", url: "/support/tickets", icon: MessageSquare, roles: ["Support"], badge: ticketsCount },
        { title: "Patient Inquiries", url: "/support/inquiries", icon: HelpCircle, roles: ["Support"] },
      ],
    },
    // ── ADMINISTRATION ────────────────────────
    {
      title: "Administration",
      items: [
        { title: "Staff", url: "/staff", icon: Users2, roles: ["Admin"] },
        { title: "Departments", url: "/departments", icon: Building2, roles: ["Admin"] },
        { title: "Audit Logs", url: "/audit-logs", icon: ClipboardList, roles: ["Admin"] },
      ],
    },
    // ── HR MANAGEMENT ─────────────────────────
    {
      title: "HR Management",
      items: [
        { title: "Staff Directory", url: "/staff", icon: Users2, roles: ["HR Manager"] },
        { title: "Attendance", url: "/workforce/attendance", icon: Clock, roles: ["HR Manager"] },
        { title: "Leave Requests", url: "/workforce/leave", icon: CalendarOff, roles: ["HR Manager"] },
        { title: "Payroll", url: "/workforce/payroll", icon: Banknote, roles: ["HR Manager"] },
      ],
    },
    // ── REPORTS ───────────────────────────────
    {
      title: "Reports",
      items: [
        { title: "Reports", url: "/reports", icon: Activity, roles: ["Admin"] },
        { title: "Clinical Reports", url: "/reports", icon: Activity, roles: ["Doctor"] },
        { title: "Pharmacy Reports", url: "/reports", icon: Activity, roles: ["Pharmacist"] },
        { title: "Laboratory Reports", url: "/reports", icon: Activity, roles: ["Lab Staff"] },
        { title: "Financial Reports", url: "/reports", icon: Activity, roles: ["Cashier"] },
      ],
    },
    // ── WORKFORCE ─────────────────────────────
    {
      title: "Workforce",
      items: [
        {
          title: "My Schedule",
          url: "/workforce/schedule",
          icon: CalendarDays,
          roles: ["Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "HR Manager"],
        },
        {
          title: "My Compensation",
          url: "/workforce/compensation",
          icon: Banknote,
          roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "Support", "HR Manager"],
        },
        {
          title: "Attendance",
          url: "/workforce/attendance",
          icon: Clock,
          roles: ["Admin", "Cashier"],
        },
      ],
    },
    // ── ACCOUNT ───────────────────────────────
    {
      title: "Account",
      items: [
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
          roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "Patient", "Support", "HR Manager"],
        },
      ],
    },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center justify-start border-b px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <HanapCareLogoIcon size={52} />
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
                    const badge = item.badge ?? 0;
                    return (
                      <SidebarMenuItem key={`${item.title}-${item.url}`}>
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
          <div className="flex items-center gap-2 px-1 py-1">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="text-sm font-semibold">{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate leading-none">{user.fullName}</p>
              <p className="text-xs text-sidebar-foreground/50 mt-0.5 truncate">{user.role}</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sidebar-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Log out</TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
