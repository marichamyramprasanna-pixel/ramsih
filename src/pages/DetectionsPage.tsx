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
  FileCheck,
  Eye,
  Cpu,
  Zap,
  Lock
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
    <div className="p-4 lg:p-8 space-y-6 max-w-[1700px] mx-auto font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Behavioral Detection Signals</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-800 text-[10px] font-mono text-red-300 font-bold uppercase">
              ML Anomaly Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous behavioral deviations mapped against MITRE ATT&CK enterprise tactics without relying solely on static signature hashes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/investigations')}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md shadow-red-950 flex items-center gap-1.5"
          >
            <span>Launch War Room</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Severity Filter Pills */}
      <div className="flex items-center gap-2 text-xs">
        {['all', 'critical', 'high', 'medium'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              severityFilter === sev
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {sev === 'all' ? 'All Severities' : `${sev.toUpperCase()} (${anomalies.filter(a => a.severity === sev).length})`}
          </button>
        ))}
      </div>

      {/* Main Grid: Detections List & Deep Forensic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Anomaly Feed */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.map((anom) => {
            const isSelected = selectedAnomaly?.id === anom.id;
            return (
              <div
                key={anom.id}
                id={`detection-${anom.id}`}
                onClick={() => setSelectedAnomaly(anom)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500 shadow-xl shadow-cyan-950/40'
                    : 'bg-[#080d19] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
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
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold">{anom.mitreTactic}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{anom.detectedAt}</span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug mb-1">{anom.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{anom.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400">
                    Asset: <strong className="text-slate-200">{anom.assetName}</strong>
                  </span>
                  <div className="flex items-center gap-1 font-mono text-red-400 font-bold text-[11px]">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{anom.compromiseProbability}% Prob</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Anomaly Forensic Evidence Panel */}
        {selectedAnomaly && (
          <div className="lg:col-span-7 p-6 bg-[#080d19] border border-cyan-500/40 rounded-3xl space-y-6 shadow-2xl">
            {/* Header Title */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  {selectedAnomaly.mitreTechnique} • {selectedAnomaly.mitreTactic}
                </span>
                <h2 className="text-lg font-black text-white mt-1">{selectedAnomaly.title}</h2>
                <div className="text-xs text-slate-400 mt-0.5">Targeted Asset: <strong className="text-white">{selectedAnomaly.assetName}</strong></div>
              </div>

              <button
                onClick={() => {
                  onSelectNode(selectedAnomaly.assetId);
                  onNavigate('/infrastructure');
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Inspect in 3D</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Compromise Probability & Baseline Benchmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Compromise Probability Index</span>
                  <Activity className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl font-black font-mono text-red-400">
                  {selectedAnomaly.compromiseProbability}% Likelihood
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${selectedAnomaly.compromiseProbability}%` }} />
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Behavioral Baseline Deviation</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xs font-mono text-amber-300 font-bold pt-1">
                  Normal: ~10 MB/hr outbound
                </div>
                <div className="text-xs font-mono text-red-400 font-bold">
                  Observed: 4.8 GB exfiltration spike
                </div>
              </div>
            </div>

            {/* 4 Categorized Sections (Requirement 9) */}
            <div className="space-y-4 pt-1">
              {/* 1. Observed Telemetry Facts */}
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>1. Observed Telemetry Facts (Sensor Audit)</span>
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  {selectedAnomaly.evidence.map((ev, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400 select-none">›</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. AI Anomaly Model Assessment */}
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>2. AI Anomaly Model Assessment</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedAnomaly.description} Cross-referenced against <strong>{selectedAnomaly.mitreTactic}</strong> ({selectedAnomaly.mitreTechnique}) tactics with 96.4% confidence rating.
                </p>
              </div>

              {/* 3. Predictive Risk Impact */}
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>3. Predictive Risk Impact</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  High likelihood of lateral movement to adjacent Core Data Tier assets if uncontained within 15 minutes. Potential single loss expectancy: <strong>₹3,50,000</strong>.
                </p>
              </div>

              {/* 4. Recommended Defense Actions */}
              <div className="p-4 bg-slate-950 border border-cyan-500/30 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>4. Recommended Defensive Actions</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigate('/recommendations')}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Apply Automated Recommendation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('/investigations')}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Escalate to War Room</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
