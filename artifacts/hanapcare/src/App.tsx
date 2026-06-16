import { lazy, Suspense, useEffect } from "react";
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

// ── Lazy page imports (route-level code splitting) ──────────────────────────
const NotFound            = lazy(() => import("@/pages/not-found"));
const NotAuthorized       = lazy(() => import("@/pages/not-authorized"));
const Login               = lazy(() => import("@/pages/login"));
const Dashboard           = lazy(() => import("@/pages/dashboard"));
const PatientDashboard    = lazy(() => import("@/pages/patient/Dashboard"));
const AdminDashboard      = lazy(() => import("@/pages/admin/Dashboard"));
const SupportDashboard    = lazy(() => import("@/pages/support/Dashboard"));
const HRDashboard         = lazy(() => import("@/pages/hr/Dashboard"));
const HROnboard           = lazy(() => import("@/pages/hr/Onboard"));
const ProfileSetup        = lazy(() => import("@/pages/public/ProfileSetup"));
const Patients            = lazy(() => import("@/pages/patients/index"));
const NewPatient          = lazy(() => import("@/pages/patients/new"));
const PatientDetails      = lazy(() => import("@/pages/patients/[id]"));
const Appointments        = lazy(() => import("@/pages/appointments/index"));
const NewAppointment      = lazy(() => import("@/pages/appointments/new"));
const AppointmentCalendar = lazy(() => import("@/pages/appointments/calendar"));
const AppointmentDetails  = lazy(() => import("@/pages/appointments/[id]"));
const Wards               = lazy(() => import("@/pages/wards/index"));
const Beds                = lazy(() => import("@/pages/beds/index"));
const Settings            = lazy(() => import("@/pages/settings"));
const Doctors             = lazy(() => import("@/pages/doctors/index"));
const NewDoctor           = lazy(() => import("@/pages/doctors/new"));
const DoctorProfile       = lazy(() => import("@/pages/doctors/[id]"));
const Medicines           = lazy(() => import("@/pages/medicines/index"));
const NewMedicine         = lazy(() => import("@/pages/medicines/new"));
const Dispensing          = lazy(() => import("@/pages/dispensing/index"));
const Staff               = lazy(() => import("@/pages/staff/index"));
const StaffProfile        = lazy(() => import("@/pages/staff/[id]"));
const Departments         = lazy(() => import("@/pages/departments/index"));
const Consultations       = lazy(() => import("@/pages/consultations/index"));
const NewConsultation     = lazy(() => import("@/pages/consultations/new"));
const ConsultationDetails = lazy(() => import("@/pages/consultations/[id]"));
const VitalSigns          = lazy(() => import("@/pages/vital-signs/index"));
const LabRequests         = lazy(() => import("@/pages/lab-requests/index"));
const NewLabRequest       = lazy(() => import("@/pages/lab-requests/new"));
const LabRequestDetails   = lazy(() => import("@/pages/lab-requests/[id]"));
const Billing             = lazy(() => import("@/pages/billing/index"));
const NewBilling          = lazy(() => import("@/pages/billing/new"));
const BillingDetails      = lazy(() => import("@/pages/billing/[id]"));
const Payments            = lazy(() => import("@/pages/payments/index"));
const Reports             = lazy(() => import("@/pages/reports/index"));
const AuditLogs           = lazy(() => import("@/pages/audit-logs/index"));
const Notifications       = lazy(() => import("@/pages/notifications/index"));
const Prescriptions       = lazy(() => import("@/pages/prescriptions/index"));
const NursingNotes        = lazy(() => import("@/pages/nursing-notes/index"));
const MedicationAdmin     = lazy(() => import("@/pages/medication-admin/index"));
const DoctorAvailability  = lazy(() => import("@/pages/doctor-availability/index"));
const MySchedule          = lazy(() => import("@/pages/workforce/schedule"));
const MyCompensation      = lazy(() => import("@/pages/workforce/compensation"));
const Attendance          = lazy(() => import("@/pages/workforce/attendance"));
const LeaveRequests       = lazy(() => import("@/pages/workforce/leave"));
const Payroll             = lazy(() => import("@/pages/workforce/payroll"));
const SupportTickets      = lazy(() => import("@/pages/support/tickets"));
const Inquiries           = lazy(() => import("@/pages/support/inquiries"));
const MySupport           = lazy(() => import("@/pages/patient/MySupport"));
const BookAppointment     = lazy(() => import("@/pages/patient/BookAppointment"));
const Landing             = lazy(() => import("@/pages/public/Landing"));
const About               = lazy(() => import("@/pages/public/About"));
const Services            = lazy(() => import("@/pages/public/Services"));
const Blog                = lazy(() => import("@/pages/public/Blog"));
const BlogPost            = lazy(() => import("@/pages/public/BlogPost"));
const Contact             = lazy(() => import("@/pages/public/Contact"));
const Terms               = lazy(() => import("@/pages/public/Terms"));
const Privacy             = lazy(() => import("@/pages/public/Privacy"));
const Signup              = lazy(() => import("@/pages/public/Signup"));
const ForgotPassword      = lazy(() => import("@/pages/public/ForgotPassword"));
const ResetPassword       = lazy(() => import("@/pages/public/ResetPassword"));
const AuthCallback        = lazy(() => import("@/pages/AuthCallback"));

// ── Loading fallback ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/auth/callback" component={AuthCallback} />
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
        <Route path="/book-appointment">{() => <RoleProtectedRoute component={BookAppointment} roles={["Patient"]} />}</Route>

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
    </Suspense>
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
