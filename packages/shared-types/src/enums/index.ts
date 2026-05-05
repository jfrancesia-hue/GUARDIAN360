export enum TenantType {
  Province = "PROVINCE",
  Municipality = "MUNICIPALITY",
  Agency = "AGENCY"
}

export enum UserRole {
  SuperAdmin = "SUPER_ADMIN",
  TenantAdmin = "TENANT_ADMIN",
  Operator = "OPERATOR",
  Officer = "OFFICER",
  Analyst = "ANALYST",
  Citizen = "CITIZEN"
}

export enum Severity {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL"
}

export enum EventStatus {
  New = "NEW",
  Acknowledged = "ACKNOWLEDGED",
  Dispatched = "DISPATCHED",
  Resolved = "RESOLVED",
  FalsePositive = "FALSE_POSITIVE"
}

export enum EventType {
  Weapon = "WEAPON",
  Fight = "FIGHT",
  Fall = "FALL",
  LicensePlate = "LICENSE_PLATE",
  PanicButton = "PANIC_BUTTON",
  FireHotspot = "FIRE_HOTSPOT",
  BorderAlert = "BORDER_ALERT"
}
