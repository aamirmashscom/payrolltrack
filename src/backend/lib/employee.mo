import List "mo:core/List";
import EmployeeTypes "../types/employee";
import Common "../types/common";

module {
  public type Employee = EmployeeTypes.Employee;
  public type NewEmployee = EmployeeTypes.NewEmployee;
  public type UpdateEmployee = EmployeeTypes.UpdateEmployee;

  public func addEmployee(
    employees : List.List<Employee>,
    nextId : Nat,
    emp : NewEmployee,
  ) : Common.Result<Nat, Text> {
    if (emp.name == "") {
      return #err("Employee name cannot be empty");
    };
    let exists = employees.find(func(e : Employee) : Bool { e.emp_code == emp.emp_code });
    switch (exists) {
      case (?_) { #err("Employee code already exists") };
      case null {
        let newEmp : Employee = {
          emp_id = nextId;
          emp_code = emp.emp_code;
          name = emp.name;
          department = emp.department;
          designation = emp.designation;
          base_salary = emp.base_salary;
          joining_date = emp.joining_date;
          biometric_id = emp.biometric_id;
          status = "Active";
        };
        employees.add(newEmp);
        #ok(nextId);
      };
    };
  };

  public func updateEmployee(
    employees : List.List<Employee>,
    emp_id : Nat,
    emp : UpdateEmployee,
  ) : Common.Result<(), Text> {
    let idx = employees.findIndex(func(e : Employee) : Bool { e.emp_id == emp_id });
    switch (idx) {
      case null { #err("Employee not found") };
      case (?i) {
        let existing = employees.at(i);
        employees.put(
          i,
          {
            existing with
            emp_code = emp.emp_code;
            name = emp.name;
            department = emp.department;
            designation = emp.designation;
            base_salary = emp.base_salary;
            joining_date = emp.joining_date;
            biometric_id = emp.biometric_id;
          },
        );
        #ok(());
      };
    };
  };

  public func deleteEmployee(
    employees : List.List<Employee>,
    emp_id : Nat,
  ) : Common.Result<(), Text> {
    let idx = employees.findIndex(func(e : Employee) : Bool { e.emp_id == emp_id });
    switch (idx) {
      case null { #err("Employee not found") };
      case (?i) {
        let existing = employees.at(i);
        employees.put(i, { existing with status = "Inactive" });
        #ok(());
      };
    };
  };

  public func getEmployees(employees : List.List<Employee>) : [Employee] {
    employees.filter(func(e : Employee) : Bool { e.status == "Active" }).toArray();
  };

  public func getAllEmployees(employees : List.List<Employee>) : [Employee] {
    employees.toArray();
  };

  public func getEmployee(employees : List.List<Employee>, emp_id : Nat) : ?Employee {
    employees.find(func(e : Employee) : Bool { e.emp_id == emp_id });
  };

  public func getEmployeeByBiometricId(employees : List.List<Employee>, bio_id : Text) : ?Employee {
    employees.find(func(e : Employee) : Bool { e.biometric_id == bio_id and e.status == "Active" });
  };
};
