export type CrewView = {
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

export type WorkOrderView = {
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