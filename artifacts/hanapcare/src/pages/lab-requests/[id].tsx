import { useParams, Link } from "wouter";
import { useGetLabRequest, useUpdateLabRequest, getGetLabRequestQueryKey } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { LoadingCard } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Stethoscope, FlaskConical, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function LabRequestDetails() {
  const { id } = useParams();
  const requestId = id ? parseInt(id) : 0;
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useGetLabRequest(requestId, { query: { enabled: !!requestId } });
  const updateRequest = useUpdateLabRequest();

  const [resultSummary, setResultSummary] = useState("");

  const handleStatusUpdate = (status: string) => {
    updateRequest.mutate({ id: requestId, data: { status } }, {
      onSuccess: () => {
        toast.success(`Request marked as ${status}`);
        queryClient.invalidateQueries({ queryKey: getGetLabRequestQueryKey(requestId) });
      },
      onError: () => toast.error("Failed to update status")
    });
  };

  const handleSaveResults = () => {
    updateRequest.mutate({ 
      id: requestId, 
      data: { status: "Completed", resultSummary, completedAt: new Date().toISOString() } 
    }, {
      onSuccess: () => {
        toast.success("Results saved successfully");
        queryClient.invalidateQueries({ queryKey: getGetLabRequestQueryKey(requestId) });
      },
      onError: () => toast.error("Failed to save results")
    });
  };

  if (isLoading) return <div className="pb-10"><LoadingCard /></div>;
  if (!request) return <div className="p-10 text-center">Request not found</div>;

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/lab-requests"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Lab Requests</Link>
      </Button>

      <PageHeader 
        title={`Lab Request #${request.id.toString().padStart(5, '0')}`}
        description="Laboratory test details and results."
        action={
          <div className="flex gap-2">
            {request.status === "Pending" && (
              <Button onClick={() => handleStatusUpdate("Processing")} disabled={updateRequest.isPending}>
                Start Processing
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary"><User className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-semibold">{request.patientName}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-secondary/10 rounded-full text-secondary"><Stethoscope className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Requested By</p>
              <p className="font-semibold">Dr. {request.doctorName}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-accent/10 rounded-full text-accent"><FlaskConical className="h-6 w-6" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Test Type</p>
              <p className="font-semibold">{request.testType}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="outline">{request.status}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Requested:</span>
              <span className="text-sm text-muted-foreground">{format(new Date(request.requestedAt), 'MMM d, yyyy h:mm a')}</span>
            </div>
            {request.completedAt && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Completed:</span>
                <span className="text-sm text-muted-foreground">{format(new Date(request.completedAt), 'MMM d, yyyy h:mm a')}</span>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center"><FileText className="h-4 w-4 mr-1" /> Clinical Notes</h4>
              <p className="text-sm bg-muted/30 p-3 rounded-md border min-h-[60px]">{request.notes || "No notes provided."}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {request.status === "Completed" ? "Final laboratory results" : "Enter results when processing is complete"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {request.status === "Completed" ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-md border border-emerald-200 whitespace-pre-wrap text-sm">
                  {request.resultSummary || "No detailed results recorded."}
                </div>
                {request.resultFileUrl && (
                  <Button variant="outline" className="w-full">Download Result PDF</Button>
                )}
              </div>
            ) : request.status === "Processing" ? (
              <div className="space-y-4">
                <Textarea 
                  placeholder="Enter detailed test results here..." 
                  className="min-h-[150px]"
                  value={resultSummary}
                  onChange={(e) => setResultSummary(e.target.value)}
                />
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                  onClick={handleSaveResults}
                  disabled={!resultSummary.trim() || updateRequest.isPending}
                >
                  Save Results & Mark Completed
                </Button>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center py-8 text-muted-foreground text-sm italic">
                Start processing to enter results.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
