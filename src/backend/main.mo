import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Pre-register owners as admin
  let ownerPrincipal = Principal.fromText("4tqti-hjtqd-lw5wl-y2qjy-dnnbe-nsseh-qdwqa-bfyjb-o65fm-4telm-sqe");
  accessControlState.userRoles.add(ownerPrincipal, #admin);
  let ownerPrincipal2 = Principal.fromText("wubtp-ryfgm-wshbl-ffrtx-x2not-hgupb-e67m4-xtdn2-tynus-ghibd-wae");
  accessControlState.userRoles.add(ownerPrincipal2, #admin);
  accessControlState.adminAssigned := true;

  type OrderId = Nat;
  type ContactId = Nat;

  type ProductSize = {
    #_500ml;
    #_1000ml;
  };

  type OrderStatus = {
    #pending;
    #confirmed;
    #fulfilled;
  };

  public type PriceConfig = {
    price500ml : Nat;
    price1000ml : Nat;
    discount500ml : ?Nat;
    discount1000ml : ?Nat;
    offerLabel500ml : ?Text;
    offerLabel1000ml : ?Text;
  };

  public type Order = {
    productSize : ProductSize;
    quantity : Nat;
    customText : Text;
    colorPreferences : Text;
    logoBlob : ?Storage.ExternalBlob;
    customerName : Text;
    phone : Text;
    email : Text;
    deliveryAddress : Text;
    status : OrderStatus;
    timestamp : Int;
  };

  public type ContactMessage = {
    name : Text;
    email : Text;
    phone : ?Text;
    message : Text;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  let orders = Map.empty<OrderId, Order>();
  let contacts = Map.empty<ContactId, ContactMessage>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextOrderId = 1;
  var nextContactId = 1;

  var priceConfig : PriceConfig = {
    price500ml = 9;
    price1000ml = 12;
    discount500ml = null;
    discount1000ml = null;
    offerLabel500ml = null;
    offerLabel1000ml = null;
  };

  public query func getPrices() : async PriceConfig {
    priceConfig;
  };

  public shared ({ caller }) func updatePrices(config : PriceConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update prices");
    };
    priceConfig := config;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func submitOrder(order : Order) : async OrderId {
    let orderId = nextOrderId;
    nextOrderId += 1;
    let newOrder : Order = { order with status = #pending; timestamp = Time.now() };
    orders.add(orderId, newOrder);
    orderId;
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.toArray().values().map(func((_, o)) { o }).toArray();
  };

  public query ({ caller }) func getOrderById(orderId : OrderId) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { orders.add(orderId, { order with status }) };
    };
  };

  public shared ({ caller }) func submitContactMessage(message : ContactMessage) : async ContactId {
    let contactId = nextContactId;
    nextContactId += 1;
    contacts.add(contactId, { message with timestamp = Time.now() });
    contactId;
  };

  public query ({ caller }) func getAllContactMessages() : async [ContactMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view contact messages");
    };
    contacts.toArray().values().map(func((_, m)) { m }).toArray();
  };
};
