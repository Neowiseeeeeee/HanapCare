import { useState } from "react";
import { useListMedicines } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pill } from "lucide-react";
import { format } from "date-fns";

export default function Medicines() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const timer = setTimeout(() => setDebouncedSearch(e.target.value), 500);
    return () => clearTimeout(timer);
  };

  const { data, isLoading } = useListMedicines({ search: debouncedSearch });

  return (
    <div className="pb-10">
      <PageHeader 
        title="Pharmacy Inventory" 
        description="Manage medicines and stock levels."
        action={
          <Button>
            <Plus className="mr-2 w-4 h-4" />
            Add Medicine
          </Button>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search medicine name..." 
              value={search}
              onChange={handleSearch}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-4">
            <LoadingTable columns={6} />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState 
            title="No medicines found" 
            description={search ? `No medicines matching "${search}"` : "Add a medicine to get started."}
            icon={<Pill className="h-8 w-8 text-muted-foreground" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug Name</TableHead>
                  <TableHead>Generic Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium text-primary">
                      {medicine.drugName}
                    </TableCell>
                    <TableCell>{medicine.genericName}</TableCell>
                    <TableCell>{medicine.category || '—'}</TableCell>
                    <TableCell>
                      {medicine.quantity <= (medicine.reorderLevel || 10) ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {medicine.quantity} {medicine.unit}
                        </Badge>
                      ) : (
                        <span className="text-sm font-medium">{medicine.quantity} {medicine.unit}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {medicine.expirationDate ? format(new Date(medicine.expirationDate), 'MMM d, yyyy') : '—'}
                    </TableCell>
                    <TableCell>
                      {medicine.unitPrice ? `₱${medicine.unitPrice.toFixed(2)}` : '—'}
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
