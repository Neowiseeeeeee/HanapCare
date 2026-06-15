import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, isPatient, isAdmin, isSupport } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { AppLayout } from "@/components/layout/app-layout";
import { PublicLayout } from "@/components/public/PublicLayout";
import { SetupScreen } from "@/components/SetupScreen";
import PatientChatWidget from "@/components/PatientChatWidget";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import PatientDashboard from "@/pages/patient/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import SupportDashboard from "@/pages/support/Dashboard";
import ProfileSetup from "@/pages/public/ProfileSetup";
import Patients from "@/pages/patients/index";
import NewPatient from "@/pages/patients/new";
import PatientDetails from "@/pages/patients/[id]";
import Appointments from "@/pages/appointments/index";
import NewAppointment from "@/pages/appointments/new";
import AppointmentCalendar from "@/pages/appointments/calendar";
import AppointmentDetails from "@/pages/appointments/[id]";
import Wards from "@/pages/wards/index";
import Beds from "@/pages/beds/index";
import Settings from "@/pages/settings";
import Doctors from "@/pages/doctors/index";
import NewDoctor from "@/pages/doctors/new";
import DoctorProfile from "@/pages/doctors/[id]";
import Medicines from "@/pages/medicines/index";
import NewMedicine from "@/pages/medicines/new";
import Dispensing from "@/pages/dispensing/index";
import Staff from "@/pages/staff/index";
import Departments from "@/pages/departments/index";
import Consultations from "@/pages/consultations/index";
import NewConsultation from "@/pages/consultations/new";
import ConsultationDetails from "@/pages/consultations/[id]";
import VitalSigns from "@/pages/vital-signs/index";
import LabRequests from "@/pages/lab-requests/index";
import NewLabRequest from "@/pages/lab-requests/new";
import LabRequestDetails from "@/pages/lab-requests/[id]";
import Billing from "@/pages/billing/index";
import NewBilling from "@/pages/billing/new";
import BillingDetails from "@/pages/billing/[id]";
import Payments from "@/pages/payments/index";
import Reports from "@/pages/reports/index";
import AuditLogs from "@/pages/audit-logs/index";
import Notifications from "@/pages/notifications/index";

