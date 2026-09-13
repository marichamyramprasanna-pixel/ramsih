import {
  InfrastructureNode,
  DataFlowLink,
  AnomalyDetection,
  Investigation,
  Recommendation,
  ThreatIntelligenceReport,
  EnterpriseRiskSummary,
  UserPreferences
} from '../types';
import {
  INITIAL_NODES,
  INITIAL_DATA_FLOWS,
  INITIAL_ANOMALIES,
  INITIAL_INVESTIGATIONS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_THREAT_INTEL,
  INITIAL_ENTERPRISE_RISK
} from '../data/cyberData';

export interface AppState {
  nodes: InfrastructureNode[];
  links: DataFlowLink[];
  anomalies: AnomalyDetection[];
  investigations: Investigation[];
  recommendations: Recommendation[];
  threatIntel: ThreatIntelligenceReport[];
  riskSummary: EnterpriseRiskSummary;
  userPreferences: UserPreferences;
}

class CyberRiskApiService {
  private nodes: InfrastructureNode[] = [];
  private dataFlows: DataFlowLink[] = [];
  private anomalies: AnomalyDetection[] = [];
  private investigations: Investigation[] = [];
  private recommendations: Recommendation[] = [];
  private threatIntel: ThreatIntelligenceReport[] = [];
  private riskSummary: EnterpriseRiskSummary = { ...INITIAL_ENTERPRISE_RISK };
  private userPreferences: UserPreferences = {
    theme: 'dark',
    quality: 'auto',
    autoRotate: true,
    showLabels: true,
    showRiskOverlay: true,
    showDataFlow: true,
    reducedMotion: false,
    simulatedLiveUpdates: true,
    prefer2DMap: false
  };

  private listeners: Set<(state: AppState) => void> = new Set();
  private simulationTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedNodes = localStorage.getItem('aegis_nodes');
      const savedRecs = localStorage.getItem('aegis_recommendations');
      const savedAnom = localStorage.getItem('aegis_anomalies');
      const savedPrefs = localStorage.getItem('aegis_preferences');
      
