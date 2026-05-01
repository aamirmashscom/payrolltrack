module {
  public type Attendance = {
    attendance_id : Nat;
    emp_id : Nat;
    date : Text;
    check_in : ?Text;
    check_out : ?Text;
    total_hours : Float;
    overtime_hours : Float;
    status : Text;
  };

  public type AttendanceRecord = {
    attendance_id : Nat;
    emp_id : Nat;
    emp_name : Text;
    date : Text;
    check_in : ?Text;
    check_out : ?Text;
    total_hours : Float;
    overtime_hours : Float;
    status : Text;
  };
};
