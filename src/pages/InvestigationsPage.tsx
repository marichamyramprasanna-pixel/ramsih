import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Square, 
  CheckSquare, 
  ArrowRight, 
  User, 
  Layers,
  AlertTriangle,
  FileText,
  Lock,
  Zap,
  Activity,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Filter,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Investigation, InfrastructureNode } from '../types';

interface InvestigationsPageProps {
  investigations: Investigation[];
  nodes: InfrastructureNode[];
  onSelectNode: (id: string) => void;
  onQuarantineNode?: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({
  investigations,
  nodes,
  onSelectNode,
  onQuarantineNode,
  onNavigate
}) => {
  const [selectedInvId, setSelectedInvId] = useState<string>(investigations[0]?.id || 'INV-2024-001');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'containment' | 'mitigated'>('all');
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({
    'INV-2024-001': [0, 3]
  });
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const activeInv = investigations.find(i => i.id === selectedInvId) || investigations[0];

  const filteredInvestigations = investigations.filter(inv => {
    const matchesSearch = inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.threatVector.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'open') return matchesSearch && inv.status === 'open';
    if (statusFilter === 'containment') return matchesSearch && inv.status === 'containment-in-progress';
    if (statusFilter === 'mitigated') return matchesSearch && (inv.status === 'mitigated' || inv.status === 'closed');
    return matchesSearch;
  });

  const toggleStep = (invId: string, index: number) => {
    setCompletedSteps(prev => {
      const current = prev[invId] || [];
      const updated = current.includes(index) 
        ? current.filter(i => i !== index) 
        : [...current, index];
      return { ...prev, [invId]: updated };
    });
  };

  const currentCompleted = completedSteps[activeInv.id] || [];

