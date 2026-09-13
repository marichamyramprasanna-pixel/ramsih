import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  ArrowUpRight, 
  Layers, 
  Server,
  ArrowRight
} from 'lucide-react';
import { EnterpriseRiskSummary, InfrastructureNode, AnomalyDetection } from '../types';

interface DashboardPageProps {
  riskSummary: EnterpriseRiskSummary;
  nodes: InfrastructureNode[];
  anomalies: AnomalyDetection[];
  onNavigate: (route: string) => void;
  onSelectNode: (nodeId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  riskSummary,
  nodes,
  anomalies,
  onNavigate,
  onSelectNode
}) => {
  // Tier breakdown calculation
  const tiers = ['Perimeter', 'Ingress', 'Application', 'Core Data', 'Management'] as const;
  const tierStats = tiers.map((tier) => {
    const tierNodes = nodes.filter((n) => n.tier === tier);
    const avgRisk = tierNodes.length
      ? Math.round(tierNodes.reduce((acc, n) => acc + n.riskScore, 0) / tierNodes.length)
      : 0;
    const exposure = tierNodes.reduce((acc, n) => acc + n.financialExposure, 0);
    return { tier, count: tierNodes.length, avgRisk, exposure };
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Risk Overview</h1>
          <p className="text-xs text-slate-400">
            Continuous quantification of cyber vulnerability posture, financial loss exposure, and threat vectors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/infrastructure')}
            className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Launch 3D Explorer</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('/recommendations')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Remediation Roadmap</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Aggregated Risk Posture</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono ${
              riskSummary.overallRiskScore >= 70 ? 'text-red-400' : 'text-amber-400'
            }`}>
              {riskSummary.overallRiskScore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{riskSummary.riskTrend}% vs 30-day baseline</span>
          </div>
        </div>

        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>FAIR Total Expected Loss</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-300">
            ${(riskSummary.fairMetrics.totalExpectedLossUSD / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-400">
            ALE: ${(riskSummary.fairMetrics.annualizedLossExposureUSD / 1000000).toFixed(2)}M / yr
          </div>
        </div>

        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Value at Risk (95% Conf)</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-300">
            ${(riskSummary.fairMetrics.valueAtRisk95PercentileUSD / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-400">
            Probable single incident: ${(riskSummary.fairMetrics.lossMagnitudeProbableUSD / 1000000).toFixed(2)}M
          </div>
        </div>

        <div className="p-4 bg-[#090d15] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Compliance Posture</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-300">
            {riskSummary.compliancePosturePercentage}%
          </div>
          <div className="text-[11px] text-slate-400">
            SOC2 Type II & ISO 27001 Controls
          </div>
        </div>
      </div>

      {/* Middle Grid: Tier Risk Distribution & Exposure Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tier Risk Analysis */}
        <div className="lg:col-span-7 p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Risk Distribution Across Architectural Tiers</span>
              </h2>
              <p className="text-xs text-slate-400">Quantified exposure and vulnerability scores per infrastructure segment</p>
            </div>
          </div>

          <div className="space-y-3">
            {tierStats.map((stat) => (
              <div key={stat.tier} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{stat.tier}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({stat.count} assets)</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11px]">
                    <span className="text-slate-400">${(stat.exposure / 1000000).toFixed(1)}M Exposure</span>
                    <span className={`font-bold ${
                      stat.avgRisk >= 70 ? 'text-red-400' : stat.avgRisk >= 50 ? 'text-orange-400' : 'text-emerald-400'
                    }`}>
                      Score: {stat.avgRisk}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      stat.avgRisk >= 70 ? 'bg-red-500' : stat.avgRisk >= 50 ? 'bg-orange-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${stat.avgRisk}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Behavioral Detections Stream */}
        <div className="lg:col-span-5 p-5 bg-[#090d15] border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Active Threat Signals</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 font-mono border border-red-800">
                {anomalies.filter(a => a.status === 'active').length} Active
              </span>
            </div>

            <div className="space-y-2.5">
              {anomalies.slice(0, 3).map((anom) => (
                <div
                  key={anom.id}
                  onClick={() => {
                    onSelectNode(anom.assetId);
                    onNavigate('/infrastructure');
                  }}
                  className="p-3 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl space-y-1 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-red-400 font-semibold">{anom.mitreTechnique}</span>
                    <span className="text-[10px] text-slate-500">{anom.detectedAt}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {anom.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Asset: {anom.assetName}</span>
                    <span className="text-cyan-400 text-[10px] flex items-center gap-0.5">
                      Focus 3D <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('/detections')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Open All Behavioral Detections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
