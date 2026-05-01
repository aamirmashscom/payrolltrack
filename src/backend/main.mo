import List "mo:core/List";
import EmployeeTypes "types/employee";
import AttendanceTypes "types/attendance";
import SalaryTypes "types/salary";
import AdvanceTypes "types/advance";
import Common "types/common";
import EmployeeApi "mixins/employee-api";
import AttendanceApi "mixins/attendance-api";
import SalaryApi "mixins/salary-api";
import AdvanceApi "mixins/advance-api";

actor {
  let employees = List.empty<EmployeeTypes.Employee>();
  let attendances = List.empty<AttendanceTypes.Attendance>();
  let salaryRecords = List.empty<SalaryTypes.SalaryRecord>();
  let advances = List.empty<AdvanceTypes.AdvanceRequest>();

  let nextEmpId : Common.Counter = { var value = 1 };
  let nextAttendanceId : Common.Counter = { var value = 1 };
  let nextSalaryId : Common.Counter = { var value = 1 };
  let nextAdvanceId : Common.Counter = { var value = 1 };

  include EmployeeApi(employees, nextEmpId);
  include AttendanceApi(employees, attendances, nextAttendanceId);
  include SalaryApi(employees, attendances, advances, salaryRecords, nextSalaryId);
  include AdvanceApi(employees, advances, nextAdvanceId);
};
