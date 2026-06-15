import { useParams, Link } from "wouter";
import { useGetDoctor } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Stethoscope, Mail, Phone, Calendar, Clock, Activity } from "lucide-react";

export default function DoctorProfile() {
  const { id } = useParams();
  const doctorId = id ? parseInt(id) : 0;

  const { data: doctor, isLoading } = useGetDoctor(doctorId, { query: { enabled: !!doctorId } });

  if (isLoading) return <div className="pb-10"><LoadingCard /></div>;
  if (!doctor) return <div className="p-10 text-center">Doctor not found</div>;

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/doctors"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Doctors</Link>
      </Button>

      <PageHeader 
        title={`Dr. ${doctor.firstName} ${doctor.lastName}`}
        description={`${doctor.specialization} • ${doctor.departmentName}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline">Edit Profile</Button>
            <Button>View Schedule</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Stethoscope className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold">Dr. {doctor.lastName}</h3>
            <p className="text-muted-foreground">{doctor.specialization}</p>
            <div className="mt-4">
              {doctor.isActive ? (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Active Staff</Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Inactive</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-md"><Activity className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">License Number</p>
                  <p className="font-medium text-sm">{doctor.licenseNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-md"><Stethoscope className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium text-sm">{doctor.departmentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-md"><Phone className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact Number</p>
                  <p className="font-medium text-sm">{doctor.contactNumber || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-md"><Mail className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{doctor.email || "—"}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center"><Clock className="h-4 w-4 mr-1" /> Availability / Schedule</h4>
              <p className="bg-muted/30 p-3 rounded-md text-sm border">{doctor.availability || "Schedule not explicitly defined."}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <CardTitle className="flex items-center text-lg"><Calendar className="mr-2 h-5 w-5" /> Recent Patients</CardTitle>
          <Button variant="ghost" size="sm">View All</Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground italic border rounded-lg border-dashed">
            Patient history module loading...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
