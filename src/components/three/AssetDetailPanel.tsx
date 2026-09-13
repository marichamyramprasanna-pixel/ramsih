import React from 'react';
import { InfrastructureNode } from '../../types';
import { 
  X, 
  ShieldAlert, 
  DollarSign, 
  Percent, 
  Cpu, 
  Wifi, 
  Lock, 
  Unlock, 
  ExternalLink, 
  AlertOctagon, 
  CheckCircle2, 
  Activity,
  ArrowRight
} from 'lucide-react';

interface AssetDetailPanelProps {
  node: InfrastructureNode | null;
  onClose: () => void;
  onQuarantine: (nodeId: string) => void;
  onNavigateToDetections?: () => void;
  onNavigateToRecommendations?: () => void;
}

export const AssetDetailPanel: React.FC<AssetDetailPanelProps> = ({
  node,
  onClose,
  onQuarantine,
  onNavigateToDetections,
  onNavigateToRecommendations
}) => {
  if (!node) return null;

  const isQuarantined = node.status === 'quarantined';

  const getRiskBadge = (score: number) => {
    if (score >= 80) return { bg: 'bg-red-500/15 text-red-400 border-red-500/30', label: 'CRITICAL' };
    if (score >= 65) return { bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30', label: 'HIGH' };
    if (score >= 40) return { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', label: 'MEDIUM' };
    return { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'HEALTHY' };
  };

  const riskBadge = getRiskBadge(node.riskScore);

  return (
    <div 
      className="absolute top-4 right-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] z-30 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden text-slate-200 transition-all duration-300 animate-in fade-in slide-in-from-right-4"
      role="dialog"
      aria-labelledby="asset-detail-title"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-2 bg-slate-950/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded border ${riskBadge.bg}`}>
              {riskBadge.label}
            </span>
            <span className="text-xs text-slate-400 font-mono">{node.tier}</span>
          </div>
          <h2 id="asset-detail-title" className="text-base font-semibold text-white leading-tight">
            {node.name}
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{node.hostname}</p>
        </div>
        <button
          id="btn-close-asset-panel"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Close asset details panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Risk & Loss Overview Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Risk Score</span>
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono ${
                node.riskScore >= 70 ? 'text-red-400' : node.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {node.riskScore}
              </span>
              <span className="text-slate-500">/100</span>
            </div>
            {/* Mini visual bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  node.riskScore >= 70 ? 'bg-red-500' : node.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${node.riskScore}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Exposure</span>
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-lg font-bold font-mono text-cyan-300">
              ${(node.financialExposure / 1000000).toFixed(2)}M
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Compromise:</span>
              <span className="font-semibold text-slate-200">{node.compromiseProbability}%</span>
            </div>
          </div>
        </div>

        {/* Node Specifications */}
        <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg space-y-2">
          <div className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">Asset Metadata</div>
          <div className="grid grid-cols-2 gap-y-1.5 text-slate-300">
            <div>
              <span className="text-slate-500">IP:</span> <span className="font-mono text-slate-300">{node.ipAddress}</span>
            </div>
            <div>
              <span className="text-slate-500">Criticality:</span> <span className="font-semibold text-amber-300">{node.businessCriticality}</span>
            </div>
            <div>
              <span className="text-slate-500">Region:</span> <span>{node.environment}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span> 
              <span className={`ml-1 font-semibold ${
                node.status === 'quarantined' ? 'text-purple-400' :
                node.status === 'degraded' ? 'text-amber-400' :
                node.status === 'under-investigation' ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {node.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="pt-1 text-slate-400 border-t border-slate-800/60">
            <span className="text-slate-500">Owner:</span> {node.owner}
          </div>
        </div>

        {/* Live Telemetry */}
        <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-medium text-[11px] uppercase tracking-wider">
            <span>Live Telemetry</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-slate-400" /> CPU Load</span>
              <span className="font-mono">{node.cpuLoad}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${node.cpuLoad > 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
                style={{ width: `${node.cpuLoad}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-slate-300 pt-1">
              <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-slate-400" /> Ingress / Egress</span>
              <span className="font-mono text-cyan-300">{node.dataThroughputMbps} Mbps</span>
            </div>
          </div>
        </div>

        {/* Vulnerabilities Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-300">Identified Vulnerabilities</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {node.vulnerabilities.length} Found
            </span>
          </div>

          {node.vulnerabilities.length === 0 ? (
            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No critical CVEs active on this node.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {node.vulnerabilities.map((vuln) => (
                <div key={vuln.id} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-red-400">{vuln.cve}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950/80 text-red-300 border border-red-800">
                      CVSS {vuln.cvss}
                    </span>
                  </div>
                  <div className="font-medium text-slate-200 text-[11px]">{vuln.title}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{vuln.description}</p>
                  {vuln.exploitAvailable && (
                    <div className="text-[10px] text-orange-300 flex items-center gap-1 pt-0.5">
                      <AlertOctagon className="w-3 h-3 text-orange-400" />
                      <span>Weaponized exploit detected in wild</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
        <button
          id={`btn-quarantine-${node.id}`}
          onClick={() => onQuarantine(node.id)}
          className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
            isQuarantined 
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950' 
              : 'bg-red-600/90 hover:bg-red-600 text-white shadow-lg shadow-red-950'
          }`}
        >
          {isQuarantined ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span>{isQuarantined ? 'Restore Asset Traffic' : 'Quarantine / Isolate Asset'}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          {onNavigateToDetections && (
            <button
              onClick={onNavigateToDetections}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <span>Detections</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {onNavigateToRecommendations && (
            <button
              onClick={onNavigateToRecommendations}
              className="py-1.5 px-2 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/40 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <span>Mitigation</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
