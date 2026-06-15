import { useState } from "react";
import { useListAuditLogs } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList } from "lucide-react";
import { format } from "date-fns";

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const { data: logs, isLoading } = useListAuditLogs({ page });

  return (
    <div className="pb-10">
      <PageHeader 
        title="Audit Logs" 
        description="System-wide activity and security tracking."
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <LoadingTable columns={5} />
          </div>
        ) : !logs || logs.length === 0 ? (
          <EmptyState 
            title="No logs found" 
            description="No system activity has been recorded yet."
            icon={<ClipboardList className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                      {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.userName}</div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-muted text-foreground">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.tableName ? (
                        <span className="text-sm">
                          {log.tableName} #{log.recordId}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate" title={log.details || ''}>
                      {log.details || '—'}
                    </TableCell>
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
