import List "mo:core/List";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AttendanceTypes "../types/attendance";
import EmployeeTypes "../types/employee";
import Common "../types/common";

module {
  public type Attendance = AttendanceTypes.Attendance;
  public type AttendanceRecord = AttendanceTypes.AttendanceRecord;
  public type Employee = EmployeeTypes.Employee;

  // Parse "HH:MM" or "HH:MM:SS" into total minutes from midnight
  func parseTimeMinutes(t : Text) : ?Int {
    let parts = t.split(#char ':');
    let arr = parts.toArray();
    if (arr.size() < 2) return null;
    switch (Int.fromText(arr[0]), Int.fromText(arr[1])) {
      case (?h, ?m) { ?(h * 60 + m) };
      case _ { null };
    };
  };

  // Returns (total_hours, overtime_hours)
  public func calcHours(check_in : Text, check_out : Text) : (Float, Float) {
    switch (parseTimeMinutes(check_in), parseTimeMinutes(check_out)) {
      case (?inMin, ?outMin) {
        let diffMin = outMin - inMin;
        let totalHours : Float = if (diffMin < 0) { 0.0 } else { diffMin.toFloat() / 60.0 };
        let overtime : Float = if (totalHours > 8.0) { totalHours - 8.0 } else { 0.0 };
        (totalHours, overtime);
      };
      case _ { (0.0, 0.0) };
    };
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

  public func processBiometricScan(
    employees : List.List<Employee>,
    attendances : List.List<Attendance>,
    nextId : Nat,
    bio_id : Text,
    timestamp : Text,
  ) : Common.Result<Text, Text> {
    switch (employees.find(func(e : Employee) : Bool { e.biometric_id == bio_id and e.status == "Active" })) {
      case null { #err("Biometric ID not recognised") };
      case (?emp) {
        let today = todayText();
        let existingIdx = attendances.findIndex(
          func(a : Attendance) : Bool { a.emp_id == emp.emp_id and a.date == today }
        );
        switch (existingIdx) {
          case null {
            attendances.add({
              attendance_id = nextId;
              emp_id = emp.emp_id;
              date = today;
              check_in = ?timestamp;
              check_out = null;
              total_hours = 0.0;
              overtime_hours = 0.0;
              status = "Present";
            });
            #ok(emp.name # " checked in at " # timestamp);
          };
          case (?i) {
            let rec = attendances.at(i);
            switch (rec.check_in, rec.check_out) {
              case (?ci, null) {
                let (totalH, overtimeH) = calcHours(ci, timestamp);
                attendances.put(i, {
                  rec with
                  check_out = ?timestamp;
                  total_hours = totalH;
                  overtime_hours = overtimeH;
                });
                #ok(emp.name # " checked out at " # timestamp);
              };
              case _ {
                #ok("Already checked out for today");
              };
            };
          };
        };
      };
    };
  };

  public func markAttendance(
    employees : List.List<Employee>,
    attendances : List.List<Attendance>,
    nextId : Nat,
    emp_id : Nat,
    date : Text,
    check_in : Text,
    check_out : Text,
  ) : Common.Result<(), Text> {
    switch (employees.find(func(e : Employee) : Bool { e.emp_id == emp_id })) {
      case null { #err("Employee not found") };
      case (?_) {
        let (totalH, overtimeH) = calcHours(check_in, check_out);
        let existingIdx = attendances.findIndex(
          func(a : Attendance) : Bool { a.emp_id == emp_id and a.date == date }
        );
        switch (existingIdx) {
          case null {
            attendances.add({
              attendance_id = nextId;
              emp_id;
              date;
              check_in = ?check_in;
              check_out = ?check_out;
              total_hours = totalH;
              overtime_hours = overtimeH;
              status = "Present";
            });
          };
          case (?i) {
            let rec = attendances.at(i);
            attendances.put(i, {
              rec with
              check_in = ?check_in;
              check_out = ?check_out;
              total_hours = totalH;
              overtime_hours = overtimeH;
              status = "Present";
            });
          };
        };
        #ok(());
      };
    };
  };

  func compareTextDesc(a : Text, b : Text) : { #less; #equal; #greater } {
    let ord = Text.compare(a, b);
    switch (ord) {
      case (#less) #greater;
      case (#greater) #less;
      case (#equal) #equal;
    };
  };

  public func getAttendance(
    employees : List.List<Employee>,
    attendances : List.List<Attendance>,
    from_date : ?Text,
    to_date : ?Text,
  ) : [AttendanceRecord] {
    let filtered = attendances.filter(func(a : Attendance) : Bool {
      let afterFrom = switch (from_date) {
        case null { true };
        case (?fd) { Text.compare(a.date, fd) != #less };
      };
      let beforeTo = switch (to_date) {
        case null { true };
        case (?td) { Text.compare(a.date, td) != #greater };
      };
      afterFrom and beforeTo;
    });

    let sorted = filtered.sort(func(a : Attendance, b : Attendance) : { #less; #equal; #greater } {
      compareTextDesc(a.date, b.date)
    });

    let limited = if (sorted.size() > 100) {
      sorted.sliceToArray(0, 100);
    } else {
      sorted.toArray();
    };

    limited.map<Attendance, AttendanceRecord>(func(a : Attendance) : AttendanceRecord {
      let empName = switch (employees.find(func(e : Employee) : Bool { e.emp_id == a.emp_id })) {
        case (?e) { e.name };
        case null { "Unknown" };
      };
      {
        attendance_id = a.attendance_id;
        emp_id = a.emp_id;
        emp_name = empName;
        date = a.date;
        check_in = a.check_in;
        check_out = a.check_out;
        total_hours = a.total_hours;
        overtime_hours = a.overtime_hours;
        status = a.status;
      };
    });
  };

  public func getAttendanceByEmployee(
    attendances : List.List<Attendance>,
    emp_id : Nat,
    month : Text,
    year : Text,
  ) : [Attendance] {
    let mm = if (month.size() == 1) { "0" # month } else { month };
    let prefix = year # "-" # mm;
    attendances
      .filter(func(a : Attendance) : Bool {
        a.emp_id == emp_id and a.date.startsWith(#text prefix)
      })
      .toArray();
  };
};