      this.nodes = savedNodes ? JSON.parse(savedNodes) : [...INITIAL_NODES];
      this.recommendations = savedRecs ? JSON.parse(savedRecs) : [...INITIAL_RECOMMENDATIONS];
      this.anomalies = savedAnom ? JSON.parse(savedAnom) : [...INITIAL_ANOMALIES];
      if (savedPrefs) {
        this.userPreferences = { ...this.userPreferences, ...JSON.parse(savedPrefs) };
      }
      this.dataFlows = [...INITIAL_DATA_FLOWS];
      this.investigations = [...INITIAL_INVESTIGATIONS];
      this.threatIntel = [...INITIAL_THREAT_INTEL];
      this.recalculateSummary();
    } catch {
      this.nodes = [...INITIAL_NODES];
      this.recommendations = [...INITIAL_RECOMMENDATIONS];
      this.anomalies = [...INITIAL_ANOMALIES];
      this.dataFlows = [...INITIAL_DATA_FLOWS];
      this.investigations = [...INITIAL_INVESTIGATIONS];
      this.threatIntel = [...INITIAL_THREAT_INTEL];
      this.recalculateSummary();
    }
  }

  public getState(): AppState {
    return {
      nodes: this.nodes,
      links: this.dataFlows,
      anomalies: this.anomalies,
      investigations: this.investigations,
      recommendations: this.recommendations,
      threatIntel: this.threatIntel,
      riskSummary: this.riskSummary,
      userPreferences: this.userPreferences
    };
  }

  public getNodes(): InfrastructureNode[] {
    return this.nodes;
  }

  public getLinks(): DataFlowLink[] {
    return this.dataFlows;
  }

  public getAnomalies(): AnomalyDetection[] {
    return this.anomalies;
  }

  public getInvestigations(): Investigation[] {
    return this.investigations;
  }

  public getRecommendations(): Recommendation[] {
    return this.recommendations;
  }

  public getThreatIntel(): ThreatIntelligenceReport[] {
    return this.threatIntel;
  }

  public getRiskSummary(): EnterpriseRiskSummary {
    return this.riskSummary;
  }

  public getPreferences(): UserPreferences {
    return this.userPreferences;
  }

  public subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  private persist() {
    try {
      localStorage.setItem('aegis_nodes', JSON.stringify(this.nodes));
      localStorage.setItem('aegis_recommendations', JSON.stringify(this.recommendations));
      localStorage.setItem('aegis_anomalies', JSON.stringify(this.anomalies));
      localStorage.setItem('aegis_preferences', JSON.stringify(this.userPreferences));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  private recalculateSummary() {
    const highRiskCount = this.nodes.filter(n => n.riskScore >= 70).length;
    const criticalAnoms = this.anomalies.filter(a => a.severity === 'critical' && a.status === 'active').length;
    const totalExposure = this.nodes.reduce((acc, n) => acc + n.financialExposure, 0);
    const avgRisk = Math.round(this.nodes.reduce((acc, n) => acc + n.riskScore, 0) / (this.nodes.length || 1));

    this.riskSummary = {
      ...this.riskSummary,
      overallRiskScore: avgRisk,
      highRiskAssetsCount: highRiskCount,
      criticalAnomaliesCount: criticalAnoms,
      activeAssetsCount: this.nodes.filter(n => n.status !== 'quarantined').length,
      fairMetrics: {
        ...this.riskSummary.fairMetrics,
        totalExpectedLossUSD: Math.round(totalExposure * (avgRisk / 100) * 0.4),
        annualizedLossExposureUSD: Math.round(totalExposure * (avgRisk / 100) * 0.16)
      }
    };
  }

  // Live Telemetry Simulation
  public startLiveSimulation(intervalMs: number = 4500): () => void {
    this.stopLiveSimulation();
    this.simulationTimer = setInterval(() => {
      // Fluctuate cpu load and throughput on random nodes
      const randomNodeIdx = Math.floor(Math.random() * this.nodes.length);
      const targetNode = this.nodes[randomNodeIdx];
      if (targetNode && targetNode.status !== 'quarantined') {
        const deltaLoad = Math.floor(Math.random() * 9) - 4;
        targetNode.cpuLoad = Math.min(98, Math.max(12, targetNode.cpuLoad + deltaLoad));
        targetNode.lastUpdated = 'A few seconds ago';
      }

      // Randomly pulse data flows
      const randomFlowIdx = Math.floor(Math.random() * this.dataFlows.length);
      const targetFlow = this.dataFlows[randomFlowIdx];
      if (targetFlow) {
        targetFlow.trafficVolumeMbps = Math.round(targetFlow.trafficVolumeMbps * (0.95 + Math.random() * 0.1));
      }

      this.notify();
    }, intervalMs);

    return () => this.stopLiveSimulation();
  }

  public stopLiveSimulation(): void {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
  }

  // Mutation Actions
  public async applyRecommendation(recId: string): Promise<boolean> {
    const rec = this.recommendations.find(r => r.id === recId);
    if (!rec) return false;

    rec.status = 'applied';

    // Find and heal the targeted asset
    const node = this.nodes.find(n => n.id === rec.targetAssetId);
    if (node) {
      node.riskScore = Math.max(12, node.riskScore - rec.riskReductionScore);
      node.compromiseProbability = Math.max(5, Math.round(node.compromiseProbability * 0.45));
      node.financialExposure = Math.max(100000, node.financialExposure - rec.financialRiskReductionUSD);
      node.status = 'online';
      node.anomaliesCount = Math.max(0, node.anomaliesCount - 1);
      node.lastUpdated = 'Just now (Mitigation Applied)';
    }

    // Resolve any linked active anomaly
    const anom = this.anomalies.find(a => a.assetId === rec.targetAssetId && a.status === 'active');
    if (anom) {
      anom.status = 'contained';
    }

    this.recalculateSummary();
    this.persist();
    this.notify();

    return true;
  }

  public async quarantineAsset(assetId: string): Promise<boolean> {
    const node = this.nodes.find(n => n.id === assetId);
    if (!node) return false;

    node.status = node.status === 'quarantined' ? 'online' : 'quarantined';
    node.riskScore = node.status === 'quarantined' ? Math.max(15, node.riskScore - 25) : node.riskScore + 25;
    node.lastUpdated = 'Just now';

    this.recalculateSummary();
    this.persist();
    this.notify();
    return true;
  }

  public quarantineNode(assetId: string): Promise<boolean> {
    return this.quarantineAsset(assetId);
  }

  public addDevice(nodeData: Omit<InfrastructureNode, 'id' | 'lastUpdated'>): InfrastructureNode {
    const id = `node-dev-${Date.now()}`;
    const newDevice: InfrastructureNode = {
      ...nodeData,
      id,
      lastUpdated: 'Just now (Added)'
    };
    this.nodes.push(newDevice);
    this.recalculateSummary();
    this.persist();
    this.notify();
    return newDevice;
  }

  public deleteDevice(deviceId: string): boolean {
    const index = this.nodes.findIndex(n => n.id === deviceId);
    if (index === -1) return false;
    this.nodes.splice(index, 1);
    
    // Remove links connected to this device
    this.dataFlows = this.dataFlows.filter(l => l.source !== deviceId && l.target !== deviceId);
    // Remove anomalies connected to this device
    this.anomalies = this.anomalies.filter(a => a.assetId !== deviceId);

    this.recalculateSummary();
    this.persist();
    this.notify();
    return true;
  }

  public solveDeviceProblem(deviceId: string): boolean {
    const device = this.nodes.find(n => n.id === deviceId);
    if (!device) return false;

    // Heal device
    device.riskScore = 15; // Healthy score
    device.compromiseProbability = 4;
    device.vulnerabilities = [];
    device.status = 'online';
    device.anomaliesCount = 0;
    device.lastUpdated = 'Just now (Problems Solved & Patched)';

    // Contain associated anomalies
    this.anomalies.forEach(a => {
      if (a.assetId === deviceId) a.status = 'contained';
    });

    this.recalculateSummary();
    this.persist();
    this.notify();
    return true;
  }

  public updatePreferences(updates: Partial<UserPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...updates };
    this.persist();
    this.notify();
  }

  public resetToDefaults(): void {
    localStorage.removeItem('aegis_nodes');
    localStorage.removeItem('aegis_recommendations');
    localStorage.removeItem('aegis_anomalies');
    localStorage.removeItem('aegis_preferences');
    this.init();
    this.notify();
  }

  public resetState(): void {
    this.resetToDefaults();
  }
}

export const apiService = new CyberRiskApiService();
