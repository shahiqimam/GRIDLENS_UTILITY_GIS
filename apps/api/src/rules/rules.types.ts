export type FaultRuleConfigView = {
  id: string;
  ruleType: string;
  enabled: boolean;
  assetType: string;
  warningThreshold: number | null;
  criticalThreshold: number | null;
  consecutiveCount: number | null;
  timeoutSeconds: number | null;
};

export type FaultEvaluationResult = {
  faultDetected: boolean;
  fingerprint?: string;
};
