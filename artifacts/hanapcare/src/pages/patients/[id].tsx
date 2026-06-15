import { useParams, Link } from "wouter";
import { useGetPatient, useGetPatientVisits, useListConsultations } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingCard } from "@/components/ui/loading-state";
import { ArrowLeft, User, Phone, MapPin, Activity, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function PatientDetails() {
  const { id } = useParams();
  const patientId = id ? parseInt(id) : 0;

  const { data: patient, isLoading } = useGetPatient(patientId, { query: { enabled: !!patientId } });
  const { data: visits } = useGetPatientVisits(patientId, { query: { enabled: !!patientId } });
  const { data: consultations } = useListConsultations({ patientId }, { query: { enabled: !!patientId } });

  if (isLoading) {
    return <div className="pb-10"><LoadingCard /></div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="pb-10">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/patients"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients</Link>
      </Button>

      <PageHeader 
        title={`${patient.lastName}, ${patient.firstName}`}
        description={`Code: ${patient.patientCode} • Registered ${format(new Date(patient.createdAt!), 'MMM d, yyyy')}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline">Edit Info</Button>
            <Button>New Appointment</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Demographics</p>
                <p className="font-medium">{format(new Date(patient.dateOfBirth), 'MMM d, yyyy')} ({patient.gender})</p>
                <p className="text-sm">Blood: {patient.bloodType || 'Unknown'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary/10 rounded-full text-secondary">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{patient.contactNumber}</p>
                <p className="text-sm truncate">{patient.email || 'No email'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-full text-accent">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emergency Contact</p>
                <p className="font-medium">{patient.emergencyContactName || 'None'}</p>
                <p className="text-sm">{patient.emergencyContactNumber || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visits">Visit History</TabsTrigger>
          <TabsTrigger value="medical">Medical Records</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Medical Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Allergies</h4>
                <p>{patient.allergies || 'None recorded'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Existing Conditions</h4>
                <p>{patient.existingConditions || 'None recorded'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">PhilHealth Number</h4>
                <p>{patient.philhealthNumber || '—'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Insurance Info</h4>
                <p>{patient.insuranceInfo || '—'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="visits">
          <Card>
            <CardHeader><CardTitle>Recent Visits</CardTitle></CardHeader>
            <CardContent>
              {visits && visits.length > 0 ? (
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div key={visit.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-md"><Calendar className="h-4 w-4" /></div>
                        <div>
                          <p className="font-medium">{format(new Date(visit.visitDate), 'MMM d, yyyy')}</p>
                          <p className="text-sm text-muted-foreground">{visit.doctorName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{visit.reason}</p>
                        <p className="text-xs text-muted-foreground">{visit.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No visit history</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="medical">
          <Card>
            <CardHeader><CardTitle>Consultations</CardTitle></CardHeader>
            <CardContent>
              {consultations && consultations.length > 0 ? (
                <div className="space-y-4">
                  {consultations.map((cons) => (
                    <div key={cons.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-primary">{format(new Date(cons.consultationDate), 'MMM d, yyyy')}</span>
                        <span className="text-sm text-muted-foreground">Dr. {cons.doctorName}</span>
                      </div>
                      {cons.diagnosis && <p className="text-sm mb-2"><span className="font-medium">Diagnosis:</span> {cons.diagnosis}</p>}
                      <Button variant="link" size="sm" className="px-0">View full notes</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No medical records</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
