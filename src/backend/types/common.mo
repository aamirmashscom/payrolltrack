module {
  public type UserId = Nat;
  public type Timestamp = Text;
  public type Result<T, E> = { #ok : T; #err : E };
  public type Counter = { var value : Nat };
};
