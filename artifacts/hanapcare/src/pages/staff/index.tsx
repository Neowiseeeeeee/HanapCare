import { useState } from "react";
import { useLocation } from "wouter";
import { useListStaff } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Users2 } from "lucide-react";

export default function Staff() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const canOnboard = user?.role === "HR Manager" || user?.role === "Admin";

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
          canOnboard ? (
            <Button onClick={() => setLocation("/hr/onboard")}>
              <UserPlus className="mr-2 w-4 h-4" />
              Onboard Employee
            </Button>
          ) : undefined
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
                  {canOnboard && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((s) => (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => setLocation(`/staff/${s.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{s.lastName}, {s.firstName}</div>
                          <div className="text-xs text-muted-foreground">{s.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{s.role}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{s.departmentName || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{s.contactNumber || '—'}</TableCell>
                    <TableCell>
                      {s.isActive ? (
                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">Inactive</Badge>
                      )}
                    </TableCell>
                    {canOnboard && (
                      <TableCell className="text-right">
                        <span className="text-xs text-primary font-semibold">View →</span>
                      </TableCell>
                    )}
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
