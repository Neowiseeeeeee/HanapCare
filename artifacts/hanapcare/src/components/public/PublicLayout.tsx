import { PublicNavbar } from "./PublicNavbar";
import { PublicFooter } from "./PublicFooter";
import { ChatWidget } from "./ChatWidget";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <ChatWidget />
    </div>
  );
}
