import { useState } from "react";
import { useListBeds, useListWards } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { BedDouble, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Beds() {
  const [wardFilter, setWardFilter] = useState<string>("all");
  
  const { data: wards } = useListWards();
  const { data: beds, isLoading } = useListBeds({ 
    wardId: wardFilter !== "all" ? parseInt(wardFilter) : undefined 
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20";
      case "Occupied": return "border-red-200 bg-red-50 dark:bg-red-950/20";
      case "Reserved": return "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20";
      case "Maintenance": return "border-gray-200 bg-gray-50 dark:bg-gray-900";
      default: return "";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available": return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Available</Badge>;
      case "Occupied": return <Badge variant="outline" className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Occupied</Badge>;
      case "Reserved": return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Reserved</Badge>;
      case "Maintenance": return <Badge variant="outline" className="bg-gray-200 text-gray-700 hover:bg-gray-200 border-none">Maintenance</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="pb-10">
      <PageHeader 
        title="Bed Management" 
        description="Monitor individual bed assignments and availability."
        action={
          <div className="w-[200px]">
            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Wards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards?.map((w) => (
                  <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <LoadingCard key={i} />)}
        </div>
      ) : !beds || beds.length === 0 ? (
        <EmptyState 
          title="No beds found" 
          description="There are no beds available for the selected ward."
          icon={<BedDouble className="h-8 w-8 text-muted-foreground" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {beds.map((bed) => (
            <Card key={bed.id} className={cn("overflow-hidden border-2 transition-all hover:shadow-md", getStatusColor(bed.status))}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">{bed.bedNumber}</CardTitle>
                  {getStatusBadge(bed.status)}
                </div>
                <div className="text-xs text-muted-foreground truncate">{bed.wardName}</div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {bed.status === "Occupied" && bed.patientName ? (
                  <div className="mt-2 p-2 bg-background/50 rounded-md border flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate" title={bed.patientName}>{bed.patientName}</span>
                  </div>
                ) : (
                  <div className="mt-2 h-9"></div> // Spacer to keep card heights uniform
                )}
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" className="w-full h-8 text-xs bg-background/80 hover:bg-background">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
