import List "mo:core/List";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AdvanceTypes "../types/advance";
import EmployeeTypes "../types/employee";
import Common "../types/common";

module {
  public type AdvanceRequest = AdvanceTypes.AdvanceRequest;
  public type AdvanceRequestWithName = AdvanceTypes.AdvanceRequestWithName;
  public type Employee = EmployeeTypes.Employee;

  // Build YYYY-MM-DD for last day of given month/year
  func lastDayOfMonth(month : Text, year : Text) : Text {
    let mm = switch (Int.fromText(month)) { case (?m) m; case null 1 };
    let yy = switch (Int.fromText(year)) { case (?y) y; case null 1970 };
    let days : Int = switch (mm) {
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
    let mmPad = if (mm < 10) { "0" # mm.toText() } else { mm.toText() };
    let ddPad = if (days < 10) { "0" # days.toText() } else { days.toText() };
    yy.toText() # "-" # mmPad # "-" # ddPad;
  };

  public func submitAdvanceRequest(
    employees : List.List<Employee>,
    advances : List.List<AdvanceRequest>,
    nextId : Nat,
    emp_id : Nat,
    amount : Float,
    repayment_months : Int,
    reason : Text,
  ) : Common.Result<Nat, Text> {
    switch (employees.find(func(e : Employee) : Bool { e.emp_id == emp_id and e.status == "Active" })) {
      case null { #err("Employee not found") };
      case (?_) {
        if (repayment_months <= 0) {
          return #err("Repayment months must be positive");
        };
        let monthly : Float = amount / repayment_months.toFloat();
        let todayNs = Time.now();
        let todaySecs = Int.abs(todayNs) / 1_000_000_000;
        let todayDate = epochDaysToDate(todaySecs / 86400);
        advances.add({
          advance_id = nextId;
          emp_id;
          request_date = todayDate;
          amount;
          reason;
          repayment_months;
          monthly_deduction = monthly;
          total_repaid = 0.0;
          status = "Pending";
          approved_date = null;
        });
        #ok(nextId);
      };
    };
  };

  public func approveAdvance(
    advances : List.List<AdvanceRequest>,
    advance_id : Nat,
    approved_date : Text,
  ) : Common.Result<(), Text> {
    let idx = advances.findIndex(func(a : AdvanceRequest) : Bool { a.advance_id == advance_id });
    switch (idx) {
      case null { #err("Advance request not found") };
      case (?i) {
        let rec = advances.at(i);
        advances.put(i, { rec with status = "Approved"; approved_date = ?approved_date });
        #ok(());
      };
    };
  };

  public func rejectAdvance(
    advances : List.List<AdvanceRequest>,
    advance_id : Nat,
  ) : Common.Result<(), Text> {
    let idx = advances.findIndex(func(a : AdvanceRequest) : Bool { a.advance_id == advance_id });
    switch (idx) {
      case null { #err("Advance request not found") };
      case (?i) {
        let rec = advances.at(i);
        advances.put(i, { rec with status = "Rejected" });
        #ok(());
      };
    };
  };

  public func getAdvanceRequests(
    employees : List.List<Employee>,
    advances : List.List<AdvanceRequest>,
  ) : [AdvanceRequestWithName] {
    let sorted = advances
      .sort(func(a : AdvanceRequest, b : AdvanceRequest) : { #less; #equal; #greater } {
        let ord = Text.compare(a.request_date, b.request_date);
        switch (ord) {
          case (#less) #greater;
          case (#greater) #less;
          case (#equal) #equal;
        };
      });
    sorted.toArray().map<AdvanceRequest, AdvanceRequestWithName>(func(a : AdvanceRequest) : AdvanceRequestWithName {
      let empName = switch (employees.find(func(e : Employee) : Bool { e.emp_id == a.emp_id })) {
        case (?e) { e.name };
        case null { "Unknown" };
      };
      {
        advance_id = a.advance_id;
        emp_id = a.emp_id;
        emp_name = empName;
        request_date = a.request_date;
        amount = a.amount;
        reason = a.reason;
        repayment_months = a.repayment_months;
        monthly_deduction = a.monthly_deduction;
        total_repaid = a.total_repaid;
        status = a.status;
        approved_date = a.approved_date;
      };
    });
  };

  public func getAdvanceRequestsByEmployee(
    advances : List.List<AdvanceRequest>,
    emp_id : Nat,
  ) : [AdvanceRequest] {
    advances.filter(func(a : AdvanceRequest) : Bool { a.emp_id == emp_id }).toArray();
  };

  public func getTotalAdvanceDeduction(
    advances : List.List<AdvanceRequest>,
    emp_id : Nat,
    month : Text,
    year : Text,
  ) : Float {
    let lastDay = lastDayOfMonth(month, year);
    advances.foldLeft<Float, AdvanceRequest>(
      0.0,
      func(acc : Float, a : AdvanceRequest) : Float {
        if (a.emp_id != emp_id or a.status != "Approved") {
          return acc;
        };
        switch (a.approved_date) {
          case null { acc };
          case (?ad) {
            if (Text.compare(ad, lastDay) != #greater) {
              acc + a.monthly_deduction;
            } else {
              acc;
            };
          };
        };
      },
    );
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