  const handleQuarantineAsset = (nodeId: string, nodeName: string) => {
    if (onQuarantineNode) {
      onQuarantineNode(nodeId);
    }
    setActionFeedback(`Quarantined asset ${nodeName} (${nodeId}) successfully!`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-950 text-red-400 border-red-800';
      case 'high':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'medium':
        return 'bg-yellow-950 text-yellow-400 border-yellow-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return { label: 'OPEN INCIDENT', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
      case 'containment-in-progress':
        return { label: 'CONTAINMENT IN PROGRESS', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'mitigated':
        return { label: 'MITIGATED', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'closed':
        return { label: 'RESOLVED', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      default:
        return { label: status.toUpperCase(), color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* Header Notification Banner */}
      {actionFeedback && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-950/95 border border-emerald-500/50 rounded-xl shadow-2xl flex items-center gap-3 text-emerald-200 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-mono text-[10px] font-bold uppercase border border-red-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              CYBER WAR ROOM
            </span>
            <span className="text-xs text-slate-500 font-mono">Incident Response & Containment Command</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active Investigations Workspace</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-panel incident queue, kill-chain timeline analysis, telemetry evidence, and real-time containment playbooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-[#090d15] border border-slate-800 rounded-xl flex items-center gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">ACTIVE INCIDENTS</span>
              <span className="text-red-400 font-bold">
                {investigations.filter(i => i.status !== 'closed' && i.status !== 'mitigated').length} High Priority
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 text-[10px] block">TOTAL LOSS AVOIDED</span>
              <span className="text-emerald-400 font-bold">
                ${(investigations.reduce((acc, i) => acc + i.estimatedLossAvoided, 0) / 1000000).toFixed(2)}M
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Panel War Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* PANEL 1: Incident Queue (Left Panel - 3 cols) */}
        <div className="lg:col-span-3 bg-[#090d15] border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Incident Queue</span>
            </h2>
            <span className="text-xs text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              {filteredInvestigations.length} Case{filteredInvestigations.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, vector, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            {(['all', 'open', 'containment', 'mitigated'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-transparent'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Incident List */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredInvestigations.map((inv) => {
              const isSelected = inv.id === activeInv.id;
              const badge = getStatusBadge(inv.status);
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvId(inv.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-900/95 border-cyan-500/60 shadow-lg ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-400">{inv.id}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${getSeverityBadge(inv.severity)}`}>
                      {inv.severity}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-white line-clamp-1 leading-snug">{inv.title}</h3>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <span className="truncate max-w-[130px]">{inv.threatVector}</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      ${(inv.estimatedLossAvoided / 1000000).toFixed(1)}M Avoided
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL 2: Selected Incident Timeline & Evidence (Center Panel - 5 cols) */}
        <div className="lg:col-span-5 bg-[#090d15] border border-slate-800 rounded-2xl p-5 space-y-5">
          {/* Active Incident Header */}
          <div className="space-y-2 border-b border-slate-800/80 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(activeInv.status).color}`}>
                  {getStatusBadge(activeInv.status).label}
                </span>
                <span className="text-xs font-mono text-cyan-400">{activeInv.id}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Started: {activeInv.startedAt}
              </span>
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight">{activeInv.title}</h2>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">COMMANDER</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <User className="w-3 h-3 text-cyan-400" />
                  {activeInv.incidentCommander}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">THREAT VECTOR</span>
                <span className="font-semibold text-amber-300 truncate block">
                  {activeInv.threatVector}
                </span>
              </div>
            </div>
          </div>

          {/* Kill-Chain Forensic Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Kill-Chain Sequence & Evidence Logs</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">UTC Telemetry Stream</span>
            </div>

            <div className="relative pl-6 border-l-2 border-slate-800 space-y-5 pt-1">
              {activeInv.timeline.map((evt, idx) => (
                <div key={idx} className="relative group p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                  {/* Timeline Dot */}
                  <span className={`absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full border-2 ${
                    evt.type === 'alert' ? 'bg-red-500 border-red-950 ring-4 ring-red-950/50' :
                    evt.type === 'containment' ? 'bg-emerald-500 border-emerald-950 ring-4 ring-emerald-950/50' :
                    evt.type === 'action' ? 'bg-amber-500 border-amber-950 ring-4 ring-amber-950/50' :
                    'bg-cyan-500 border-cyan-950 ring-4 ring-cyan-950/50'
                  }`} />

                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-cyan-300 font-semibold">{evt.timestamp}</span>
                    <span className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                      evt.type === 'alert' ? 'bg-red-950 text-red-300 border border-red-800' :
                      evt.type === 'containment' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      evt.type === 'action' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {evt.type}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-100 leading-snug">{evt.event}</div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                    <span>Actor: <strong className="text-slate-300">{evt.actor}</strong></span>
                    <span className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-0.5">
                      <Terminal className="w-3 h-3" /> Raw Trace
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw System Evidence Log Stream */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5">
            <div className="text-[10px] uppercase text-slate-500 font-bold flex items-center justify-between">
              <span>LIVE PCAP / KUBERNETES AUDIT CAPTURE</span>
              <span className="text-emerald-400">STREAMING</span>
            </div>
            <div className="text-slate-400 space-y-1 overflow-x-auto max-h-32">
              <div className="text-red-400">[2024-09-16T14:22:11Z] [ALERT] SSH auth attempt from 198.51.100.44 using invalid public key on Bastion</div>
              <div className="text-yellow-300">[2024-09-16T14:22:19Z] [WARN] liblzma hook intercepted systemd-journald memory buffer</div>
              <div className="text-cyan-300">[2024-09-16T14:23:02Z] [TRACE] Outbound gRPC connection established to node-payment-api:8080</div>
              <div className="text-emerald-400">[2024-09-16T14:25:40Z] [ACTION] Automated microsegmentation rule appended to eBPF filter</div>
            </div>
          </div>
        </div>

        {/* PANEL 3: Detailed Containment Controls & AI Recommendations (Right Panel - 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Containment Playbook Checklist */}
          <div className="p-4 bg-[#090d15] border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Containment Playbook</span>
              </h3>
              <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                {currentCompleted.length} / {activeInv.mitigationSteps.length} Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentCompleted.length / activeInv.mitigationSteps.length) * 100}%` }}
              />
            </div>

            <div className="space-y-2 text-xs">
              {activeInv.mitigationSteps.map((step, idx) => {
                const isChecked = currentCompleted.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(activeInv.id, idx)}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-slate-400 line-through'
                        : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-900 hover:border-slate-700'
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

          {/* Compromised & Pivoted Assets */}
          <div className="p-4 bg-[#090d15] border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-400" />
              <span>Compromised / Targeted Assets</span>
            </h3>

            <div className="space-y-2.5">
              {activeInv.targetAssetIds.map((id) => {
                const node = nodes.find((n) => n.id === id);
                if (!node) return null;
                const isQuarantined = node.status === 'quarantined';

                return (
                  <div
                    key={id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>{node.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                            isQuarantined ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {node.status}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">{node.hostname} • {node.ipAddress}</div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-red-400">{node.riskScore} Risk</div>
                        <div className="text-[10px] text-slate-500">{node.environment}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                      <button
                        onClick={() => {
                          onSelectNode(id);
                          onNavigate('/infrastructure');
                        }}
                        className="text-[11px] text-cyan-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                      >
                        Inspect 3D Canvas <ArrowRight className="w-3 h-3" />
                      </button>

                      {!isQuarantined ? (
                        <button
                          onClick={() => handleQuarantineAsset(node.id, node.name)}
                          className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-[11px] rounded-lg border border-red-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Lock className="w-3 h-3 text-red-400" />
                          <span>Isolate Asset</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Quarantined
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Containment Recommendation Box */}
          <div className="p-4 bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-900/90 border border-cyan-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase text-cyan-300 tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>AI Risk Mitigation Agent</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                ACTIVE ADVISOR
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Automated Blast Radius analysis suggests isolating <strong className="text-white">Zero-Trust Bastion Host (node-bastion)</strong> will sever 88% of lateral attack vectors toward the Financial SQL Vault.
            </p>

            <button
              onClick={() => {
                setActionFeedback("AI Mitigation Automated Script Executed: Bastion microsegmented & Kerberos tokens revoked.");
                setTimeout(() => setActionFeedback(null), 4000);
              }}
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Execute Recommended Blast Containment</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
