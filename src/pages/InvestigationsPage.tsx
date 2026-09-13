import React, { useState } from 'react';
import { 
  SearchCode, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Square, 
  CheckSquare, 
  ArrowRight, 
  User, 
  Layers,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Investigation, InfrastructureNode } from '../types';

interface InvestigationsPageProps {
  investigations: Investigation[];
  nodes: InfrastructureNode[];
  onSelectNode: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({
  investigations,
  nodes,
  onSelectNode,
  onNavigate
}) => {
  const activeInv = investigations[0];
  const [completedSteps, setCompletedSteps] = useState<number[]>([0, 3]);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (!activeInv) return null;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-mono text-[10px] font-bold uppercase border border-red-800">
              WAR ROOM ACTIVE
            </span>
            <span className="text-xs text-slate-500 font-mono">{activeInv.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{activeInv.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Threat Vector: <strong className="text-slate-200">{activeInv.threatVector}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
            <span className="text-slate-400">Loss Avoided: </span>
            <span className="text-emerald-400 font-bold">
              ${(activeInv.estimatedLossAvoided / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>
      </div>

      {/* Incident Metadata Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#090d15] border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-slate-500 text-[10px]">Incident Commander</div>
            <div className="font-semibold text-slate-200">{activeInv.incidentCommander}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-slate-500 text-[10px]">Started</div>
            <div className="font-semibold text-slate-200">{activeInv.startedAt}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <div>
            <div className="text-slate-500 text-[10px]">Severity</div>
            <div className="font-semibold text-red-400 uppercase font-mono">{activeInv.severity}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Kill-Chain Timeline & Containment Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kill-Chain Forensic Timeline */}
        <div className="lg:col-span-7 p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Kill-Chain Sequence & Evidence Logs</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">UTC Telemetry</span>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-800 space-y-6 pt-2">
            {activeInv.timeline.map((evt, idx) => (
              <div key={idx} className="relative group">
                {/* Node marker on the line */}
                <span className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                  evt.type === 'alert' ? 'bg-red-500 border-red-950 ring-4 ring-red-950' :
                  evt.type === 'containment' ? 'bg-emerald-500 border-emerald-950 ring-4 ring-emerald-950' :
                  'bg-cyan-500 border-cyan-950 ring-4 ring-cyan-950'
                }`} />

                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="font-mono text-cyan-300 font-semibold">{evt.timestamp}</span>
                  <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded ${
                    evt.type === 'alert' ? 'bg-red-950 text-red-300' :
                    evt.type === 'containment' ? 'bg-emerald-950 text-emerald-300' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {evt.type}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-200 leading-relaxed">{evt.event}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Actor: {evt.actor}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Containment Checklist & Target Assets */}
        <div className="lg:col-span-5 space-y-4">
          {/* Affected Assets */}
          <div className="p-4 bg-[#090d15] border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Compromised / Pivoted Assets
            </h3>
            <div className="space-y-2">
              {activeInv.targetAssetIds.map((id) => {
                const node = nodes.find((n) => n.id === id);
                if (!node) return null;
                return (
                  <div
                    key={id}
                    onClick={() => {
                      onSelectNode(id);
                      onNavigate('/infrastructure');
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{node.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{node.hostname}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-red-400 font-bold">{node.riskScore} Risk</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Containment Playbook Checklist */}
          <div className="p-4 bg-[#090d15] border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Containment Playbook Checklist
              </h3>
              <span className="text-[11px] text-emerald-400 font-mono">
                {completedSteps.length} / {activeInv.mitigationSteps.length} Complete
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {activeInv.mitigationSteps.map((step, idx) => {
                const isChecked = completedSteps.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-slate-400 line-through'
                        : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
