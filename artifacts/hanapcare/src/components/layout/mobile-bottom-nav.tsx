import { Link, useLocation } from "wouter";
import { useSearch } from "wouter";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/auth";
import {
  LayoutDashboard, Users, Calendar, FlaskConical, Pill, Receipt,
  Building2, FileText, CreditCard, HeartPulse, Inbox,
  MessageSquare, HelpCircle, Users2, Banknote, CalendarOff, ClipboardList,
} from "lucide-react";

type BottomNavItem = {
  label: string;
  url: string;
  icon: React.ElementType;
  roles: Role[];
};

const BOTTOM_NAV: BottomNavItem[] = [
  { label: "Dashboard", url: "/dashboard",        icon: LayoutDashboard, roles: ["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "HR Manager"] },
  { label: "Queue",     url: "/dashboard",         icon: Inbox,           roles: ["Support"] },
  { label: "Patients",  url: "/patients",          icon: Users,           roles: ["Admin", "Doctor", "Nurse", "Receptionist"] },
  { label: "Appts",     url: "/appointments",      icon: Calendar,        roles: ["Admin", "Doctor", "Receptionist"] },
  { label: "Consults",  url: "/consultations",     icon: FileText,        roles: ["Doctor"] },
  { label: "Vitals",    url: "/vital-signs",       icon: HeartPulse,      roles: ["Nurse"] },
  { label: "Wards",     url: "/wards",             icon: Building2,       roles: ["Nurse"] },
  { label: "Prescripts",url: "/prescriptions",    icon: Pill,            roles: ["Pharmacist"] },
  { label: "Medicines", url: "/medicines",         icon: Pill,            roles: ["Pharmacist"] },
  { label: "Lab",       url: "/lab-requests",     icon: FlaskConical,    roles: ["Lab Staff"] },
  { label: "Billing",   url: "/billing",           icon: Receipt,         roles: ["Admin", "Cashier"] },
  { label: "Staff",     url: "/staff",             icon: Users2,          roles: ["Admin", "HR Manager"] },
  { label: "Leave",     url: "/workforce/leave",   icon: CalendarOff,     roles: ["HR Manager"] },
  { label: "Payroll",   url: "/workforce/payroll", icon: Banknote,        roles: ["HR Manager"] },
  { label: "Tickets",   url: "/support/tickets",   icon: MessageSquare,   roles: ["Support"] },
  { label: "Inquiries", url: "/support/inquiries", icon: HelpCircle,      roles: ["Support"] },
  { label: "Overview",  url: "/dashboard",                    icon: LayoutDashboard, roles: ["Patient"] },
  { label: "Appts",     url: "/dashboard?tab=appointments",   icon: Calendar,        roles: ["Patient"] },
  { label: "Prescripts",url: "/dashboard?tab=prescriptions", icon: Pill,            roles: ["Patient"] },
  { label: "Billing",   url: "/dashboard?tab=billing",        icon: CreditCard,      roles: ["Patient"] },
  { label: "Records",   url: "/dashboard?tab=records",        icon: ClipboardList,   roles: ["Patient"] },
];

export function MobileBottomNav() {
  const { user } = useAuth();
  const [location] = useLocation();
  const search = useSearch();

  if (!user) return null;

  const items = BOTTOM_NAV.filter((item) => item.roles.includes(user.role)).slice(0, 5);
  if (items.length === 0) return null;

  const isActive = (url: string) => {
    const [path, qs] = url.split("?");
    if (!qs) return location === path || location.startsWith(path + "/");
    return location === path && search.includes(qs);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="bg-sidebar border-t border-sidebar-border flex items-stretch safe-area-inset-bottom">
        {items.map((item) => {
          const active = isActive(item.url);
          return (
            <Link
              key={`${item.label}-${item.url}`}
              href={item.url}
              className={`
                relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-w-0
                transition-colors duration-150
                ${active
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
                }
              `}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-sidebar-primary rounded-full" aria-hidden="true" />
              )}
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className={`text-[9px] leading-none truncate w-full text-center ${active ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
