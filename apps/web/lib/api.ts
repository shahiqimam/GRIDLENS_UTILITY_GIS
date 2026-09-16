export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthenticatedUser;
};

export type NetworkSummary = {
  substations: number;
  feeders: number;
  nodes: number;
  segments: number;
  transformers: number;
  serviceAreas: number;
  estimatedCustomers: number;
};

export type FeederOverview = {
  id: string;
  code: string;
  name: string;
  status: string;
  estimatedCustomerCount: number;
};

export type GeoJsonFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, Record<string, unknown>>;

export type OpenIncident = {
  id: string;
  incidentNumber: string;
  title: string;
  description: string | null;
  source: string;
  sourceFaultId: string | null;
  feederId: string | null;
  priority: string;
  status: string;
  openedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  metadata: Record<string, unknown>;
};

export type Crew = {
  id: string;
  code: string;
  name: string;
  specialty: string;
  status: string;
  homeBase: string;
  currentLatitude: number;
  currentLongitude: number;
  shiftEndsAt: string;
};

export type WorkOrder = {
  id: string;
  workOrderNumber: string;
  incidentId: string;
  crewId: string;
  crewCode?: string;
  status: string;
  summary: string;
  assignedAt: string;
  completedAt: string | null;
  metadata: Record<string, unknown>;
};
export type ActiveFault = {
  id: string;
  fingerprint: string;
  faultType: string;
  assetType: string;
  assetId: string;
  feederId: string | null;
  severity: string;
  status: string;
  firstDetectedAt: string;
  lastDetectedAt: string;
  evidence: Record<string, unknown>;
};

async function request<T>(path: string, token?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", undefined, {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function getNetworkSummary(token: string): Promise<NetworkSummary> {
  return request<NetworkSummary>("/network/summary", token);
}

export function getFeeders(token: string): Promise<FeederOverview[]> {
  return request<FeederOverview[]>("/network/feeders", token);
}

export function getMapLayer(token: string, layer: "substations" | "segments" | "transformers" | "service-areas"): Promise<GeoJsonFeatureCollection> {
  const viewport = "west=-97&south=32&east=-96&north=33&limit=1000";
  return request<GeoJsonFeatureCollection>(`/map/${layer}?${viewport}`, token);
}
export function getActiveFaults(token: string): Promise<ActiveFault[]> {
  return request<ActiveFault[]>("/rules/faults/active", token);
}
export function getOpenIncidents(token: string): Promise<OpenIncident[]> {
  return request<OpenIncident[]>("/incidents/open", token);
}
export function acknowledgeIncident(token: string, id: string): Promise<OpenIncident> {
  return request<OpenIncident>(`/incidents/${id}/acknowledge`, token, { method: "POST" });
}

export function resolveIncident(token: string, id: string): Promise<OpenIncident> {
  return request<OpenIncident>(`/incidents/${id}/resolve`, token, { method: "POST" });
}
export function getCrews(token: string): Promise<Crew[]> {
  return request<Crew[]>("/dispatch/crews", token);
}

export function getOpenWorkOrders(token: string): Promise<WorkOrder[]> {
  return request<WorkOrder[]>("/dispatch/work-orders/open", token);
}

export function dispatchIncident(token: string, incidentId: string): Promise<WorkOrder> {
  return request<WorkOrder>(`/dispatch/incidents/${incidentId}/work-orders`, token, { method: "POST" });
}