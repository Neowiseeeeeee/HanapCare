import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListPatients } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  // Properly debounce the search value — clears the old timer on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useListPatients({ search: debouncedSearch });

  return (
    <div className="pb-10">
      <PageHeader 
        title="Patients" 
        description="Manage patient records, history, and demographics."
        action={
          <Button asChild>
            <Link href="/patients/new">
              <UserPlus className="mr-2 w-4 h-4" />
              Register Patient
            </Link>
          </Button>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or code..." 
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
        ) : !data?.data || data.data.length === 0 ? (
          <EmptyState 
            title="No patients found" 
            description={search ? `No patients matching "${search}"` : "Get started by registering your first patient."}
            action={
              <Button asChild variant="outline">
                <Link href="/patients/new">Register Patient</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>DOB / Gender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((patient, index) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {patient.patientCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{patient.lastName}, {patient.firstName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}
                        <span className="text-muted-foreground ml-1">({patient.gender})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {patient.contactNumber}
                    </TableCell>
                    <TableCell>
                      {patient.bloodType ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">
                          {patient.bloodType}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/patients/${patient.id}`}>View Details</Link>
                      </Button>
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
