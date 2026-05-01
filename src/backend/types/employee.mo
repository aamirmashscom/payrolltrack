module {
  public type Employee = {
    emp_id : Nat;
    emp_code : Text;
    name : Text;
    department : Text;
    designation : Text;
    base_salary : Float;
    joining_date : Text;
    biometric_id : Text;
    status : Text;
  };

  public type NewEmployee = {
    emp_code : Text;
    name : Text;
    department : Text;
    designation : Text;
    base_salary : Float;
    joining_date : Text;
    biometric_id : Text;
  };

  public type UpdateEmployee = {
    emp_code : Text;
    name : Text;
    department : Text;
    designation : Text;
    base_salary : Float;
    joining_date : Text;
    biometric_id : Text;
  };
};
