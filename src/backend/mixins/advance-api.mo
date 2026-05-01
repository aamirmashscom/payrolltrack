import List "mo:core/List";
import AdvanceLib "../lib/advance";
import AdvanceTypes "../types/advance";
import EmployeeTypes "../types/employee";
import Common "../types/common";

mixin (
  employees : List.List<EmployeeTypes.Employee>,
  advances : List.List<AdvanceTypes.AdvanceRequest>,
  nextAdvanceId : Common.Counter
) {
  public func submitAdvanceRequest(emp_id : Nat, amount : Float, repayment_months : Int, reason : Text) : async Common.Result<Nat, Text> {
    let result = AdvanceLib.submitAdvanceRequest(employees, advances, nextAdvanceId.value, emp_id, amount, repayment_months, reason);
    switch (result) {
      case (#ok(id)) { nextAdvanceId.value += 1; #ok(id) };
      case (#err(e)) { #err(e) };
    };
  };

  public func approveAdvance(advance_id : Nat, approved_date : Text) : async Common.Result<(), Text> {
    AdvanceLib.approveAdvance(advances, advance_id, approved_date);
  };

  public func rejectAdvance(advance_id : Nat) : async Common.Result<(), Text> {
    AdvanceLib.rejectAdvance(advances, advance_id);
  };

  public query func getAdvanceRequests() : async [AdvanceTypes.AdvanceRequestWithName] {
    AdvanceLib.getAdvanceRequests(employees, advances);
  };

  public query func getAdvanceRequestsByEmployee(emp_id : Nat) : async [AdvanceTypes.AdvanceRequest] {
    AdvanceLib.getAdvanceRequestsByEmployee(advances, emp_id);
  };

  public query func getTotalAdvanceDeduction(emp_id : Nat, month : Text, year : Text) : async Float {
    AdvanceLib.getTotalAdvanceDeduction(advances, emp_id, month, year);
  };
};
