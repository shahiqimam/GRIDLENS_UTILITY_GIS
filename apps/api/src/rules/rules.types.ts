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
export type DetectedFaultView = {
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