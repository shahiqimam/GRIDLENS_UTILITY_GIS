export type OperationsAnalyticsView = {
  incidents: {
    open: number;
    acknowledged: number;
    resolved: number;
  };
  workOrders: {
    assigned: number;
    enRoute: number;
    onSite: number;
    complete: number;
  };
  crews: {
    available: number;
    assigned: number;
    offline: number;
  };
  risk: {
    estimatedCustomers: number;
    impactedFeeders: number;
  };
};