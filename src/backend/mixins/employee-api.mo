import List "mo:core/List";
import EmployeeLib "../lib/employee";
import EmployeeTypes "../types/employee";
import Common "../types/common";

mixin (
  employees : List.List<EmployeeTypes.Employee>,
  nextEmpId : Common.Counter
) {
  public func addEmployee(emp : EmployeeTypes.NewEmployee) : async Common.Result<Nat, Text> {
    let result = EmployeeLib.addEmployee(employees, nextEmpId.value, emp);
    switch (result) {
      case (#ok(id)) { nextEmpId.value += 1; #ok(id) };
      case (#err(e)) { #err(e) };
    };
  };

  public func updateEmployee(emp_id : Nat, emp : EmployeeTypes.UpdateEmployee) : async Common.Result<(), Text> {
    EmployeeLib.updateEmployee(employees, emp_id, emp);
  };

  public func deleteEmployee(emp_id : Nat) : async Common.Result<(), Text> {
    EmployeeLib.deleteEmployee(employees, emp_id);
  };

  public query func getEmployees() : async [EmployeeTypes.Employee] {
    EmployeeLib.getEmployees(employees);
  };

  public query func getAllEmployees() : async [EmployeeTypes.Employee] {
    EmployeeLib.getAllEmployees(employees);
  };

  public query func getEmployee(emp_id : Nat) : async ?EmployeeTypes.Employee {
    EmployeeLib.getEmployee(employees, emp_id);
  };

  public query func getEmployeeByBiometricId(bio_id : Text) : async ?EmployeeTypes.Employee {
    EmployeeLib.getEmployeeByBiometricId(employees, bio_id);
  };
};
