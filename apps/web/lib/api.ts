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