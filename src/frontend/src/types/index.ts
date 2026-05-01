export type {
  Employee,
  Attendance,
  AttendanceRecord,
  SalaryRecord,
  SalaryCalculation,
  AdvanceRequestWithName,
  NewEmployee,
  UpdateEmployee,
  SalaryInput,
} from "@/backend";

export type StatusType =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Active"
  | "Inactive"
  | "Present"
  | "Absent"
  | "Half Day";
