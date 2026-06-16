import { useState } from "react";
import { useListDepartments } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Users2, CheckCircle2, Settings2 } from "lucide-react";
import DepartmentSheet from "./DepartmentSheet";

export default function Departments() {
  const { user } = useAuth();
  const canEdit = user?.role === "Admin";
  const { data: departments, isLoading, refetch } = useListDepartments();
  const [managingId, setManagingId] = useState<number | null>(null);

  return (
    <div className="pb-10">
      <PageHeader
        title="Departments"
        description="Manage hospital departments and structure."
        action={
          canEdit ? (
            <Button>
              <Plus className="mr-2 w-4 h-4" />
              Add Department
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} />)
        ) : departments?.map((dept) => {
          const activeCount = (dept as any).activeCount ?? 0;
          const totalCount = dept.staffCount ?? 0;
          const inactiveCount = totalCount - activeCount;

          return (
            <Card
              key={dept.id}
              className="hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => setManagingId(dept.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{dept.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">
                  {dept.description || "No description provided."}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-muted/60 rounded-full px-2.5 py-1">
                    <Users2 className="w-3 h-3 text-muted-foreground" />
                    {totalCount} Staff
                  </span>
                  {activeCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full px-2.5 py-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {activeCount} Active
                    </span>
                  )}
                  {inactiveCount > 0 && (
                    <Badge variant="outline" className="text-xs bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
                      {inactiveCount} Inactive
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">Click to view members</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-primary hover:text-primary"
                    onClick={(e) => { e.stopPropagation(); setManagingId(dept.id); }}
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DepartmentSheet
        deptId={managingId}
        onClose={() => setManagingId(null)}
        onUpdated={refetch}
        canEdit={canEdit}
      />
    </div>
  );
}
