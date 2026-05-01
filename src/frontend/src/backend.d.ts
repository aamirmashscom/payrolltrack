import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SalaryRecord {
    overtime_amount: number;
    processed_date: string;
    net_salary: number;
    month_year: string;
    emp_id: bigint;
    present_days: bigint;
    salary_id: bigint;
    advance_deduction: number;
    absent_days: bigint;
    basic_earned: number;
}
export type Result_2 = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface SalaryCalculation {
    emp_name: string;
    overtime_amount: number;
    base_salary: number;
    days_in_month: bigint;
    net_salary: number;
    total_overtime_hours: number;
    month_year: string;
    emp_id: bigint;
    present_days: bigint;
    advance_deduction: number;
    absent_days: bigint;
    basic_earned: number;
}
export interface Attendance {
    status: string;
    date: string;
    emp_id: bigint;
    overtime_hours: number;
    attendance_id: bigint;
    check_out?: string;
    check_in?: string;
    total_hours: number;
}
export interface AdvanceRequestWithName {
    status: string;
    emp_name: string;
    total_repaid: number;
    approved_date?: string;
    emp_id: bigint;
    advance_id: bigint;
    repayment_months: bigint;
    amount: number;
    reason: string;
    monthly_deduction: number;
    request_date: string;
}
export interface AdvanceRequest {
    status: string;
    total_repaid: number;
    approved_date?: string;
    emp_id: bigint;
    advance_id: bigint;
    repayment_months: bigint;
    amount: number;
    reason: string;
    monthly_deduction: number;
    request_date: string;
}
export type Result_1 = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export interface UpdateEmployee {
    emp_code: string;
    base_salary: number;
    joining_date: string;
    name: string;
    designation: string;
    department: string;
    biometric_id: string;
}
export type Result_3 = {
    __kind__: "ok";
    ok: SalaryCalculation;
} | {
    __kind__: "err";
    err: string;
};
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface Employee {
    emp_code: string;
    status: string;
    base_salary: number;
    joining_date: string;
    name: string;
    designation: string;
    emp_id: bigint;
    department: string;
    biometric_id: string;
}
export interface AttendanceRecord {
    status: string;
    emp_name: string;
    date: string;
    emp_id: bigint;
    overtime_hours: number;
    attendance_id: bigint;
    check_out?: string;
    check_in?: string;
    total_hours: number;
}
export interface SalaryInput {
    overtime_amount: number;
    net_salary: number;
    month_year: string;
    emp_id: bigint;
    present_days: bigint;
    advance_deduction: number;
    absent_days: bigint;
    basic_earned: number;
}
export interface NewEmployee {
    emp_code: string;
    base_salary: number;
    joining_date: string;
    name: string;
    designation: string;
    department: string;
    biometric_id: string;
}
export interface backendInterface {
    addEmployee(emp: NewEmployee): Promise<Result_1>;
    approveAdvance(advance_id: bigint, approved_date: string): Promise<Result>;
    calculateSalary(emp_id: bigint, month: string, year: string): Promise<Result_3>;
    deleteEmployee(emp_id: bigint): Promise<Result>;
    getAdvanceRequests(): Promise<Array<AdvanceRequestWithName>>;
    getAdvanceRequestsByEmployee(emp_id: bigint): Promise<Array<AdvanceRequest>>;
    getAllEmployees(): Promise<Array<Employee>>;
    getAttendance(from_date: string | null, to_date: string | null): Promise<Array<AttendanceRecord>>;
    getAttendanceByEmployee(emp_id: bigint, month: string, year: string): Promise<Array<Attendance>>;
    getEmployee(emp_id: bigint): Promise<Employee | null>;
    getEmployeeByBiometricId(bio_id: string): Promise<Employee | null>;
    getEmployees(): Promise<Array<Employee>>;
    getSalaryRecord(emp_id: bigint, month_year: string): Promise<SalaryRecord | null>;
    getSalaryRecords(): Promise<Array<SalaryRecord>>;
    getTotalAdvanceDeduction(emp_id: bigint, month: string, year: string): Promise<number>;
    markAttendance(emp_id: bigint, date: string, check_in: string, check_out: string): Promise<Result>;
    processBiometricScan(bio_id: string, timestamp: string): Promise<Result_2>;
    processSalary(data: SalaryInput): Promise<Result_1>;
    rejectAdvance(advance_id: bigint): Promise<Result>;
    submitAdvanceRequest(emp_id: bigint, amount: number, repayment_months: bigint, reason: string): Promise<Result_1>;
    updateEmployee(emp_id: bigint, emp: UpdateEmployee): Promise<Result>;
}
