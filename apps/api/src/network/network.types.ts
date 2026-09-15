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
