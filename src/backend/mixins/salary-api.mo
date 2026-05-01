import List "mo:core/List";
import SalaryLib "../lib/salary";
import SalaryTypes "../types/salary";
import EmployeeTypes "../types/employee";
import AttendanceTypes "../types/attendance";
import AdvanceTypes "../types/advance";
import Common "../types/common";

mixin (
  employees : List.List<EmployeeTypes.Employee>,
  attendances : List.List<AttendanceTypes.Attendance>,
  advances : List.List<AdvanceTypes.AdvanceRequest>,
  salaryRecords : List.List<SalaryTypes.SalaryRecord>,
  nextSalaryId : Common.Counter
) {
  public query func calculateSalary(emp_id : Nat, month : Text, year : Text) : async Common.Result<SalaryTypes.SalaryCalculation, Text> {
    SalaryLib.calculateSalary(employees, attendances, advances, emp_id, month, year);
  };

  public func processSalary(data : SalaryTypes.SalaryInput) : async Common.Result<Nat, Text> {
    let result = SalaryLib.processSalary(employees, salaryRecords, nextSalaryId.value, data);
    switch (result) {
      case (#ok(id)) { nextSalaryId.value += 1; #ok(id) };
      case (#err(e)) { #err(e) };
    };
  };

  public query func getSalaryRecord(emp_id : Nat, month_year : Text) : async ?SalaryTypes.SalaryRecord {
    SalaryLib.getSalaryRecord(salaryRecords, emp_id, month_year);
  };

  public query func getSalaryRecords() : async [SalaryTypes.SalaryRecord] {
    SalaryLib.getSalaryRecords(salaryRecords);
  };
};
