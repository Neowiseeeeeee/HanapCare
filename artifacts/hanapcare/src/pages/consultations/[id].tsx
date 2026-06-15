import { useParams, Link } from "wouter";
import { useGetConsultation } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading-state";
import { ArrowLeft, User, Stethoscope, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

export default function ConsultationDetails() {
  const { id } = useParams();
  const consultationId = id ? parseInt(id) : 0;

  const { data: cons, isLoading } = useGetConsultation(consultationId, { query: { enabled: !!consultationId } });

  if (isLoading) return <div className="pb-10"><LoadingCard /></div>;
  if (!cons) return <div className="p-10 text-center">Consultation not found</div>;

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/consultations"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Consultations</Link>
      </Button>

      <PageHeader 
        title="Consultation Notes"
        description="Electronic health record details."
        action={
          <div className="flex gap-2">
            <Button variant="outline">Edit Notes</Button>
            <Button>Print Record</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary"><User className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-semibold text-primary">{cons.patientName}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-secondary/10 rounded-full text-secondary"><Stethoscope className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Attending</p>
              <p className="font-semibold">Dr. {cons.doctorName}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-accent/10 rounded-full text-accent"><Calendar className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-semibold">{format(new Date(cons.consultationDate), 'MMMM d, yyyy')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{cons.diagnosis || "No primary diagnosis recorded"}</p>
          {cons.icdCode && <p className="text-sm text-muted-foreground mt-1">ICD-10: {cons.icdCode}</p>}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg flex items-center"><span className="text-primary mr-2 font-bold">S</span>ubjective</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{cons.subjective || "No notes recorded."}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg flex items-center"><span className="text-primary mr-2 font-bold">O</span>bjective</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{cons.objective || "No notes recorded."}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg flex items-center"><span className="text-primary mr-2 font-bold">A</span>ssessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{cons.assessment || "No notes recorded."}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg flex items-center"><span className="text-primary mr-2 font-bold">P</span>lan</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{cons.plan || "No notes recorded."}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
