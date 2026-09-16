export type IncidentView = {
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
export type IncidentActionActor = {
  id: string;
  email: string;
  role: string;
};
export type IncidentImpactView = {
  incidentId: string;
  incidentNumber: string;
  feederId: string | null;
  affected: {
    nodes: number;
    segments: number;
    transformers: number;
    serviceAreas: number;
    estimatedCustomers: number;
  };
  nodeIds: string[];
  segmentIds: string[];
  transformerIds: string[];
  serviceAreaIds: string[];
  stoppedAtOpenSwitchNodeIds: string[];
};