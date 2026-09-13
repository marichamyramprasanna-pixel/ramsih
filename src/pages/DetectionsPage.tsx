import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  Search, 
  ArrowRight, 
  Terminal, 
  Activity,
  Layers,
  FileCheck
} from 'lucide-react';
import { AnomalyDetection, InfrastructureNode } from '../types';

interface DetectionsPageProps {
  anomalies: AnomalyDetection[];
  nodes: InfrastructureNode[];
  onSelectNode: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const DetectionsPage: React.FC<DetectionsPageProps> = ({
  anomalies,
  nodes,
  onSelectNode,
  onNavigate
}) => {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyDetection | null>(anomalies[0] || null);

  const filtered = anomalies.filter((a) => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Behavioral Anomalies & Compromise Signals</h1>
          <p className="text-xs text-slate-400">
            Machine learning anomaly models cross-referenced against MITRE ATT&CK enterprise tactics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/investigations')}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Launch Active War Room
          </button>
        </div>
      </div>

      {/* Severity Filter Pills */}
      <div className="flex items-center gap-2 text-xs">
        {['all', 'critical', 'high', 'medium'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              severityFilter === sev
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {sev === 'all' ? 'All Severities' : `${sev.toUpperCase()} (${anomalies.filter(a => a.severity === sev).length})`}
          </button>
        ))}
      </div>

      {/* Main Grid: Detections List & Deep Forensic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Anomaly Feed */}
        <div className="lg:col-span-6 space-y-3">
          {filtered.map((anom) => {
            const isSelected = selectedAnomaly?.id === anom.id;
            return (
              <div
                key={anom.id}
                id={`detection-${anom.id}`}
                onClick={() => setSelectedAnomaly(anom)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/60 shadow-xl shadow-cyan-950/40'
                    : 'bg-[#090d15] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      anom.severity === 'critical' ? 'bg-red-950 text-red-300 border-red-800' :
                      anom.severity === 'high' ? 'bg-orange-950 text-orange-300 border-orange-800' :
                      'bg-amber-950 text-amber-300 border-amber-800'
                    }`}>
                      {anom.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{anom.mitreTactic}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{anom.detectedAt}</span>
                </div>

                <h3 className="text-sm font-semibold text-white leading-snug mb-1">{anom.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{anom.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400">
                    Asset: <strong className="text-slate-200">{anom.assetName}</strong>
                  </span>
                  <div className="flex items-center gap-1 font-mono text-red-400 font-semibold text-[11px]">
                    <Activity className="w-3 h-3" />
                    <span>{anom.compromiseProbability}% Prob</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Anomaly Forensic Evidence Panel */}
        {selectedAnomaly && (
          <div className="lg:col-span-6 p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-wider">
                  {selectedAnomaly.mitreTechnique}
                </span>
                <h2 className="text-base font-bold text-white mt-1">{selectedAnomaly.title}</h2>
                <div className="text-xs text-slate-400 mt-0.5">Target: {selectedAnomaly.assetName}</div>
              </div>
              <button
                onClick={() => {
                  onSelectNode(selectedAnomaly.assetId);
                  onNavigate('/infrastructure');
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect in 3D</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Compromise Probability Gauge */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Compromise Probability Index</div>
                <div className="text-xl font-bold font-mono text-red-400 mt-0.5">
                  {selectedAnomaly.compromiseProbability}% Likelihood
                </div>
              </div>
              <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{ width: `${selectedAnomaly.compromiseProbability}%` }}
                />
              </div>
            </div>

            {/* Forensic Telemetry & Evidence Logs */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Forensic Artifacts & Sensor Evidence</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {selectedAnomaly.evidence.map((ev, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400 select-none">›</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onNavigate('/investigations')}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Add to Active Investigation War Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
