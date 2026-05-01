import List "mo:core/List";
import Text "mo:core/Text";
import AttendanceLib "../lib/attendance";
import AttendanceTypes "../types/attendance";
import EmployeeTypes "../types/employee";
import Common "../types/common";

mixin (
  employees : List.List<EmployeeTypes.Employee>,
  attendances : List.List<AttendanceTypes.Attendance>,
  nextAttendanceId : Common.Counter
) {
  public func processBiometricScan(bio_id : Text, timestamp : Text) : async Common.Result<Text, Text> {
    let sizeBefore = attendances.size();
    let result = AttendanceLib.processBiometricScan(employees, attendances, nextAttendanceId.value, bio_id, timestamp);
    switch (result) {
      case (#ok(msg)) {
        if (attendances.size() > sizeBefore) {
          nextAttendanceId.value += 1;
        };
        #ok(msg);
      };
      case (#err(e)) { #err(e) };
    };
  };

  public func markAttendance(emp_id : Nat, date : Text, check_in : Text, check_out : Text) : async Common.Result<(), Text> {
    let sizeBefore = attendances.size();
    let result = AttendanceLib.markAttendance(employees, attendances, nextAttendanceId.value, emp_id, date, check_in, check_out);
    switch (result) {
      case (#ok(_)) {
        if (attendances.size() > sizeBefore) {
          nextAttendanceId.value += 1;
        };
        #ok(());
      };
      case (#err(e)) { #err(e) };
    };
  };

  public query func getAttendance(from_date : ?Text, to_date : ?Text) : async [AttendanceTypes.AttendanceRecord] {
    AttendanceLib.getAttendance(employees, attendances, from_date, to_date);
  };

  public query func getAttendanceByEmployee(emp_id : Nat, month : Text, year : Text) : async [AttendanceTypes.Attendance] {
    AttendanceLib.getAttendanceByEmployee(attendances, emp_id, month, year);
  };
};
