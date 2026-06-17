import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen bg-background overflow-hidden">
        <header className="h-16 flex items-center border-b px-4 bg-card shrink-0 gap-2">
          <SidebarTrigger />
        </header>
        <div className="flex-1 overflow-auto p-3 sm:p-6 relative">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
