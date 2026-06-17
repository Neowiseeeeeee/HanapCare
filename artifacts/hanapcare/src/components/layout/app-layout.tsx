import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { useAuth } from "@/lib/auth";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";
import { Link } from "wouter";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen bg-background overflow-hidden">
        <header className="h-14 sm:h-16 flex items-center border-b px-3 sm:px-4 bg-card shrink-0 gap-2">
          <SidebarTrigger className="flex-shrink-0" />
          {/* Brand mark — visible on mobile only when sidebar is closed */}
          <Link href="/dashboard" className="flex md:hidden items-center gap-2 ml-1">
            <HanapCareLogoIcon size={28} />
            <span className="font-bold text-sm text-foreground">
              Hanap<span className="text-sky-500">Care</span>
            </span>
          </Link>
          {/* Right side: user name on mobile */}
          {user && (
            <span className="ml-auto flex md:hidden text-xs font-medium text-muted-foreground truncate max-w-[120px]">
              {user.fullName.split(" ")[0]}
            </span>
          )}
        </header>
        <div className="flex-1 overflow-auto p-3 sm:p-6 pb-20 md:pb-6 relative">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
