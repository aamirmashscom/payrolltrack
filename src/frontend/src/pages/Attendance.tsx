import { Badge } from "@/components/Badge";
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
import { useBackend } from "@/hooks/useBackend";
import type { AttendanceRecord, Employee } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Fingerprint } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AttendancePage() {
  const { actor, isFetching } = useBackend();
  const qc = useQueryClient();

  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [bioId, setBioId] = useState("");
  const [bioMessage, setBioMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [manualEmpId, setManualEmpId] = useState("");
  const [manualDate, setManualDate] = useState(today);
  const [checkIn, setCheckIn] = useState("09:00");
  const [checkOut, setCheckOut] = useState("17:00");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => (actor ? actor.getEmployees() : []),
    enabled: !!actor && !isFetching,
  });

  const {
    data: records = [],
    isLoading,
    refetch,
  } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", fromDate, toDate],
    queryFn: async () =>
      actor ? actor.getAttendance(fromDate || null, toDate || null) : [],
    enabled: !!actor && !isFetching,
  });

  const bioMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      // Use HH:MM:SS from toTimeString() per spec
      const ts = new Date().toTimeString().split(" ")[0];
      const result = await actor.processBiometricScan(id, ts);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (msg) => {
      setBioMessage({ type: "success", text: msg });
      setBioId("");
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (e: Error) => {
      setBioMessage({ type: "error", text: e.message });
      setBioId("");
    },
  });

  const markMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      if (!manualEmpId) throw new Error("Select an employee");
      const result = await actor.markAttendance(
        BigInt(manualEmpId),
        manualDate,
        checkIn,
        checkOut,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Attendance recorded");
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleMarkAttendance() {
    setValidationError(null);
    if (checkOut <= checkIn) {
      setValidationError("Check-out time must be after check-in time.");
      return;
    }
    markMutation.mutate();
  }

  const columns: Column<AttendanceRecord>[] = [
    {
      key: "date",
      header: "Date",
      cell: (r) => <span className="text-numeric">{r.date}</span>,
      width: "w-28",
    },
    {
      key: "name",
      header: "Employee",
      cell: (r) => <span className="font-medium">{r.emp_name}</span>,
    },
    {
      key: "check_in",
      header: "Check-In",
      cell: (r) => <span className="text-numeric">{r.check_in ?? "—"}</span>,
      width: "w-24",
    },
    {
      key: "check_out",
      header: "Check-Out",
      cell: (r) => <span className="text-numeric">{r.check_out ?? "—"}</span>,
      width: "w-24",
    },
    {
      key: "total_hours",
      header: "Total Hrs",
      cell: (r) => (
        <span className="text-numeric">{r.total_hours.toFixed(2)}</span>
      ),
      headerClassName: "text-right",
      className: "text-right",
      width: "w-24",
    },
    {
      key: "overtime",
      header: "Overtime",
      cell: (r) =>
        r.overtime_hours > 0 ? (
          <span className="text-numeric inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-semibold">
            {r.overtime_hours.toFixed(2)}
          </span>
        ) : (
          <span className="text-numeric text-muted-foreground">
            {r.overtime_hours.toFixed(2)}
          </span>
        ),
      headerClassName: "text-right",
      className: "text-right",
      width: "w-28",
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <Badge status={r.status} />,
      width: "w-24",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attendance"
        description="Track employee check-ins, check-outs, and working hours"
      />

      <div className="grid grid-cols-2 gap-5">
        {/* Biometric Scanner */}
        <div className="surface-elevated rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Fingerprint className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Biometric Scanner Simulation
            </h3>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter or scan Biometric ID..."
              value={bioId}
              onChange={(e) => {
                setBioId(e.target.value);
                setBioMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && bioId) {
                  setBioMessage(null);
                  bioMutation.mutate(bioId);
                }
              }}
              className="h-9 text-sm font-mono"
              data-ocid="attendance.biometric_id.input"
            />
            <Button
              size="sm"
              className="h-9"
              onClick={() => {
                if (bioId) {
                  setBioMessage(null);
                  bioMutation.mutate(bioId);
                }
              }}
              disabled={!bioId || bioMutation.isPending}
              data-ocid="attendance.biometric_scan.submit_button"
            >
              {bioMutation.isPending ? "Scanning..." : "Scan"}
            </Button>
          </div>

          {bioMessage && (
            <div
              className={`mt-3 px-3 py-2 rounded text-xs font-medium ${
                bioMessage.type === "success"
                  ? "bg-accent/15 text-accent-foreground border border-accent/30"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
              data-ocid={
                bioMessage.type === "success"
                  ? "attendance.biometric.success_state"
                  : "attendance.biometric.error_state"
              }
            >
              {bioMessage.text}
            </div>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            Press Enter or click Scan. Auto-detects check-in / check-out based
            on existing records for today.
          </p>
        </div>

        {/* Manual Entry */}
        <div className="surface-elevated rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Manual Attendance Entry
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Employee</Label>
              <Select value={manualEmpId} onValueChange={setManualEmpId}>
                <SelectTrigger
                  className="h-9 text-sm"
                  data-ocid="attendance.manual_employee.select"
                >
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={String(e.emp_id)} value={String(e.emp_id)}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Date</Label>
                <Input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="h-9 text-sm"
                  data-ocid="attendance.manual_date.input"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Check-In</Label>
                <Input
                  type="time"
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    setValidationError(null);
                  }}
                  className="h-9 text-sm font-mono"
                  data-ocid="attendance.check_in.input"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Check-Out</Label>
                <Input
                  type="time"
                  value={checkOut}
                  onChange={(e) => {
                    setCheckOut(e.target.value);
                    setValidationError(null);
                  }}
                  className="h-9 text-sm font-mono"
                  data-ocid="attendance.check_out.input"
                />
              </div>
            </div>

            {validationError && (
              <p
                className="text-xs text-destructive"
                data-ocid="attendance.manual.field_error"
              >
                {validationError}
              </p>
            )}
          </div>

          <Button
            size="sm"
            className="mt-4 w-full h-9"
            onClick={handleMarkAttendance}
            disabled={markMutation.isPending}
            data-ocid="attendance.manual.submit_button"
          >
            {markMutation.isPending ? "Saving..." : "Mark Attendance"}
          </Button>
        </div>
      </div>

      {/* Filter + Table */}
      <div className="surface-elevated rounded-lg overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
          <span className="text-sm font-medium text-foreground">
            Filter by date:
          </span>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-7 text-xs w-36"
              data-ocid="attendance.from_date.input"
            />
            <span className="text-muted-foreground text-xs">to</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-7 text-xs w-36"
              data-ocid="attendance.to_date.input"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => void refetch()}
            data-ocid="attendance.filter.submit_button"
          >
            Apply
          </Button>
        </div>

        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <LoadingSpinner size="lg" label="Loading attendance..." />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="No attendance records"
            description="No records found for the selected date range."
            data-ocid="attendance.records.empty_state"
          />
        ) : (
          <DataTable
            columns={columns}
            data={records}
            rowKey={(r) => String(r.attendance_id)}
          />
        )}
      </div>
    </div>
  );
}
