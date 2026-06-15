import { useListDispensingRecords } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Pill } from "lucide-react";
import { format } from "date-fns";

export default function Dispensing() {
  const { data, isLoading } = useListDispensingRecords({});

  return (
    <div className="pb-10">
      <PageHeader 
        title="Dispensing Records" 
        description="Pharmacy log of dispensed medications."
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <LoadingTable columns={5} />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState 
            title="No records found" 
            description="No medications have been dispensed yet."
            icon={<Pill className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Dispensed</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Dispensed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(record.dispensedAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">{record.patientName}</TableCell>
                    <TableCell className="font-medium text-primary">{record.medicineName}</TableCell>
                    <TableCell>{record.quantityDispensed}</TableCell>
                    <TableCell>{record.dispensedBy || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
