import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useListStaff, useListDepartments } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingTable } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, UserPlus, Users2, Building2, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import DepartmentSheet from "@/pages/departments/DepartmentSheet";

type ViewMode = "list" | "by-department";

export default function Staff() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const canOnboard = user?.role === "HR Manager" || user?.role === "Admin";
  const canEdit = user?.role === "Admin";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set());
  const [managingDeptId, setManagingDeptId] = useState<number | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const timer = setTimeout(() => setDebouncedSearch(e.target.value), 400);
    return () => clearTimeout(timer);
  };

  const { data, isLoading, refetch } = useListStaff({ search: debouncedSearch });
  const { data: departments } = useListDepartments();

  const filtered = useMemo(() => {
    if (!data) return [];
    if (deptFilter === "all") return data;
    if (deptFilter === "none") return data.filter(s => !s.departmentId);
    return data.filter(s => s.departmentId === Number(deptFilter));
  }, [data, deptFilter]);

  const byDepartment = useMemo(() => {
    if (!data) return [];
    const groups: Array<{ id: number | null; name: string; members: typeof data }> = [];
    const deptMap = new Map<number | null, typeof data>();

    data.forEach(s => {
      const key = s.departmentId ?? null;
      if (!deptMap.has(key)) deptMap.set(key, []);
      deptMap.get(key)!.push(s);
    });

    departments?.forEach(d => {
      const members = deptMap.get(d.id) ?? [];
      groups.push({ id: d.id, name: d.name, members });
    });

    const unassigned = deptMap.get(null) ?? [];
    if (unassigned.length > 0) {
      groups.push({ id: null, name: "Unassigned", members: unassigned });
    }

    return groups;
  }, [data, departments]);

  const toggleDept = (id: number | null) => {
    const key = id ?? -1;
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const roleColor = (role: string) => {
    const map: Record<string, string> = {
      Doctor: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      Nurse:  "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
      Pharmacist: "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
      "Lab Staff": "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      Receptionist: "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      "HR Manager": "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    };
    return map[role] ?? "bg-muted text-foreground border-border";
  };

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
        {/* Toolbar */}
        <div className="p-4 border-b flex items-center gap-3 bg-muted/20 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search staff…"
              value={search}
              onChange={handleSearch}
              className="pl-9 bg-background"
            />
          </div>

          {viewMode === "list" && (
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-background">
                <Building2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="none">Unassigned</SelectItem>
                {departments?.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center rounded-lg border bg-background overflow-hidden ml-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("by-department")}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${viewMode === "by-department" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              By Department
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4"><LoadingTable columns={5} /></div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No staff found"
            description={search ? `No staff matching "${search}"` : "Add a new staff member to get started."}
            icon={<Users2 className="h-8 w-8 text-muted-foreground" />}
          />
        ) : viewMode === "list" ? (
          /* ── List view ── */
          filtered.length === 0 ? (
            <EmptyState
              title="No staff in this department"
              description="Try selecting a different filter."
              icon={<Building2 className="h-8 w-8 text-muted-foreground" />}
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
                  {filtered.map((s) => (
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
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${roleColor(s.role)}`}>{s.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{s.departmentName || "—"}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{s.contactNumber || "—"}</TableCell>
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
          )
        ) : (
          /* ── By Department view ── */
          <div className="divide-y divide-border">
            {byDepartment.map(group => {
              const key = group.id ?? -1;
              const isExpanded = expandedDepts.has(key);
              const activeCount = group.members.filter(m => m.isActive).length;

              return (
                <div key={key}>
                  {/* Department header row */}
                  <div className="flex items-center gap-3 px-5 py-3.5 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer select-none" onClick={() => toggleDept(group.id)}>
                    {isExpanded
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    }
                    <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-foreground">{group.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{group.members.length} staff</span>
                      {activeCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />{activeCount} active
                        </span>
                      )}
                      {group.id !== null && canOnboard && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setManagingDeptId(group.id); }}
                          className="ml-2 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-0.5 rounded-md hover:bg-primary/10"
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded member rows */}
                  {isExpanded && group.members.length > 0 && (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableBody>
                          {group.members.map((s) => (
                            <TableRow
                              key={s.id}
                              className="cursor-pointer hover:bg-muted/40 transition-colors"
                              onClick={() => setLocation(`/staff/${s.id}`)}
                            >
                              <TableCell className="pl-14">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 bg-gradient-to-br from-sky-500 to-teal-500 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {s.firstName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground text-sm">{s.lastName}, {s.firstName}</div>
                                    <div className="text-xs text-muted-foreground">{s.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-xs ${roleColor(s.role)}`}>{s.role}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">{s.contactNumber || "—"}</TableCell>
                              <TableCell>
                                {s.isActive ? (
                                  <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs">Active</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-xs text-primary font-semibold">View →</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {isExpanded && group.members.length === 0 && (
                    <div className="px-14 py-4 text-sm text-muted-foreground italic">
                      No staff assigned to this department.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Department detail sheet (from By Department view) */}
      <DepartmentSheet
        deptId={managingDeptId}
        onClose={() => setManagingDeptId(null)}
        onUpdated={refetch}
        canEdit={canEdit}
      />
    </div>
  );
}
