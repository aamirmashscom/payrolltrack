import { Badge } from "@/components/Badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { type Column, DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBackend } from "@/hooks/useBackend";
import { formatCurrency } from "@/lib/utils";
import type { Employee, NewEmployee, UpdateEmployee } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Search, Trash2, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const EMPTY_FORM: NewEmployee = {
  emp_code: "",
  name: "",
  department: "",
  designation: "",
  base_salary: 0,
  joining_date: new Date().toISOString().split("T")[0],
  biometric_id: "",
};

type FormMode = "add" | "edit";

export default function EmployeesPage() {
  const { actor, isFetching } = useBackend();
  const qc = useQueryClient();

  const [mode, setMode] = useState<FormMode>("add");
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState<NewEmployee>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [search, setSearch] = useState("");

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => (actor ? actor.getAllEmployees() : []),
    enabled: !!actor && !isFetching,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.emp_code.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q),
    );
  }, [employees, search]);

  const addMutation = useMutation({
    mutationFn: async (emp: NewEmployee) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.addEmployee(emp);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee added successfully");
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: bigint; data: UpdateEmployee }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.updateEmployee(id, data);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated");
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.deleteEmployee(id);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee removed");
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setMode("add");
  }

  function handleRowClick(emp: Employee) {
    setEditTarget(emp);
    setMode("edit");
    setForm({
      emp_code: emp.emp_code,
      name: emp.name,
      department: emp.department,
      designation: emp.designation,
      base_salary: emp.base_salary,
      joining_date: emp.joining_date,
      biometric_id: emp.biometric_id,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "edit" && editTarget) {
      updateMutation.mutate({ id: editTarget.emp_id, data: form });
    } else {
      addMutation.mutate(form);
    }
  }

  const formFields: {
    label: string;
    key: keyof NewEmployee;
    type: string;
    ocid: string;
    required?: boolean;
  }[] = [
    {
      label: "Employee Code",
      key: "emp_code",
      type: "text",
      ocid: "employees.emp_code.input",
      required: true,
    },
    {
      label: "Full Name",
      key: "name",
      type: "text",
      ocid: "employees.name.input",
      required: true,
    },
    {
      label: "Department",
      key: "department",
      type: "text",
      ocid: "employees.department.input",
    },
    {
      label: "Designation",
      key: "designation",
      type: "text",
      ocid: "employees.designation.input",
    },
    {
      label: "Base Salary (₹)",
      key: "base_salary",
      type: "number",
      ocid: "employees.base_salary.input",
    },
    {
      label: "Joining Date",
      key: "joining_date",
      type: "date",
      ocid: "employees.joining_date.input",
    },
    {
      label: "Biometric ID",
      key: "biometric_id",
      type: "text",
      ocid: "employees.biometric_id.input",
    },
  ];

  const columns: Column<Employee>[] = [
    {
      key: "emp_code",
      header: "Code",
      cell: (r) => <span className="font-mono text-xs">{r.emp_code}</span>,
      width: "w-20",
    },
    {
      key: "name",
      header: "Name",
      cell: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "department",
      header: "Department",
      cell: (r) => r.department || "—",
    },
    {
      key: "designation",
      header: "Designation",
      cell: (r) => r.designation || "—",
    },
    {
      key: "base_salary",
      header: "Base Salary",
      cell: (r) => (
        <span className="text-numeric">{formatCurrency(r.base_salary)}</span>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
    {
      key: "biometric_id",
      header: "Biometric ID",
      cell: (r) => (
        <span className="font-mono text-xs">{r.biometric_id || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <Badge status={r.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r, i) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(r);
            }}
            data-ocid={`employees.edit_button.${i + 1}`}
            aria-label="Edit employee"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(r);
            }}
            data-ocid={`employees.delete_button.${i + 1}`}
            aria-label="Delete employee"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const isBusy = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex gap-6 items-start" data-ocid="employees.page">
      {/* ── Left: Form panel (always visible) ── */}
      <aside className="w-[350px] shrink-0 sticky top-4">
        <div className="surface-elevated rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm text-foreground">
              {mode === "edit" ? "Edit Employee" : "Add Employee"}
            </h2>
            {mode === "edit" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={resetForm}
                aria-label="Cancel edit"
                data-ocid="employees.cancel_edit_button"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
            data-ocid="employees.form"
          >
            {formFields.map(({ label, key, type, ocid, required }) => (
              <div key={key} className="flex flex-col gap-1">
                <Label htmlFor={key} className="text-xs text-muted-foreground">
                  {label}
                  {required && (
                    <span className="text-destructive ml-0.5">*</span>
                  )}
                </Label>
                <Input
                  id={key}
                  type={type}
                  value={String(form[key])}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [key]:
                        type === "number"
                          ? Number.parseFloat(e.target.value) || 0
                          : e.target.value,
                    }))
                  }
                  required={required}
                  className="h-8 text-sm"
                  data-ocid={ocid}
                />
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              {mode === "edit" ? (
                <>
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1"
                    disabled={isBusy}
                    data-ocid="employees.update_button"
                  >
                    {isBusy ? "Saving..." : "Update Employee"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetForm}
                    data-ocid="employees.cancel_button"
                  >
                    Clear
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1"
                    disabled={isBusy}
                    data-ocid="employees.submit_button"
                  >
                    {isBusy ? "Adding..." : "Add Employee"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetForm}
                    data-ocid="employees.clear_button"
                  >
                    Clear
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      </aside>

      {/* ── Right: Table panel ── */}
      <div className="flex-1 min-w-0">
        <PageHeader
          title="Employees"
          description="Manage your workforce and employee records"
        />

        {/* Search bar */}
        <div className="mb-3 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, code, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
            data-ocid="employees.search_input"
          />
        </div>

        <div className="surface-elevated rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex items-center justify-center">
              <LoadingSpinner size="lg" label="Loading employees…" />
            </div>
          ) : employees.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No employees yet"
              description="Fill the form on the left to add your first employee."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="No results"
              description={`No employees match "${search}".`}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch("")}
                  data-ocid="employees.clear_search_button"
                >
                  Clear search
                </Button>
              }
            />
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              rowKey={(r) => String(r.emp_id)}
              onRowClick={handleRowClick}
            />
          )}
        </div>

        {employees.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {filtered.length} of {employees.length} employee
            {employees.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove Employee"
        description={`Are you sure you want to remove ${deleteTarget?.name}? They will be marked as Inactive.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() =>
          deleteTarget && deleteMutation.mutate(deleteTarget.emp_id)
        }
      />
    </div>
  );
}
