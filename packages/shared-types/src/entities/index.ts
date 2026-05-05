import type { EventStatus, EventType, Severity, TenantType, UserRole } from "../enums";

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  type: TenantType;
  active: boolean;
}

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: UserRole;
  agency?: string;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface LiveEventSummary {
  id: string;
  tenantId: string;
  type: EventType;
  severity: Severity;
  status: EventStatus;
  confidence?: number;
  location?: GeoPoint;
  cameraId?: string;
  occurredAt: string;
  detectedAt: string;
}
