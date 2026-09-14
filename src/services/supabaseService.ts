import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { InfrastructureNode, RemediationRecommendation, AnomalyDetection } from '../types';

export class SupabaseDatabaseService {
  
  // Fetch Infrastructure Nodes from Supabase
  public async fetchNodes(): Promise<InfrastructureNode[] | null> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase.from('nodes').select('*');
      if (error || !data) {
        console.warn('[Supabase] Failed to fetch nodes:', error?.message);
        return null;
      }

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        hostname: row.hostname || row.name.toLowerCase().replace(/\s+/g, '-'),
        ipAddress: row.ip_address || row.ip || '10.0.0.1',
        category: row.category || 'database',
        tier: row.tier || 'Application',
        riskScore: row.risk_score ?? 15,
        compromiseProbability: row.compromise_probability ?? 5,
        businessCriticality: row.business_criticality || 'Tier 2',
        financialExposure: Number(row.financial_exposure_usd || 100000),
        status: row.status || 'online',
        lastUpdated: row.last_updated || 'Just now',
        position3D: Array.isArray(row.position_3d) ? row.position_3d : [0, 0, 0],
        connections: Array.isArray(row.connections) ? row.connections : [],
        vulnerabilities: Array.isArray(row.vulnerabilities) ? row.vulnerabilities : [],
        anomaliesCount: row.anomalies_count ?? 0,
        cpuLoad: row.cpu_load ?? 25,
        dataThroughputMbps: row.network_throughput_mbps ?? 100,
        operatingSystem: row.operating_system || 'Linux Ubuntu 22.04 LTS',
        environment: row.location || 'AWS us-east-1',
        owner: row.owner || 'SecOps Infra Team',
        description: row.description || 'Enterprise Infrastructure Node'
      }));
    } catch (e) {
      console.warn('[Supabase] Fetch nodes exception:', e);
      return null;
    }
  }

  // Save/Upsert Node to Supabase
  public async saveNode(node: InfrastructureNode): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase.from('nodes').upsert({
        id: node.id,
        name: node.name,
        hostname: node.hostname,
        ip_address: node.ipAddress,
        category: node.category,
        tier: node.tier,
        risk_score: node.riskScore,
        compromise_probability: node.compromiseProbability,
        business_criticality: node.businessCriticality,
        financial_exposure_usd: node.financialExposure,
        status: node.status,
        last_updated: node.lastUpdated,
        position_3d: node.position3D,
        connections: node.connections,
        vulnerabilities: node.vulnerabilities,
        anomalies_count: node.anomaliesCount,
        cpu_load: node.cpuLoad,
        network_throughput_mbps: node.dataThroughputMbps,
        operating_system: node.operatingSystem,
        location: node.environment,
        owner: node.owner,
        description: node.description,
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.error('[Supabase] Error saving node:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[Supabase] Exception saving node:', err);
      return false;
    }
  }

  // Delete Node from Supabase
  public async deleteNode(nodeId: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase.from('nodes').delete().eq('id', nodeId);
      if (error) {
        console.error('[Supabase] Error deleting node:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[Supabase] Exception deleting node:', err);
      return false;
    }
  }

  // Sync entire local dataset to Supabase Database (1-click cloud push)
  public async syncAllToCloud(
    nodes: InfrastructureNode[],
    recommendations: RemediationRecommendation[],
    anomalies: AnomalyDetection[]
  ): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return { success: false, message: 'Supabase credentials are not configured.' };
    }

    try {
      // Upsert Nodes
      const nodeRows = nodes.map(n => ({
        id: n.id,
        name: n.name,
        hostname: n.hostname,
        ip_address: n.ipAddress,
        category: n.category,
        tier: n.tier,
        risk_score: n.riskScore,
        compromise_probability: n.compromiseProbability,
        business_criticality: n.businessCriticality,
        financial_exposure_usd: n.financialExposure,
        status: n.status,
        last_updated: n.lastUpdated,
        position_3d: n.position3D,
        connections: n.connections,
        vulnerabilities: n.vulnerabilities,
        anomalies_count: n.anomaliesCount,
        cpu_load: n.cpuLoad,
        network_throughput_mbps: n.dataThroughputMbps,
        operating_system: n.operatingSystem,
        location: n.environment,
        owner: n.owner,
        description: n.description
      }));

      const { error: nodeErr } = await supabase.from('nodes').upsert(nodeRows);
      if (nodeErr) return { success: false, message: `Node sync error: ${nodeErr.message}` };

      // Upsert Recommendations
      const recRows = recommendations.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        target_asset_id: r.targetAssetId,
        target_asset_name: r.targetAssetName,
        priority: r.priority,
        effort_days: r.effortDays,
        estimated_cost_usd: r.estimatedCostUSD,
        risk_reduction_score: r.riskReductionScore,
        financial_risk_reduction_usd: r.financialRiskReductionUSD,
        status: r.status,
        action_type: r.actionType
      }));

      const { error: recErr } = await supabase.from('recommendations').upsert(recRows);
      if (recErr) return { success: false, message: `Recommendation sync error: ${recErr.message}` };

      // Upsert Anomalies
      const anomRows = anomalies.map(a => ({
        id: a.id,
        title: a.title,
        asset_id: a.assetId,
        asset_name: a.assetName,
        severity: a.severity,
        compromise_probability: a.compromiseProbability,
        mitre_tactic: a.mitreTactic,
        mitre_technique: a.mitreTechnique,
        description: a.description,
        evidence: a.evidence,
        detected_at: a.detectedAt,
        status: a.status
      }));

      const { error: anomErr } = await supabase.from('anomalies').upsert(anomRows);
      if (anomErr) return { success: false, message: `Anomaly sync error: ${anomErr.message}` };

      return {
        success: true,
        message: `Cloud Sync complete! Successfully synchronized ${nodes.length} nodes, ${recommendations.length} recommendations, and ${anomalies.length} anomalies to Supabase.`
      };
    } catch (err: any) {
      return { success: false, message: `Cloud sync failed: ${err?.message || 'Unknown error'}` };
    }
  }
}

export const supabaseDatabaseService = new SupabaseDatabaseService();
