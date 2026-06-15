import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, Role } from "@/lib/auth";
import { Activity, User, ShieldCheck, Stethoscope, HeartPulse, Pill, FlaskConical, Receipt } from "lucide-react";
import { motion } from "framer-motion";

const roles: { role: Role; icon: any; color: string }[] = [
  { role: "Admin", icon: ShieldCheck, color: "bg-red-100 text-red-600" },
  { role: "Doctor", icon: Stethoscope, color: "bg-blue-100 text-blue-600" },
  { role: "Nurse", icon: HeartPulse, color: "bg-emerald-100 text-emerald-600" },
  { role: "Receptionist", icon: User, color: "bg-orange-100 text-orange-600" },
  { role: "Pharmacist", icon: Pill, color: "bg-purple-100 text-purple-600" },
  { role: "Lab Staff", icon: FlaskConical, color: "bg-yellow-100 text-yellow-600" },
  { role: "Cashier", icon: Receipt, color: "bg-green-100 text-green-600" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800/50" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl z-10"
      >
        <div className="text-center mb-10">
          <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <Activity className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">HanapCare</h1>
          <p className="text-muted-foreground mt-2 text-lg">Hospital Management System</p>
        </div>

        <Card className="border-border/50 shadow-xl bg-background/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl">Select a Role</CardTitle>
            <CardDescription>
              Choose a demo persona to explore the application features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {roles.map((r) => (
                <Button
                  key={r.role}
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-6 gap-4 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                  onClick={() => login(r.role)}
                >
                  <div className={`p-4 rounded-full ${r.color}`}>
                    <r.icon className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-foreground">{r.role}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
