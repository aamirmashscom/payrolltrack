module {
  public type AdvanceRequest = {
    advance_id : Nat;
    emp_id : Nat;
    request_date : Text;
    amount : Float;
    reason : Text;
    repayment_months : Int;
    monthly_deduction : Float;
    total_repaid : Float;
    status : Text;
    approved_date : ?Text;
  };

  public type AdvanceRequestWithName = {
    advance_id : Nat;
    emp_id : Nat;
    emp_name : Text;
    request_date : Text;
    amount : Float;
    reason : Text;
    repayment_months : Int;
    monthly_deduction : Float;
    total_repaid : Float;
    status : Text;
    approved_date : ?Text;
  };
};
