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

export type DownstreamTraceResult = {
  traceId: string;
  feederId: string;
  startNodeId: string;
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
