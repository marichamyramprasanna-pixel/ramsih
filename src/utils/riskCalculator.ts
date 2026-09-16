import { 
  InfrastructureNode, 
  AnomalyDetection, 
  Investigation, 
  EnterpriseRiskSummary 
} from '../types';

/**
 * Enterprise Risk Score Calculation Function
 * Calculates a reliable numeric risk score between 0 and 100 based on:
 * - Behavioral anomaly score (25%)
 * - Asset compromise probability (35%)
 * - Asset business criticality (20%)
 * - Incident & threat severity (20%)
 */
export function calculateEnterpriseRiskScore(
  nodes: InfrastructureNode[],
  anomalies: AnomalyDetection[],
  investigations: Investigation[]
): number {
  if (!nodes || nodes.length === 0) {
    return 72; // Default benchmark fallback
  }

  // 1. Anomaly Score (0 - 100)
  const activeAnomalies = (anomalies || []).filter(a => a.status === 'active' || a.status === 'investigating');
  const anomalyScore = activeAnomalies.length === 0 ? 15 : Math.min(100, activeAnomalies.length * 25);

  // 2. Average Compromise Probability across monitored devices (0 - 100)
  const totalCompromiseProb = nodes.reduce((acc, n) => acc + (n.compromiseProbability || 0), 0);
  const avgCompromiseProb = totalCompromiseProb / (nodes.length || 1);

  // 3. Asset Criticality of High-Risk / Compromised Assets (0 - 100)
  const highRiskNodes = nodes.filter(n => n.riskScore >= 60 || n.status === 'degraded' || n.status === 'under-investigation' || n.status === 'quarantined');
  const criticalityWeight = highRiskNodes.reduce((acc, n) => {
    const weight = n.businessCriticality === 'Tier 1' ? 30 : n.businessCriticality === 'Tier 2' ? 20 : 10;
    return acc + weight;
  }, 0);
  const assetCriticalityScore = Math.min(100, criticalityWeight);

  // 4. Incident & Threat Severity (0 - 100)
  const openIncidents = (investigations || []).filter(i => i.status === 'open' || i.status === 'containment-in-progress');
  const incidentSeverityScore = openIncidents.length === 0 ? 10 : Math.min(100, openIncidents.length * 25);

  // Calculate Weighted Enterprise Score
  const rawScore = (
    anomalyScore * 0.25 +
    avgCompromiseProb * 0.35 +
    assetCriticalityScore * 0.20 +
    incidentSeverityScore * 0.20
  );

  // Clamp strictly between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return clampedScore;
}

/**
 * Calculates human-readable risk level string based on numeric score
 */
export function calculateRiskLevel(score: number): 'Healthy' | 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score < 25) return 'Healthy';
  if (score < 45) return 'Low';
  if (score < 65) return 'Medium';
  if (score < 85) return 'High';
  return 'Critical';
}

/**
 * Validates whether a value is a valid numeric risk score between 0 and 100
 */
export function isValidRiskScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
}

/**
 * Safe frontend formatting function that NEVER outputs undefined, null, or NaN
 */
export function formatRiskScore(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'Data unavailable';
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 'Data unavailable';
  }

  const clamped = Math.max(0, Math.min(100, Math.round(numericValue)));
  return `${clamped}/100`;
}

/**
 * Safe numeric extractor returning valid number or fallback
 */
export function parseNumericValue(value: unknown, fallback: number = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Standardized Fallback Telemetry Object (Demo Data Snapshot)
 */
export const FALLBACK_TELEMETRY: EnterpriseRiskSummary = {
  enterpriseRiskScore: 72,
  overallRiskScore: 72,
  riskLevel: 'High',
  monitoredDevices: 6,
  activeAssetsCount: 6,
  compromisedDevices: 1,
  highRiskAssetsCount: 1,
  criticalIncidents: 2,
  criticalAnomaliesCount: 2,
  estimatedFinancialExposure: 350000,
  currency: 'INR',
  riskTrend: -4.2,
  fairMetrics: {
    totalExpectedLossUSD: 350000,
    annualizedLossExposureUSD: 140000,
    singleLossExpectancyUSD: 85000,
    valueAtRisk95PercentileUSD: 520000,
    lossFrequencyPerYear: 1.8,
    lossMagnitudeMinUSD: 50000,
    lossMagnitudeMaxUSD: 1200000,
    lossMagnitudeProbableUSD: 350000
  },
  industryBenchmarkScore: 48,
  compliancePosturePercentage: 88,
  topThreatCategory: 'Cloud Container Escape & Unauthenticated API Ingress',
  lastUpdated: new Date().toISOString()
};
