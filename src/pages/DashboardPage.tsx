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
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { EnterpriseRiskSummary, InfrastructureNode, AnomalyDetection } from '../types';
import { formatRiskScore, parseNumericValue } from '../utils/riskCalculator';

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
  const currentScore = parseNumericValue(riskSummary.enterpriseRiskScore ?? riskSummary.overallRiskScore, 72);
  const formattedScoreText = formatRiskScore(currentScore);
  const monitoredCount = riskSummary.monitoredDevices ?? riskSummary.activeAssetsCount ?? nodes.length ?? 6;
  const compromisedCount = riskSummary.compromisedDevices ?? nodes.filter(n => n.status === 'under-investigation' || n.status === 'degraded' || n.riskScore >= 60).length ?? 1;
  const criticalCount = riskSummary.criticalIncidents ?? riskSummary.criticalAnomaliesCount ?? 2;
  const riskLevelStr = riskSummary.riskLevel || 'High';
  const financialExp = riskSummary.estimatedFinancialExposure ?? 350000;
  const currencySymbol = riskSummary.currency === 'INR' ? '₹' : '$';

  // SVG Gauge calculations
  const strokeDashoffset = 283 - (283 * (currentScore / 100));

  // Architectural Tiers
  const tiers = ['Perimeter', 'Ingress', 'Application', 'Core Data', 'Management'] as const;
  const tierStats = tiers.map((tier) => {
    const tierNodes = (nodes || []).filter((n) => n.tier === tier);
    const avgRisk = tierNodes.length
      ? Math.round(tierNodes.reduce((acc, n) => acc + n.riskScore, 0) / tierNodes.length)
      : 0;
    const exposure = tierNodes.reduce((acc, n) => acc + (n.financialExposure || 0), 0);
    return { tier, count: tierNodes.length, avgRisk, exposure };
  });

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1700px] mx-auto font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Floating Ambient Glowing Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl bg-orb-cyan pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl bg-orb-blue pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl bg-orb-cyan pointer-events-none" />
      
      {/* 1. TOP COMMAND CENTER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Cyber Risk Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-[10px] font-mono text-cyan-300 font-bold uppercase">
              FAIR Risk v3.2
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, behavioral anomaly detection, and continuous financial risk quantification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('/infrastructure')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-950"
          >
            <span>Launch 3D Topology</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onNavigate('/recommendations')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Remediation Plan</span>
          </button>
        </div>
      </div>

      {/* 2. TOP TELEMETRY KPI SUMMARY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-[#080d19] border border-slate-800/90 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Monitored Devices</span>
          <div className="text-2xl font-black text-white font-mono">{monitoredCount}</div>
          <div className="text-[10px] text-emerald-400 font-mono">100% Monitored</div>
        </div>

        <div className="p-3.5 bg-[#080d19] border border-slate-800/90 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Enterprise Risk Score</span>
          <div className="text-2xl font-black text-cyan-300 font-mono">{formattedScoreText}</div>
          <div className="text-[10px] text-cyan-400 font-mono">Level: {riskLevelStr}</div>
        </div>

        <div className="p-3.5 bg-[#080d19] border border-slate-800/90 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Compromised Assets</span>
          <div className="text-2xl font-black text-amber-400 font-mono">{compromisedCount}</div>
          <div className="text-[10px] text-amber-300/80 font-mono">Action Recommended</div>
        </div>

        <div className="p-3.5 bg-[#080d19] border border-slate-800/90 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Critical Incidents</span>
          <div className="text-2xl font-black text-red-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            {criticalCount}
          </div>
          <div className="text-[10px] text-red-400/80 font-mono">High Priority Triage</div>
        </div>

        <div className="p-3.5 bg-[#080d19] border border-slate-800/90 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Financial Loss Exposure</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{currencySymbol}{(financialExp / 1000).toFixed(0)}k</div>
          <div className="text-[10px] text-slate-400 font-mono">FAIR Modeled</div>
        </div>

        <div className="p-3.5 bg-[#080d19] border border-slate-800/90 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Last Update</span>
          <div className="text-xs font-mono text-slate-300 pt-1">Just Now</div>
          <div className="text-[10px] text-cyan-400 font-mono">Live Telemetry</div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* A. Enterprise Risk Radial Gauge & Overview */}
        <div className="lg:col-span-4 p-6 bg-[#080d19] border border-slate-800 rounded-3xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>Enterprise Risk Gauge</span>
              </h2>
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono font-bold uppercase">
                {riskLevelStr}
              </span>
            </div>

            {/* SVG Radial Gauge */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="text-slate-900 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className={currentScore >= 70 ? 'text-red-500 stroke-current' : 'text-amber-400 stroke-current'}
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black font-mono text-white tracking-tight">{currentScore}</span>
                <span className="text-xs text-slate-400 font-mono">/ 100 Risk</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1">Trend: -4.2%</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-slate-400">Previous Score (7d):</span>
                <span className="font-mono text-slate-200">75 / 100</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                Score driven primarily by 3 active behavioral traffic anomalies and container escape vulnerability on application mesh.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/risk-quantification')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View FAIR Financial Risk Model</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* B. Financial Loss Exposure Breakdown */}
        <div className="lg:col-span-8 p-6 bg-[#080d19] border border-slate-800 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>Financial Loss Exposure Analysis (FAIR Engine)</span>
                </h2>
                <p className="text-xs text-slate-400">Modeled potential business loss across incident scenarios</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-800">
                INR Scale
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Estimated Loss</span>
                <div className="text-2xl font-black font-mono text-cyan-300">{currencySymbol}{(financialExp).toLocaleString('en-IN')}</div>
                <p className="text-[10px] text-slate-400">Probable financial impact from active vulnerabilities.</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-cyan-950 text-cyan-300 text-[9px] font-mono rounded font-bold border border-cyan-800">
                  Label: Estimated
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Probable Incident Loss</span>
                <div className="text-2xl font-black font-mono text-amber-300">{currencySymbol}{(financialExp * 0.4).toLocaleString('en-IN')}</div>
                <p className="text-[10px] text-slate-400">Single incident loss expectancy (SLE).</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-amber-950 text-amber-300 text-[9px] font-mono rounded font-bold border border-amber-800">
                  Label: Probable
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Worst-Case Exposure</span>
                <div className="text-2xl font-black font-mono text-red-400">{currencySymbol}{(financialExp * 3.4).toLocaleString('en-IN')}</div>
                <p className="text-[10px] text-slate-400">Value at Risk 95th Percentile upper bounds.</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-red-950 text-red-300 text-[9px] font-mono rounded font-bold border border-red-800">
                  Label: Worst-Case
                </span>
              </div>
            </div>

            {/* Architectural Tier Breakdown */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300">Risk Distribution Across Architectural Tiers:</span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {tierStats.map((stat) => (
                  <div key={stat.tier} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                    <div className="text-[10px] font-mono text-slate-400">{stat.tier}</div>
                    <div className={`text-sm font-bold font-mono ${stat.avgRisk >= 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {stat.avgRisk}/100
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">{stat.count} assets</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[11px]">Loss models derived from FAIR framework metrics.</span>
            <button
              onClick={() => onNavigate('/reports')}
              className="text-cyan-400 hover:underline font-bold text-xs flex items-center gap-1"
            >
              <span>Download Detailed Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE THREAT SIGNALS & PRIORITY ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Behavioral Threat Signals */}
        <div className="lg:col-span-7 p-6 bg-[#080d19] border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>Active Threat Signals & Anomalies</span>
              </h2>
              <p className="text-xs text-slate-400">Observed traffic spikes and suspicious behavior alerts</p>
            </div>

            <button
              onClick={() => onNavigate('/detections')}
              className="text-xs text-cyan-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All Detections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {anomalies.slice(0, 3).map((anom) => (
              <div
                key={anom.id}
                onClick={() => {
                  onSelectNode(anom.assetId);
                  onNavigate('/infrastructure');
                }}
                className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl space-y-1.5 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-mono text-[10px] font-bold border border-red-800">
                      {anom.severity.toUpperCase()}
                    </span>
                    <span className="font-mono text-cyan-400 text-[11px]">{anom.mitreTechnique}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{anom.detectedAt}</span>
                </div>

                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {anom.title}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Affected Asset: <strong className="text-slate-200">{anom.assetName}</strong></span>
                  <span className="text-cyan-400 font-bold text-[10px] flex items-center gap-1">
                    <span>Inspect 3D</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Remediation Fixes */}
        <div className="lg:col-span-5 p-6 bg-[#080d19] border border-slate-800 rounded-3xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span>Priority Remediation Fixes</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-800">
                High Priority
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-red-400 font-bold text-[10px] uppercase">P1 • Perimeter Firewall</span>
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">-28 Risk Pts</span>
                </div>
                <div className="text-xs font-bold text-white">Enforce Rate Limiting & RST Flood Controls</div>
                <button
                  onClick={() => onNavigate('/recommendations')}
                  className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Apply Action</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-red-400 font-bold text-[10px] uppercase">P1 • App Microservices</span>
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">-18 Risk Pts</span>
                </div>
                <div className="text-xs font-bold text-white">Patch CVE-2024-21626 Container Escape</div>
                <button
                  onClick={() => onNavigate('/recommendations')}
                  className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Apply Action</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/recommendations')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Open Full Remediation Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
