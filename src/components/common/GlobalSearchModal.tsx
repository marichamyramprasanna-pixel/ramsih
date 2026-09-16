import React, { useState } from 'react';
import { Search, X, Server, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { InfrastructureNode, AnomalyDetection, Investigation } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: InfrastructureNode[];
  anomalies: AnomalyDetection[];
  investigations: Investigation[];
  onSelectNode: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  nodes,
  anomalies,
  investigations,
  onSelectNode,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingNodes = q.length === 0 ? nodes.slice(0, 4) : nodes.filter(n => 
    n.name.toLowerCase().includes(q) ||
    n.ipAddress.toLowerCase().includes(q) ||
    n.operatingSystem.toLowerCase().includes(q) ||
    n.category.toLowerCase().includes(q) ||
    n.vulnerabilities.some(v => v.cve.toLowerCase().includes(q) || v.title.toLowerCase().includes(q))
  );

  const matchingAnomalies = q.length === 0 ? [] : anomalies.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.assetName.toLowerCase().includes(q) ||
    a.mitreTactic.toLowerCase().includes(q) ||
    a.mitreTechnique.toLowerCase().includes(q)
  );

  const matchingInvestigations = q.length === 0 ? [] : investigations.filter(i =>
    i.title.toLowerCase().includes(q) ||
    i.threatVector.toLowerCase().includes(q)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#080d1a] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden font-sans space-y-0">
        
        {/* Search Input Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search devices, CVEs, IPs, alerts, incidents, MITRE tactics..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Matching Devices */}
          {matchingNodes.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Infrastructure Devices ({matchingNodes.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      onSelectNode(node.id);
                      onNavigate('/infrastructure');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 text-left flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${node.riskScore >= 70 ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">{node.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{node.ipAddress} • {node.environment} • Risk: {node.riskScore}/100</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Behavioral Signals */}
          {matchingAnomalies.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Behavioral Detection Signals ({matchingAnomalies.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingAnomalies.map((anom) => (
                  <button
                    key={anom.id}
                    onClick={() => {
                      onNavigate('/detections');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-red-500/50 hover:bg-slate-800/80 text-left flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-red-300 transition-colors">{anom.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Asset: {anom.assetName} • Tactic: {anom.mitreTactic}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Investigations */}
          {matchingInvestigations.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Investigations ({matchingInvestigations.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchingInvestigations.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      onNavigate('/investigations');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-left flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">{inv.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Commander: {inv.incidentCommander} • Vector: {inv.threatVector}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchingNodes.length === 0 && matchingAnomalies.length === 0 && matchingInvestigations.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              No matching assets or alerts found for "{query}".
            </div>
          )}
        </div>

        {/* Modal Footer Keyboard Guide */}
        <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between">
          <span>Search Threat Catcher Telemetry & Assets</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
