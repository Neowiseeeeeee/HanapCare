import { useState } from "react";
import { useListDoctors } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Stethoscope } from "lucide-react";

export default function Doctors() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const timer = setTimeout(() => setDebouncedSearch(e.target.value), 500);
    return () => clearTimeout(timer);
  };

  const { data, isLoading } = useListDoctors({ search: debouncedSearch });

  return (
    <div className="pb-10">
      <PageHeader 
        title="Doctors" 
        description="Manage doctors and specializations."
        action={
          <Button>
            <UserPlus className="mr-2 w-4 h-4" />
            Add Doctor
          </Button>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search doctors..." 
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
            title="No doctors found" 
            description={search ? `No doctors matching "${search}"` : "Add a new doctor to get started."}
            icon={<Stethoscope className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="font-medium">Dr. {doctor.lastName}, {doctor.firstName}</div>
                      <div className="text-xs text-muted-foreground">{doctor.licenseNumber}</div>
                    </TableCell>
                    <TableCell>{doctor.specialization}</TableCell>
                    <TableCell>{doctor.departmentName || '—'}</TableCell>
                    <TableCell>{doctor.contactNumber || '—'}</TableCell>
                    <TableCell>
                      {doctor.isActive ? (
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
