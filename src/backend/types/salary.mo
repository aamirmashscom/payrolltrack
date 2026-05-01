module {
  public type SalaryRecord = {
    salary_id : Nat;
    emp_id : Nat;
    month_year : Text;
    present_days : Int;
    absent_days : Int;
    basic_earned : Float;
    overtime_amount : Float;
    advance_deduction : Float;
    net_salary : Float;
    processed_date : Text;
  };

  public type SalaryCalculation = {
    emp_id : Nat;
    emp_name : Text;
    base_salary : Float;
    month_year : Text;
    days_in_month : Int;
    present_days : Int;
    absent_days : Int;
    total_overtime_hours : Float;
    basic_earned : Float;
    overtime_amount : Float;
    advance_deduction : Float;
    net_salary : Float;
  };

  public type SalaryInput = {
    emp_id : Nat;
    month_year : Text;
    present_days : Int;
    absent_days : Int;
    basic_earned : Float;
    overtime_amount : Float;
    advance_deduction : Float;
    net_salary : Float;
  };
};
