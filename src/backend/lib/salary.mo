import List "mo:core/List";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Time "mo:core/Time";
import SalaryTypes "../types/salary";
import EmployeeTypes "../types/employee";
import AttendanceTypes "../types/attendance";
import AdvanceTypes "../types/advance";
import Common "../types/common";
import AdvanceLib "advance";

module {
  public type SalaryRecord = SalaryTypes.SalaryRecord;
  public type SalaryCalculation = SalaryTypes.SalaryCalculation;
  public type SalaryInput = SalaryTypes.SalaryInput;
  public type Employee = EmployeeTypes.Employee;
  public type Attendance = AttendanceTypes.Attendance;
  public type AdvanceRequest = AdvanceTypes.AdvanceRequest;

  public func daysInMonth(month : Text, year : Text) : Int {
    let mm = switch (Int.fromText(month)) { case (?m) m; case null 1 };
    let yy = switch (Int.fromText(year)) { case (?y) y; case null 1970 };
    switch (mm) {
      case 1 { 31 };
      case 2 {
        if ((yy % 4 == 0 and yy % 100 != 0) or yy % 400 == 0) { 29 } else { 28 };
      };
      case 3 { 31 };
      case 4 { 30 };
      case 5 { 31 };
      case 6 { 30 };
      case 7 { 31 };
      case 8 { 31 };
      case 9 { 30 };
      case 10 { 31 };
      case 11 { 30 };
      case 12 { 31 };
      case _ { 30 };
    };
  };

  public func calculateSalary(
    employees : List.List<Employee>,
    attendances : List.List<Attendance>,
    advances : List.List<AdvanceRequest>,
    emp_id : Nat,
    month : Text,
    year : Text,
  ) : Common.Result<SalaryCalculation, Text> {
    switch (employees.find(func(e : Employee) : Bool { e.emp_id == emp_id })) {
      case null { #err("Employee not found") };
      case (?emp) {
        let mm = if (month.size() == 1) { "0" # month } else { month };
        let prefix = year # "-" # mm;
        let monthAttendances = attendances.filter(
          func(a : Attendance) : Bool {
            a.emp_id == emp_id and a.date.startsWith(#text prefix)
          }
        );
        let presentDays : Int = monthAttendances.size().toInt();
        let dim = daysInMonth(month, year);
        let absentDays = dim - presentDays;
        let totalOvertime = monthAttendances.foldLeft(
          0.0,
          func(acc : Float, a : Attendance) : Float { acc + a.overtime_hours },
        );
        let dailyRate : Float = emp.base_salary / dim.toFloat();
        let basicEarned : Float = presentDays.toFloat() * dailyRate;
        let overtimeRate : Float = (emp.base_salary / (dim * 8).toFloat()) * 1.5;
        let overtimeAmount : Float = totalOvertime * overtimeRate;
        let advanceDeduction = AdvanceLib.getTotalAdvanceDeduction(advances, emp_id, month, year);
        let netSalary = basicEarned + overtimeAmount - advanceDeduction;
        #ok({
          emp_id;
          emp_name = emp.name;
          base_salary = emp.base_salary;
          month_year = mm # "/" # year;
          days_in_month = dim;
          present_days = presentDays;
          absent_days = absentDays;
          total_overtime_hours = totalOvertime;
          basic_earned = basicEarned;
          overtime_amount = overtimeAmount;
          advance_deduction = advanceDeduction;
          net_salary = netSalary;
        });
      };
    };
  };

  public func processSalary(
    employees : List.List<Employee>,
    salaryRecords : List.List<SalaryRecord>,
    nextId : Nat,
    data : SalaryInput,
  ) : Common.Result<Nat, Text> {
    switch (employees.find(func(e : Employee) : Bool { e.emp_id == data.emp_id })) {
      case null { #err("Employee not found") };
      case (?_) {
        let existing = salaryRecords.find(
          func(s : SalaryRecord) : Bool {
            s.emp_id == data.emp_id and s.month_year == data.month_year
          }
        );
        switch (existing) {
          case (?_) { #err("Salary already processed for this month") };
          case null {
            let todayDate = todayText();
            salaryRecords.add({
              salary_id = nextId;
              emp_id = data.emp_id;
              month_year = data.month_year;
              present_days = data.present_days;
              absent_days = data.absent_days;
              basic_earned = data.basic_earned;
              overtime_amount = data.overtime_amount;
              advance_deduction = data.advance_deduction;
              net_salary = data.net_salary;
              processed_date = todayDate;
            });
            #ok(nextId);
          };
        };
      };
    };
  };

  public func getSalaryRecord(
    salaryRecords : List.List<SalaryRecord>,
    emp_id : Nat,
    month_year : Text,
  ) : ?SalaryRecord {
    salaryRecords.find(func(s : SalaryRecord) : Bool {
      s.emp_id == emp_id and s.month_year == month_year
    });
  };

  public func getSalaryRecords(salaryRecords : List.List<SalaryRecord>) : [SalaryRecord] {
    salaryRecords.toArray();
  };

  func todayText() : Text {
    let ns = Time.now();
    let secs = Int.abs(ns) / 1_000_000_000;
    epochDaysToDate(secs / 86400);
  };

  func epochDaysToDate(d : Nat) : Text {
    let z = d + 719468;
    let era = z / 146097;
    let doe = z % 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let dd = doy - (153 * mp + 2) / 5 + 1;
    let mm = if (mp < 10) { mp + 3 } else { mp - 9 };
    let yy = if (mm <= 2) { y + 1 } else { y };
    padNat(yy, 4) # "-" # padNat(mm, 2) # "-" # padNat(dd, 2);
  };

  func padNat(n : Nat, width : Nat) : Text {
    let s = n.toText();
    var result = s;
    var i = s.size();
    while (i < width) {
      result := "0" # result;
      i += 1;
    };
    result;
  };
};
