import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, isPatient, isAdmin, isSupport, isHRManager, type Role } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { AppLayout } from "@/components/layout/app-layout";
import { PublicLayout } from "@/components/public/PublicLayout";
import { SetupScreen } from "@/components/SetupScreen";
import PatientChatWidget from "@/components/PatientChatWidget";

import NotFound from "@/pages/not-found";
import NotAuthorized from "@/pages/not-authorized";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import PatientDashboard from "@/pages/patient/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import SupportDashboard from "@/pages/support/Dashboard";
import HRDashboard from "@/pages/hr/Dashboard";
import HROnboard from "@/pages/hr/Onboard";
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
import StaffProfile from "@/pages/staff/[id]";
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

import Prescriptions from "@/pages/prescriptions/index";
import NursingNotes from "@/pages/nursing-notes/index";
import MedicationAdmin from "@/pages/medication-admin/index";
import DoctorAvailability from "@/pages/doctor-availability/index";
import MySchedule from "@/pages/workforce/schedule";
import MyCompensation from "@/pages/workforce/compensation";
import Attendance from "@/pages/workforce/attendance";
import LeaveRequests from "@/pages/workforce/leave";
import Payroll from "@/pages/workforce/payroll";
import SupportTickets from "@/pages/support/tickets";
import Inquiries from "@/pages/support/inquiries";
import MySupport from "@/pages/patient/MySupport";

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

  if (isHRManager(user.role)) {
    return (
      <AppLayout>
        <HRDashboard />
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

function RoleProtectedRoute({ component: Component, roles }: { component: React.ComponentType; roles: Role[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { setLocation("/login"); return; }
    if (isPatient(user.role)) { setLocation("/dashboard"); return; }
  }, [user, isLoading]);

  if (isLoading || !user || isPatient(user.role)) return null;

  if (!roles.includes(user.role)) {
    return (
      <AppLayout>
        <NotAuthorized />
      </AppLayout>
    );
  }

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

      {/* ── Settings & Notifications: all authenticated users ── */}
      <Route path="/settings">{() => <AuthenticatedRoute component={Settings} />}</Route>
      <Route path="/notifications">{() => <RoleProtectedRoute component={Notifications} roles={["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "Support", "HR Manager"]} />}</Route>

      {/* ── Patient Management ── */}
      <Route path="/patients">{() => <RoleProtectedRoute component={Patients} roles={["Admin", "Doctor", "Nurse", "Receptionist"]} />}</Route>
      <Route path="/patients/new">{() => <RoleProtectedRoute component={NewPatient} roles={["Admin", "Doctor", "Nurse", "Receptionist"]} />}</Route>
      <Route path="/patients/:id">{() => <RoleProtectedRoute component={PatientDetails} roles={["Admin", "Doctor", "Nurse", "Receptionist"]} />}</Route>

      {/* ── Appointments ── */}
      <Route path="/appointments">{() => <RoleProtectedRoute component={Appointments} roles={["Admin", "Doctor", "Receptionist"]} />}</Route>
      <Route path="/appointments/new">{() => <RoleProtectedRoute component={NewAppointment} roles={["Admin", "Doctor", "Receptionist"]} />}</Route>
      <Route path="/appointments/calendar">{() => <RoleProtectedRoute component={AppointmentCalendar} roles={["Admin", "Doctor", "Receptionist"]} />}</Route>
      <Route path="/appointments/:id">{() => <RoleProtectedRoute component={AppointmentDetails} roles={["Admin", "Doctor", "Receptionist"]} />}</Route>

      {/* ── Consultations ── */}
      <Route path="/consultations">{() => <RoleProtectedRoute component={Consultations} roles={["Admin", "Doctor"]} />}</Route>
      <Route path="/consultations/new">{() => <RoleProtectedRoute component={NewConsultation} roles={["Admin", "Doctor"]} />}</Route>
      <Route path="/consultations/:id">{() => <RoleProtectedRoute component={ConsultationDetails} roles={["Admin", "Doctor"]} />}</Route>

      {/* ── Clinical ── */}
      <Route path="/vital-signs">{() => <RoleProtectedRoute component={VitalSigns} roles={["Admin", "Doctor", "Nurse"]} />}</Route>
      <Route path="/doctors">{() => <RoleProtectedRoute component={Doctors} roles={["Admin", "Receptionist"]} />}</Route>
      <Route path="/doctors/new">{() => <RoleProtectedRoute component={NewDoctor} roles={["Admin"]} />}</Route>
      <Route path="/doctors/:id">{() => <RoleProtectedRoute component={DoctorProfile} roles={["Admin", "Receptionist"]} />}</Route>

      {/* ── Prescriptions ── */}
      <Route path="/prescriptions">{() => <RoleProtectedRoute component={Prescriptions} roles={["Admin", "Doctor", "Pharmacist"]} />}</Route>

      {/* ── Nursing ── */}
      <Route path="/nursing-notes">{() => <RoleProtectedRoute component={NursingNotes} roles={["Admin", "Nurse"]} />}</Route>
      <Route path="/medication-admin">{() => <RoleProtectedRoute component={MedicationAdmin} roles={["Admin", "Nurse"]} />}</Route>

      {/* ── Receptionist Scheduling ── */}
      <Route path="/doctor-availability">{() => <RoleProtectedRoute component={DoctorAvailability} roles={["Admin", "Receptionist"]} />}</Route>

      {/* ── Wards & Beds ── */}
      <Route path="/wards">{() => <RoleProtectedRoute component={Wards} roles={["Admin", "Nurse", "Receptionist"]} />}</Route>
      <Route path="/beds">{() => <RoleProtectedRoute component={Beds} roles={["Admin", "Nurse", "Receptionist"]} />}</Route>

      {/* ── Pharmacy ── */}
      <Route path="/medicines">{() => <RoleProtectedRoute component={Medicines} roles={["Admin", "Pharmacist"]} />}</Route>
      <Route path="/medicines/new">{() => <RoleProtectedRoute component={NewMedicine} roles={["Admin", "Pharmacist"]} />}</Route>
      <Route path="/dispensing">{() => <RoleProtectedRoute component={Dispensing} roles={["Admin", "Pharmacist"]} />}</Route>

      {/* ── Laboratory ── */}
      <Route path="/lab-requests">{() => <RoleProtectedRoute component={LabRequests} roles={["Admin", "Doctor", "Lab Staff"]} />}</Route>
      <Route path="/lab-requests/new">{() => <RoleProtectedRoute component={NewLabRequest} roles={["Admin", "Doctor", "Lab Staff"]} />}</Route>
      <Route path="/lab-requests/:id">{() => <RoleProtectedRoute component={LabRequestDetails} roles={["Admin", "Doctor", "Lab Staff"]} />}</Route>

      {/* ── Finance ── */}
      <Route path="/billing">{() => <RoleProtectedRoute component={Billing} roles={["Admin", "Cashier"]} />}</Route>
      <Route path="/billing/new">{() => <RoleProtectedRoute component={NewBilling} roles={["Admin", "Cashier"]} />}</Route>
      <Route path="/billing/:id">{() => <RoleProtectedRoute component={BillingDetails} roles={["Admin", "Cashier"]} />}</Route>
      <Route path="/payments">{() => <RoleProtectedRoute component={Payments} roles={["Admin", "Cashier"]} />}</Route>

      {/* ── Administration ── */}
      <Route path="/staff">{() => <RoleProtectedRoute component={Staff} roles={["Admin", "HR Manager"]} />}</Route>
      <Route path="/staff/:id">{() => <RoleProtectedRoute component={StaffProfile} roles={["Admin", "HR Manager"]} />}</Route>
      <Route path="/departments">{() => <RoleProtectedRoute component={Departments} roles={["Admin"]} />}</Route>
      <Route path="/reports">{() => <RoleProtectedRoute component={Reports} roles={["Admin", "Doctor", "Pharmacist", "Lab Staff", "Cashier"]} />}</Route>
      <Route path="/audit-logs">{() => <RoleProtectedRoute component={AuditLogs} roles={["Admin"]} />}</Route>

      {/* ── Support Tools ── */}
      <Route path="/support/tickets">{() => <RoleProtectedRoute component={SupportTickets} roles={["Admin", "Support"]} />}</Route>
      <Route path="/support/inquiries">{() => <RoleProtectedRoute component={Inquiries} roles={["Admin", "Support"]} />}</Route>

      {/* ── Patient Support ── */}
      <Route path="/my-support">{() => <RoleProtectedRoute component={MySupport} roles={["Patient"]} />}</Route>

      {/* ── HR ── */}
      <Route path="/hr/onboard">{() => <RoleProtectedRoute component={HROnboard} roles={["Admin", "HR Manager"]} />}</Route>

      {/* ── Workforce ── */}
      <Route path="/workforce/schedule">{() => <RoleProtectedRoute component={MySchedule} roles={["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "HR Manager"]} />}</Route>
      <Route path="/workforce/compensation">{() => <RoleProtectedRoute component={MyCompensation} roles={["Admin", "Doctor", "Nurse", "Receptionist", "Pharmacist", "Lab Staff", "Cashier", "Support", "HR Manager"]} />}</Route>
      <Route path="/workforce/attendance">{() => <RoleProtectedRoute component={Attendance} roles={["Admin", "Cashier", "HR Manager"]} />}</Route>
      <Route path="/workforce/leave">{() => <RoleProtectedRoute component={LeaveRequests} roles={["Admin", "HR Manager"]} />}</Route>
      <Route path="/workforce/payroll">{() => <RoleProtectedRoute component={Payroll} roles={["Admin", "HR Manager"]} />}</Route>

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
