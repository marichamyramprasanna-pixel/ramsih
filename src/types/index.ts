export type RiskLevel = 'healthy' | 'low' | 'medium' | 'high' | 'critical';

export type AssetCategory = 
  | 'core-datacenter'
  | 'cloud-cluster'
  | 'gateway-firewall'
  | 'database'
  | 'app-service'
  | 'endpoint-workstation'
  | 'iot-edge';

export interface Vulnerability {
  id: string;
  cve: string;
  title: string;
  severity: RiskLevel;
  cvss: number;
  exploitAvailable: boolean;
  attackVector: 'Network' | 'Adjacent' | 'Local' | 'Physical';
  description: string;
  remediation: string;
}

export interface InfrastructureNode {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  category: AssetCategory;
  tier: 'Perimeter' | 'Ingress' | 'Application' | 'Core Data' | 'Management';
  riskScore: number; // 0 to 100
  compromiseProbability: number; // 0 to 100%
  businessCriticality: 'Tier 1' | 'Tier 2' | 'Tier 3';
  financialExposure: number; // in USD
  status: 'online' | 'degraded' | 'under-investigation' | 'quarantined';
  lastUpdated: string;
  position3D: [number, number, number];
  connections: string[]; // Connected node IDs
  vulnerabilities: Vulnerability[];
  anomaliesCount: number;
  cpuLoad: number;
  dataThroughputMbps: number;
  operatingSystem: string;
  environment: 'AWS us-east-1' | 'GCP asia-east' | 'On-Premises Core' | 'Edge DC';
  owner: string;
  description: string;
}

export interface DataFlowLink {
  id: string;
  source: string;
  target: string;
  protocol: 'HTTPS' | 'gRPC' | 'TLS-DB' | 'SSH' | 'IPSec';
  trafficVolumeMbps: number;
  isSuspicious: boolean;
  threatLabel?: string;
}

export interface AnomalyDetection {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  detectedAt: string;
  severity: RiskLevel;
  compromiseProbability: number;
  mitreTactic: string;
  mitreTechnique: string;
  description: string;
  evidence: string[];
  status: 'active' | 'investigating' | 'contained' | 'resolved';
}

export interface Investigation {
  id: string;
  title: string;
  incidentCommander: string;
  startedAt: string;
  severity: RiskLevel;
  status: 'open' | 'containment-in-progress' | 'mitigated' | 'closed';
  targetAssetIds: string[];
  threatVector: string;
  estimatedLossAvoided: number;
  timeline: {
    timestamp: string;
    event: string;
    actor: string;
    type: 'alert' | 'action' | 'forensic' | 'containment';
  }[];
  mitigationSteps: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  targetAssetId: string;
  targetAssetName: string;
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Moderate';
  effortDays: number;
  estimatedCostUSD: number;
  riskReductionScore: number;
  financialRiskReductionUSD: number;
  status: 'pending' | 'applied' | 'in-review';
  actionType: 'Patching' | 'Segmentation' | 'Credential Rotation' | 'WAF Rule' | 'Egress Lockdown';
  description: string;
}

export type RemediationRecommendation = Recommendation;

export interface ThreatIntelligenceReport {
  id: string;
  threatActor: string;
  campaignName: string;
  targetedIndustries: string[];
  targetedCVEs: string[];
  confidence: 'High' | 'Medium' | 'Confirmed';
  summary: string;
  firstSeen: string;
  iocs: string[];
}

export interface FAIRMetrics {
  totalExpectedLossUSD: number;
  annualizedLossExposureUSD: number;
  singleLossExpectancyUSD: number;
  valueAtRisk95PercentileUSD: number;
  lossFrequencyPerYear: number;
  lossMagnitudeMinUSD: number;
  lossMagnitudeMaxUSD: number;
  lossMagnitudeProbableUSD: number;
}

export interface EnterpriseRiskSummary {
  enterpriseRiskScore: number; // 0 - 100 (primary)
  overallRiskScore: number; // 0 - 100 (alias for compatibility)
  riskLevel: 'Healthy' | 'Low' | 'Medium' | 'High' | 'Critical' | RiskLevel;
  monitoredDevices: number;
  activeAssetsCount: number; // alias
  compromisedDevices: number;
  highRiskAssetsCount: number; // alias
  criticalIncidents: number;
  criticalAnomaliesCount: number; // alias
  estimatedFinancialExposure: number;
  currency: string;
  riskTrend: number; // e.g. -4.2%
  fairMetrics: FAIRMetrics;
  industryBenchmarkScore: number;
  compliancePosturePercentage: number;
  topThreatCategory?: string;
  lastUpdated?: string;
}

export type ViewerQuality = 'auto' | 'high' | 'medium' | 'low';

export interface UserPreferences {
  theme: 'dark';
  quality: ViewerQuality;
  qualityPreset?: ViewerQuality;
  autoRotate: boolean;
  showLabels: boolean;
  showRiskOverlay: boolean;
  showDataFlow: boolean;
  reducedMotion: boolean;
  simulatedLiveUpdates: boolean;
  prefer2DMap: boolean;
  accessibilityMode?: boolean;
}
