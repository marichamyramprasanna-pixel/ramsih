import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { InfrastructureNode, RemediationRecommendation, AnomalyDetection, UserPreferences } from '../types';

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
        type: row.type,
        ip: row.ip,
        status: row.status,
        riskScore: row.risk_score,
        compromiseProbability: row.compromise_probability,
        vulnerabilities: Array.isArray(row.vulnerabilities) ? row.vulnerabilities : [],
        cpuLoad: row.cpu_load,
        memoryLoad: row.memory_load,
        networkThroughputMbps: row.network_throughput_mbps,
        financialExposure: Number(row.financial_exposure_usd),
        location: row.location,
        complianceStatus: row.compliance_status,
        lastUpdated: row.last_updated
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
        type: node.type,
        ip: node.ip,
        status: node.status,
        risk_score: node.riskScore,
        compromise_probability: node.compromiseProbability,
        vulnerabilities: node.vulnerabilities,
        cpu_load: node.cpuLoad,
        memory_load: node.memoryLoad,
        network_throughput_mbps: node.networkThroughputMbps,
        financial_exposure_usd: node.financialExposure,
        location: node.location,
        compliance_status: node.complianceStatus,
        last_updated: node.lastUpdated,
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
        type: n.type,
        ip: n.ip,
        status: n.status,
        risk_score: n.riskScore,
        compromise_probability: n.compromiseProbability,
        vulnerabilities: n.vulnerabilities,
        cpu_load: n.cpuLoad,
        memory_load: n.memoryLoad,
        network_throughput_mbps: n.networkThroughputMbps,
        financial_exposure_usd: n.financialExposure,
        location: n.location,
        compliance_status: n.complianceStatus,
        last_updated: n.lastUpdated
      }));

      const { error: nodeErr } = await supabase.from('nodes').upsert(nodeRows);
      if (nodeErr) return { success: false, message: `Node sync error: ${nodeErr.message}` };

      // Upsert Recommendations
      const recRows = recommendations.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        target_asset_id: r.targetAssetId,
        risk_reduction_score: r.riskReductionScore,
        financial_risk_reduction_usd: r.financialRiskReductionUSD,
        priority: r.priority,
        status: r.status,
        cve_id: r.cveId
      }));

      const { error: recErr } = await supabase.from('recommendations').upsert(recRows);
      if (recErr) return { success: false, message: `Recommendation sync error: ${recErr.message}` };

      // Upsert Anomalies
      const anomRows = anomalies.map(a => ({
        id: a.id,
        title: a.title,
        asset_id: a.assetId,
        severity: a.severity,
        type: a.type,
        description: a.description,
        timestamp: a.timestamp,
        status: a.status,
        attack_vector: a.attackVector,
        mitigation_suggested: a.mitigationSuggested
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
