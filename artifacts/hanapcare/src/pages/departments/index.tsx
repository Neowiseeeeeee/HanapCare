import { useListDepartments } from "@workspace/api-client-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Users2 } from "lucide-react";

export default function Departments() {
  const { data: departments, isLoading } = useListDepartments();

  return (
    <div className="pb-10">
      <PageHeader 
        title="Departments" 
        description="Manage hospital departments and structure."
        action={
          <Button>
            <Plus className="mr-2 w-4 h-4" />
            Add Department
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingCard key={i} />)
        ) : departments?.map((dept) => (
          <Card key={dept.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 min-h-[40px]">
                {dept.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center text-sm">
                  <Users2 className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{dept.staffCount || 0} Staff Members</span>
                </div>
                <Button variant="ghost" size="sm">Manage</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
