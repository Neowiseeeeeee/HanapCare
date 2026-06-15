import { useState } from "react";
import { useListStaff } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Users2 } from "lucide-react";
import { format } from "date-fns";

export default function Staff() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const timer = setTimeout(() => setDebouncedSearch(e.target.value), 500);
    return () => clearTimeout(timer);
  };

  const { data, isLoading } = useListStaff({ search: debouncedSearch });

  return (
    <div className="pb-10">
      <PageHeader 
        title="Staff Management" 
        description="Manage hospital employees and access."
        action={
          <Button>
            <UserPlus className="mr-2 w-4 h-4" />
            Add Staff
          </Button>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search staff..." 
              value={search}
              onChange={handleSearch}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-4">
            <LoadingTable columns={5} />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState 
            title="No staff found" 
            description={search ? `No staff matching "${search}"` : "Add a new staff member to get started."}
            icon={<Users2 className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="font-medium">{staff.lastName}, {staff.firstName}</div>
                      <div className="text-xs text-muted-foreground">{staff.email}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{staff.role}</Badge></TableCell>
                    <TableCell>{staff.departmentName || '—'}</TableCell>
                    <TableCell>{staff.contactNumber || '—'}</TableCell>
                    <TableCell>
                      {staff.isActive ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Inactive</Badge>
                      )}
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
