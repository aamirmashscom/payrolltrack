import { type Column, DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBackend } from "@/hooks/useBackend";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { formatCurrency } from "@/lib/utils";
import type { Employee, SalaryCalculation, SalaryRecord } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calculator, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const YEARS = ["2024", "2025", "2026"];

function StatRow({
  label,
  value,
  className = "",
  valueClassName = "",
}: {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={`flex justify-between items-baseline gap-2 ${className}`}>
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={`text-numeric text-sm ${valueClassName}`}>{value}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-3 mb-1.5">
      {children}
    </p>
  );
}

export default function SalaryPage() {
  const { actor, isFetching } = useBackend();
  const isAdmin = useIsAdmin();
  const qc = useQueryClient();

  const [selectedEmp, setSelectedEmp] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0"),
  );
  const [selectedYear, setSelectedYear] = useState("2026");
  const [calc, setCalc] = useState<SalaryCalculation | null>(null);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => (actor ? actor.getAllEmployees() : []),
    enabled: !!actor && !isFetching,
  });

  const { data: salaryRecords = [], isLoading: loadingRecords } = useQuery<
    SalaryRecord[]
  >({
    queryKey: ["salary-records"],
    queryFn: async () => (actor ? actor.getSalaryRecords() : []),
    enabled: !!actor && !isFetching,
  });

  const employeeMap = Object.fromEntries(
    employees.map((e) => [String(e.emp_id), e.name]),
  );

  const calcMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !selectedEmp) throw new Error("Select an employee");
      const result = await actor.calculateSalary(
        BigInt(selectedEmp),
        selectedMonth,
        selectedYear,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (data) => setCalc(data),
    onError: (e: Error) => toast.error(e.message),
  });

  const processMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !calc) throw new Error("Calculate salary first");
      const result = await actor.processSalary({
        emp_id: calc.emp_id,
        month_year: calc.month_year,
        present_days: calc.present_days,
        absent_days: calc.absent_days,
        basic_earned: calc.basic_earned,
        overtime_amount: calc.overtime_amount,
        advance_deduction: calc.advance_deduction,
        net_salary: calc.net_salary,
      });
      if (result.__kind__ === "err") throw new Error(result.err);
    },
    onSuccess: () => {
      toast.success("Payroll processed successfully");
      qc.invalidateQueries({ queryKey: ["salary-records"] });
      setCalc(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns: Column<SalaryRecord>[] = [
    {
      key: "emp",
      header: "Employee",
      cell: (r) => (
        <span className="font-medium">
          {employeeMap[String(r.emp_id)] ?? `ID: ${r.emp_id}`}
        </span>
      ),
    },
    {
      key: "month_year",
      header: "Month / Year",
      cell: (r) => <span className="text-numeric">{r.month_year}</span>,
    },
    {
      key: "present_days",
      header: "Present",
      cell: (r) => (
        <span className="text-numeric">{String(r.present_days)}</span>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
    {
      key: "absent_days",
      header: "Absent",
      cell: (r) => (
        <span className="text-numeric">{String(r.absent_days)}</span>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
    {
      key: "basic_earned",
      header: "Basic Earned",
      cell: (r) => (
        <span className="text-numeric">{formatCurrency(r.basic_earned)}</span>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
    {
      key: "overtime",
      header: "Overtime",
      cell: (r) => (
        <span className="text-numeric">
          {formatCurrency(r.overtime_amount)}
        </span>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
    {
      key: "advance",
      header: "Advance Deduct.",
      cell: (r) => (
        <span className="text-numeric text-destructive">
          {formatCurrency(r.advance_deduction)}
        </span>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
    {
      key: "net_salary",
      header: "Net Salary",
      cell: (r) => (
        <span className="text-numeric font-semibold text-accent">
          {formatCurrency(r.net_salary)}
        </span>
      ),
      headerClassName: "text-right",
      className: "text-right",
    },
    {
      key: "processed_date",
      header: "Processed",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.processed_date}
        </span>
      ),
    },
  ];

  return (
    <div className="flex gap-6 items-start">
      {/* Left panel: Calculator + Statement */}
      <aside className="w-80 shrink-0 flex flex-col gap-4">
        {/* Calculator form */}
        <div className="surface-elevated rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-4 w-4 text-primary" />
            <h2 className="font-display font-semibold text-base text-foreground">
              Salary Calculator
            </h2>
          </div>

          <div className="flex flex-col gap-3.5">
            <div>
              <Label className="text-xs mb-1 block">Employee</Label>
              <Select value={selectedEmp} onValueChange={setSelectedEmp}>
                <SelectTrigger
                  className="h-8 text-sm"
                  data-ocid="salary.employee.select"
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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs mb-1 block">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger
                    className="h-8 text-sm"
                    data-ocid="salary.month.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger
                    className="h-8 text-sm"
                    data-ocid="salary.year.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="w-full"
              size="sm"
              onClick={() => calcMutation.mutate()}
              disabled={!selectedEmp || calcMutation.isPending}
              data-ocid="salary.calculate.submit_button"
            >
              {calcMutation.isPending ? "Calculating..." : "Calculate Salary"}
            </Button>
          </div>
        </div>

        {/* Salary Statement */}
        {calc && (
          <div
            className="surface-elevated rounded-lg p-5"
            data-ocid="salary.statement.card"
          >
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-accent" />
              <h3 className="font-display font-semibold text-sm text-foreground">
                Salary Statement
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {calc.month_year} · {calc.emp_name}
            </p>

            <div className="space-y-0.5">
              {/* Summary */}
              <SectionLabel>Summary</SectionLabel>
              <StatRow
                label="Base Salary"
                value={formatCurrency(calc.base_salary)}
              />
              <StatRow
                label="Days in Month"
                value={String(calc.days_in_month)}
              />
              <StatRow
                label="Present / Absent"
                value={`${String(calc.present_days)} / ${String(calc.absent_days)}`}
              />
              <StatRow
                label="Overtime Hours"
                value={`${calc.total_overtime_hours.toFixed(2)} hrs`}
              />

              {/* Earnings */}
              <SectionLabel>Earnings</SectionLabel>
              <StatRow
                label="Basic Pay"
                value={formatCurrency(calc.basic_earned)}
              />
              <StatRow
                label="Overtime Pay"
                value={formatCurrency(calc.overtime_amount)}
              />
              <StatRow
                label="Gross Total"
                value={formatCurrency(calc.basic_earned + calc.overtime_amount)}
                valueClassName="font-semibold text-foreground"
              />

              {/* Deductions */}
              <SectionLabel>Deductions</SectionLabel>
              <StatRow
                label="Advance Deduction"
                value={formatCurrency(calc.advance_deduction)}
                valueClassName="text-destructive"
              />
            </div>

            {/* Net Salary highlighted box */}
            <div className="mt-4 rounded-md bg-accent/10 border border-accent/30 px-4 py-3 flex justify-between items-center">
              <span className="font-display font-semibold text-sm text-foreground">
                Net Salary Payable
              </span>
              <span className="font-mono font-bold text-base text-accent">
                {formatCurrency(calc.net_salary)}
              </span>
            </div>

            {isAdmin && (
              <Button
                className="w-full mt-3 bg-accent text-accent-foreground hover:bg-accent/90"
                size="sm"
                onClick={() => processMutation.mutate()}
                disabled={processMutation.isPending}
                data-ocid="salary.process_payroll.submit_button"
              >
                {processMutation.isPending
                  ? "Processing..."
                  : "Process Payroll"}
              </Button>
            )}
          </div>
        )}

        {calcMutation.isPending && (
          <div
            className="surface-elevated rounded-lg p-8 flex items-center justify-center"
            data-ocid="salary.calculate.loading_state"
          >
            <LoadingSpinner size="md" label="Calculating salary..." />
          </div>
        )}
      </aside>

      {/* Right panel: Payroll Records */}
      <div className="flex-1 min-w-0">
        <PageHeader
          title="Payroll Records"
          description="All processed salary disbursements"
        />
        <div className="surface-elevated rounded-lg overflow-hidden">
          {loadingRecords ? (
            <div
              className="py-20 flex items-center justify-center"
              data-ocid="salary.records.loading_state"
            >
              <LoadingSpinner size="lg" label="Loading salary records..." />
            </div>
          ) : salaryRecords.length === 0 ? (
            <EmptyState
              icon={<Receipt className="h-6 w-6" />}
              title="No payroll records"
              description="Process payroll for an employee to see records here."
            />
          ) : (
            <DataTable
              columns={columns}
              data={salaryRecords}
              rowKey={(r) => String(r.salary_id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
