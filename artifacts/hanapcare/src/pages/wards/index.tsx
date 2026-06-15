import { useListWards } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingCard } from "@/components/ui/loading-state";
import { Building2, Plus, BedDouble } from "lucide-react";
import { Link } from "wouter";

export default function Wards() {
  const { data: wards, isLoading } = useListWards();

  return (
    <div className="pb-10">
      <PageHeader 
        title="Wards & Facilities" 
        description="Manage hospital wards and bed capacity."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/beds">
                <BedDouble className="mr-2 w-4 h-4" />
                Bed View
              </Link>
            </Button>
            <Button asChild>
              <Link href="/wards/new">
                <Plus className="mr-2 w-4 h-4" />
                Add Ward
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} />)
        ) : wards?.map((ward) => {
          const occupied = ward.totalBeds - (ward.availableBeds || 0);
          const percent = (occupied / ward.totalBeds) * 100;
          const isHigh = percent >= 90;

          return (
            <Card key={ward.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{ward.name}</CardTitle>
                      <div className="text-xs text-muted-foreground">{ward.wardType} • {ward.floor || 'No floor'}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium">
                      {occupied} / {ward.totalBeds} Beds
                    </span>
                  </div>
                  <Progress 
                    value={percent} 
                    className="h-2"
                    indicatorClassName={isHigh ? "bg-destructive" : "bg-primary"}
                  />
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className={isHigh ? "text-destructive font-medium" : "text-emerald-600"}>
                      {ward.availableBeds} available
                    </span>
                    <span className="text-muted-foreground">{Math.round(percent)}% full</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/beds?wardId=${ward.id}`}>Manage Beds</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