import Landing from "@/pages/public/Landing";
import About from "@/pages/public/About";
import Services from "@/pages/public/Services";
import Blog from "@/pages/public/Blog";
import BlogPost from "@/pages/public/BlogPost";
import Contact from "@/pages/public/Contact";
import Terms from "@/pages/public/Terms";
import Privacy from "@/pages/public/Privacy";
import Signup from "@/pages/public/Signup";
import ForgotPassword from "@/pages/public/ForgotPassword";
import ResetPassword from "@/pages/public/ResetPassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function DashboardRouter() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  if (isPatient(user.role)) {
    return (
      <AppLayout>
        <PatientDashboard />
      </AppLayout>
    );
  }

  if (isAdmin(user.role)) {
    return (
      <AppLayout>
        <AdminDashboard />
      </AppLayout>
    );
  }

  if (isSupport(user.role)) {
    return (
      <AppLayout>
        <SupportDashboard />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}

function ProfileRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
  }, [user, isLoading]);

  if (isLoading) return null;
  if (!user) return null;
  return <Component />;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { setLocation("/login"); return; }
    if (isPatient(user.role)) setLocation("/dashboard");
  }, [user, isLoading]);

  if (isLoading || !user || isPatient(user.role)) return null;

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function AuthenticatedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) setLocation("/login");
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <PublicLayout>
      <Component />
    </PublicLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* ── Public marketing pages ── */}
      <Route path="/">{() => <PublicRoute component={Landing} />}</Route>
      <Route path="/about">{() => <PublicRoute component={About} />}</Route>
      <Route path="/services">{() => <PublicRoute component={Services} />}</Route>
      <Route path="/blog">{() => <PublicRoute component={Blog} />}</Route>
      <Route path="/blog/:slug">{() => <PublicRoute component={BlogPost} />}</Route>
      <Route path="/contact">{() => <PublicRoute component={Contact} />}</Route>
      <Route path="/terms">{() => <PublicRoute component={Terms} />}</Route>
      <Route path="/privacy">{() => <PublicRoute component={Privacy} />}</Route>

      {/* ── Auth pages ── */}
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/profile-setup">{() => <ProfileRoute component={ProfileSetup} />}</Route>

      {/* ── Dashboard: role-aware ── */}
      <Route path="/dashboard">{() => <DashboardRouter />}</Route>

      {/* ── Settings: all authenticated users (patients included) ── */}
      <Route path="/settings">{() => <AuthenticatedRoute component={Settings} />}</Route>

      {/* ── Protected HMS pages (workers & admins only) ── */}
      <Route path="/patients">{() => <ProtectedRoute component={Patients} />}</Route>
      <Route path="/patients/new">{() => <ProtectedRoute component={NewPatient} />}</Route>
      <Route path="/patients/:id">{() => <ProtectedRoute component={PatientDetails} />}</Route>

      <Route path="/appointments">{() => <ProtectedRoute component={Appointments} />}</Route>
      <Route path="/appointments/new">{() => <ProtectedRoute component={NewAppointment} />}</Route>
      <Route path="/appointments/calendar">{() => <ProtectedRoute component={AppointmentCalendar} />}</Route>
      <Route path="/appointments/:id">{() => <ProtectedRoute component={AppointmentDetails} />}</Route>

      <Route path="/wards">{() => <ProtectedRoute component={Wards} />}</Route>
      <Route path="/beds">{() => <ProtectedRoute component={Beds} />}</Route>

      <Route path="/doctors">{() => <ProtectedRoute component={Doctors} />}</Route>
      <Route path="/doctors/new">{() => <ProtectedRoute component={NewDoctor} />}</Route>
      <Route path="/doctors/:id">{() => <ProtectedRoute component={DoctorProfile} />}</Route>

      <Route path="/medicines">{() => <ProtectedRoute component={Medicines} />}</Route>
      <Route path="/medicines/new">{() => <ProtectedRoute component={NewMedicine} />}</Route>
      <Route path="/dispensing">{() => <ProtectedRoute component={Dispensing} />}</Route>

      <Route path="/staff">{() => <ProtectedRoute component={Staff} />}</Route>
      <Route path="/departments">{() => <ProtectedRoute component={Departments} />}</Route>

      <Route path="/consultations">{() => <ProtectedRoute component={Consultations} />}</Route>
      <Route path="/consultations/new">{() => <ProtectedRoute component={NewConsultation} />}</Route>
      <Route path="/consultations/:id">{() => <ProtectedRoute component={ConsultationDetails} />}</Route>

      <Route path="/vital-signs">{() => <ProtectedRoute component={VitalSigns} />}</Route>

      <Route path="/lab-requests">{() => <ProtectedRoute component={LabRequests} />}</Route>
      <Route path="/lab-requests/new">{() => <ProtectedRoute component={NewLabRequest} />}</Route>
      <Route path="/lab-requests/:id">{() => <ProtectedRoute component={LabRequestDetails} />}</Route>

      <Route path="/billing">{() => <ProtectedRoute component={Billing} />}</Route>
      <Route path="/billing/new">{() => <ProtectedRoute component={NewBilling} />}</Route>
      <Route path="/billing/:id">{() => <ProtectedRoute component={BillingDetails} />}</Route>
      <Route path="/payments">{() => <ProtectedRoute component={Payments} />}</Route>

      <Route path="/reports">{() => <ProtectedRoute component={Reports} />}</Route>
      <Route path="/audit-logs">{() => <ProtectedRoute component={AuditLogs} />}</Route>
      <Route path="/notifications">{() => <AuthenticatedRoute component={Notifications} />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SetupScreen>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AuthProvider>
                <Router />
                <PatientChatWidget />
                <Toaster />
              </AuthProvider>
            </WouterRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </SetupScreen>
    </ThemeProvider>
  );
}

export default App;
