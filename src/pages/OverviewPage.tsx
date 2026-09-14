import React from 'react';
import { 
  ShieldAlert, 
  DollarSign, 
  Activity, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Sparkles,
  Server,
  Zap
} from 'lucide-react';
import { InfrastructureNode, DataFlowLink, EnterpriseRiskSummary } from '../types';
import { ThreeInfrastructureViewer } from '../components/three/ThreeInfrastructureViewer';
import { apiService } from '../services/apiService';

interface OverviewPageProps {
  nodes: InfrastructureNode[];
  links: DataFlowLink[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onQuarantineNode: (id: string) => void;
  onSolveDeviceProblem?: (id: string) => void;
  riskSummary: EnterpriseRiskSummary;
  onNavigate: (route: string) => void;
  reducedMotion: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  onQuarantineNode,
  onSolveDeviceProblem,
  riskSummary,
  onNavigate,
  reducedMotion
}) => {
  const highRiskNodes = [...nodes]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Hero Section: Split Desktop Layout (3D Centerpiece 55-60%) */}
      <section 
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        aria-label="Overview Hero and 3D Centerpiece"
      >
        {/* Left Hero Content: Strategic Cyber Risk Intelligence (40-45%) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-gradient-to-b from-slate-900/90 to-[#0a0d14] border border-slate-800 rounded-2xl shadow-xl">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Aegis Continuous Risk Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Understand your risk. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                Detect abnormal signals.
              </span> <br />
              Take decisive action.
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Real-time cyber environment telemetry rendered in interactive 3D space. 
              Correlate behavioral anomalies with FAIR financial loss exposure to prioritize defensive remediation where it matters most.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="cta-explore-infra"
                onClick={() => onNavigate('/infrastructure')}
                className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all cursor-pointer"
              >
                <span>Explore Infrastructure</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="cta-view-exposure"
                onClick={() => onNavigate('/risk-quantification')}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>View Risk Exposure</span>
                <DollarSign className="w-4 h-4 text-cyan-400" />
              </button>

              <button
                id="cta-investigate"
                onClick={() => onNavigate('/investigations')}
                className="px-4 py-2.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-800/60 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Active War Room</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {/* Key Posture Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[11px] mb-1">Overall Posture</div>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold font-mono ${
                  riskSummary.overallRiskScore >= 70 ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {riskSummary.overallRiskScore}
                </span>
                <span className="text-slate-500">/100</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">
                {riskSummary.riskTrend}% vs 7d avg
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[11px] mb-1">Expected Loss</div>
              <div className="text-xl font-bold font-mono text-cyan-300">
                ${(riskSummary.fairMetrics.totalExpectedLossUSD / 1000000).toFixed(2)}M
              </div>
              <div className="text-[10px] text-slate-500 mt-1">FAIR Model</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[11px] mb-1">Critical Signals</div>
              <div className="text-xl font-bold font-mono text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                {riskSummary.criticalAnomaliesCount}
              </div>
              <div className="text-[10px] text-red-400/80 mt-1">Immediate triage</div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="text-slate-400 text-[11px] mb-1">Topology Nodes</div>
              <div className="text-xl font-bold font-mono text-white">
                {riskSummary.activeAssetsCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">100% Monitored</div>
            </div>
          </div>
        </div>

        {/* Right Hero: 3D Centerpiece Viewer (55-60%) */}
        <div className="lg:col-span-7 relative min-h-[460px] lg:min-h-[540px] flex flex-col">
          <ThreeInfrastructureViewer
            nodes={nodes}
            links={links}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            onQuarantineNode={onQuarantineNode}
            onSolveDeviceProblem={onSolveDeviceProblem || ((id) => apiService.solveDeviceProblem(id))}
            onNavigateToDetections={() => onNavigate('/detections')}
            onNavigateToRecommendations={() => onNavigate('/recommendations')}
            reducedMotion={reducedMotion}
            className="flex-1 shadow-2xl"
          />
        </div>
      </section>

      {/* Second Section: Top Risk Assets & Compromise Vector Highlights */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Critical Risk Assets */}
        <div className="lg:col-span-8 p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Highest Risk Infrastructure Assets</span>
              </h2>
              <p className="text-xs text-slate-400">Ranked by compromise probability and business financial exposure</p>
            </div>
            <button
              onClick={() => onNavigate('/assets')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All 16 Assets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highRiskNodes.map((node) => (
              <div
                key={node.id}
                id={`card-asset-${node.id}`}
                onClick={() => onSelectNode(node.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedNodeId === node.id
                    ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-950'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {node.tier}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-1 leading-snug">{node.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{node.hostname}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-base font-bold font-mono ${
                      node.riskScore >= 80 ? 'text-red-400' : 'text-orange-400'
                    }`}>
                      {node.riskScore}
                      <span className="text-[10px] text-slate-500 font-normal">/100</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ${(node.financialExposure / 1000000).toFixed(1)}M exp
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {node.vulnerabilities.length} active CVEs
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode(node.id);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Focus in 3D</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rapid Remediation Snapshot */}
        <div className="lg:col-span-4 p-5 bg-[#090d15] border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Immediate Priority Fixes</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
                High ROI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Remediating the top 2 defensive actions reduces total enterprise risk exposure by <strong className="text-emerald-400">$4.3M</strong>.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-red-400 font-semibold uppercase">P1 • Zero-Trust Bastion</span>
                  <span className="text-[10px] font-mono text-emerald-400">-$2.45M Exp</span>
                </div>
                <div className="text-xs font-medium text-slate-200">Downgrade compromised XZ/LZMA library</div>
                <button
                  onClick={() => onNavigate('/recommendations')}
                  className="w-full mt-1 py-1 px-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold flex items-center justify-center gap-1"
                >
                  <span>Review & Apply</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-red-400 font-semibold uppercase">P1 • Primary Financial SQL</span>
                  <span className="text-[10px] font-mono text-emerald-400">-$1.85M Exp</span>
                </div>
                <div className="text-xs font-medium text-slate-200">Enforce mTLS & Microsegmentation</div>
                <button
                  onClick={() => onNavigate('/recommendations')}
                  className="w-full mt-1 py-1 px-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold flex items-center justify-center gap-1"
                >
                  <span>Review & Apply</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigate('/reports')}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <span>Download Executive Audit Report (PDF)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
