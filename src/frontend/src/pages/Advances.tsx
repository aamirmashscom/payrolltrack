import { Badge } from "@/components/Badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { type Column, DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBackend } from "@/hooks/useBackend";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { formatCurrency } from "@/lib/utils";
import type { AdvanceRequestWithName, Employee } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CheckCircle, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const REPAY_OPTIONS = [1, 2, 3, 4, 5, 6, 12];

export default function AdvancesPage() {
  const { actor, isFetching } = useBackend();
  const qc = useQueryClient();
  const isAdmin = useIsAdmin();
  const [empId, setEmpId] = useState("");
  const [amount, setAmount] = useState("");
  const [months, setMonths] = useState("3");
  const [reason, setReason] = useState("");
  const [approveTarget, setApproveTarget] =
    useState<AdvanceRequestWithName | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<AdvanceRequestWithName | null>(null);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => (actor ? actor.getEmployees() : []),
    enabled: !!actor && !isFetching,
  });

  const { data: requests = [], isLoading } = useQuery<AdvanceRequestWithName[]>(
    {
      queryKey: ["advance-requests"],
      queryFn: async () => (actor ? actor.getAdvanceRequests() : []),
      enabled: !!actor && !isFetching,
    },
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      if (!empId) throw new Error("Select an employee");
      const amt = Number.parseFloat(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      const result = await actor.submitAdvanceRequest(
        BigInt(empId),
        amt,
        BigInt(months),
        reason,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Advance request submitted");
      qc.invalidateQueries({ queryKey: ["advance-requests"] });
      setEmpId("");
      setAmount("");
      setMonths("3");
      setReason("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approveMutation = useMutation({
    mutationFn: async (req: AdvanceRequestWithName) => {
      if (!actor) throw new Error("Not connected");
      const today = new Date().toISOString().split("T")[0];
      const result = await actor.approveAdvance(req.advance_id, today);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Advance request approved");
      qc.invalidateQueries({ queryKey: ["advance-requests"] });
      setApproveTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: async (req: AdvanceRequestWithName) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.rejectAdvance(req.advance_id);
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Advance request rejected");
      qc.invalidateQueries({ queryKey: ["advance-requests"] });
      setRejectTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const monthlyDeduction =
    amount && months ? Number.parseFloat(amount) / Number.parseInt(months) : 0;

  const baseColumns: Column<AdvanceRequestWithName>[] = [
    {
      key: "id",
      header: "ID",
      cell: (r) => (
        <span className="text-numeric text-muted-foreground text-xs">
          #{String(r.advance_id)}
        </span>
      ),
    },
    {
      key: "name",
      header: "Employee",
      cell: (r) => <span className="font-medium">{r.emp_name}</span>,
    },
    {
      key: "request_date",
      header: "Request Date",
      cell: (r) => (
        <span className="text-numeric text-xs">{r.request_date}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (r) => (
        <span className="text-numeric font-semibold">
          {formatCurrency(r.amount)}
        </span>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
    {
      key: "months",
      header: "Months",
      cell: (r) => (
        <span className="text-numeric">{String(r.repayment_months)}</span>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
    {
      key: "monthly",
      header: "Monthly Deduct.",
      cell: (r) => (
        <span className="text-numeric">
          {formatCurrency(r.monthly_deduction)}
        </span>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
    {
      key: "repaid",
      header: "Repaid",
      cell: (r) => (
        <span className="text-numeric text-muted-foreground">
          {formatCurrency(r.total_repaid)}
        </span>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <Badge status={r.status} />,
    },
    {
      key: "approved_date",
      header: "Approved",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.approved_date ?? "—"}
        </span>
      ),
    },
  ];

  const adminActionsColumn: Column<AdvanceRequestWithName> = {
    key: "actions",
    header: "Actions",
    cell: (r, i) =>
      r.status === "Pending" ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={(e) => {
              e.stopPropagation();
              setApproveTarget(r);
            }}
            data-ocid={`advances.approve_button.${i + 1}`}
            aria-label="Approve"
          >
            <CheckCircle className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              setRejectTarget(r);
            }}
            data-ocid={`advances.reject_button.${i + 1}`}
            aria-label="Reject"
          >
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  };

  const columns = isAdmin ? [...baseColumns, adminActionsColumn] : baseColumns;

  function clearForm() {
    setEmpId("");
    setAmount("");
    setMonths("3");
    setReason("");
  }

  return (
    <div className="flex gap-6">
      {/* Request Form — left panel always visible on desktop */}
      <aside className="w-72 shrink-0">
        <div className="surface-elevated rounded-lg p-5 sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base text-foreground">
              New Advance Request
            </h2>
          </div>

          <div className="flex flex-col gap-3.5" data-ocid="advances.form">
            <div>
              <Label className="text-xs">Employee</Label>
              <Select value={empId} onValueChange={setEmpId}>
                <SelectTrigger
                  className="h-8 text-sm mt-1"
                  data-ocid="advances.employee.select"
                >
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((e) => e.status === "Active")
                    .map((e) => (
                      <SelectItem
                        key={String(e.emp_id)}
                        value={String(e.emp_id)}
                      >
                        {e.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Amount (₹)</Label>
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25000"
                className="h-8 text-sm mt-1"
                data-ocid="advances.amount.input"
              />
            </div>
            <div>
              <Label className="text-xs">Repayment Months</Label>
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger
                  className="h-8 text-sm mt-1"
                  data-ocid="advances.repayment_months.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPAY_OPTIONS.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} month{m > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {monthlyDeduction > 0 && (
                <p className="text-xs text-muted-foreground mt-1.5 bg-muted/50 rounded px-2 py-1">
                  Monthly deduction:{" "}
                  <span className="text-foreground font-semibold">
                    {formatCurrency(monthlyDeduction)}
                  </span>
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs">Reason</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for advance..."
                className="text-sm mt-1 min-h-[80px] resize-none"
                data-ocid="advances.reason.textarea"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                data-ocid="advances.submit_button"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearForm}
                data-ocid="advances.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Advance Requests Table — main content */}
      <div className="flex-1 min-w-0">
        <PageHeader
          title="Advance Salary"
          description="Manage employee advance salary requests and repayment schedules"
        />

        <div className="surface-elevated rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex items-center justify-center">
              <LoadingSpinner size="lg" label="Loading advance requests..." />
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<Banknote className="h-6 w-6" />}
              title="No advance requests"
              description="Submit a new advance salary request to get started."
              action={
                <Button
                  size="sm"
                  onClick={clearForm}
                  data-ocid="advances.empty_state"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Request
                </Button>
              }
            />
          ) : (
            <DataTable
              columns={columns}
              data={requests}
              rowKey={(r) => String(r.advance_id)}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(o) => !o && setApproveTarget(null)}
        title="Approve Advance Request"
        description={`Approve advance of ${approveTarget ? formatCurrency(approveTarget.amount) : ""} for ${approveTarget?.emp_name}?`}
        confirmLabel="Approve"
        onConfirm={() => approveTarget && approveMutation.mutate(approveTarget)}
      />
      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(o) => !o && setRejectTarget(null)}
        title="Reject Advance Request"
        description={`Reject advance request for ${rejectTarget?.emp_name}? This cannot be undone.`}
        confirmLabel="Reject"
        variant="destructive"
        onConfirm={() => rejectTarget && rejectMutation.mutate(rejectTarget)}
      />
    </div>
  );
}
