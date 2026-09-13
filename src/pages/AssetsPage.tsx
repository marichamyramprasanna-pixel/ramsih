import React, { useState, useMemo } from 'react';
import { 
  Server, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck,
  DollarSign, 
  Lock, 
  Unlock, 
  ArrowUpDown,
  Cpu,
  Wifi,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  Activity,
  AlertTriangle,
  Layers,
  X,
  Wrench,
  Monitor,
  ArrowRight
} from 'lucide-react';
import { InfrastructureNode, AssetCategory } from '../types';

interface AssetsPageProps {
  nodes: InfrastructureNode[];
  onSelectNode: (id: string) => void;
  onQuarantineNode: (id: string) => void;
  onAddDevice: (deviceData: Omit<InfrastructureNode, 'id' | 'lastUpdated'>) => InfrastructureNode;
  onDeleteDevice: (id: string) => boolean;
  onSolveDeviceProblem: (id: string) => boolean;
  onNavigate: (route: string) => void;
}

export const AssetsPage: React.FC<AssetsPageProps> = ({
  nodes,
  onSelectNode,
  onQuarantineNode,
  onAddDevice,
  onDeleteDevice,
  onSolveDeviceProblem,
  onNavigate
}) => {
  // Navigation sub-tab state
  const [activeTab, setActiveTab] = useState<'prioritized' | 'monitoring' | 'table'>('prioritized');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal & Toast states
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Device Form State
  const [formData, setFormData] = useState({
    name: '',
    hostname: '',
    ipAddress: '',
    category: 'app-service' as AssetCategory,
    tier: 'Application' as 'Perimeter' | 'Ingress' | 'Application' | 'Core Data' | 'Management',
    environment: 'AWS us-east-1' as 'AWS us-east-1' | 'GCP asia-east' | 'On-Premises Core' | 'Edge DC',
    businessCriticality: 'Tier 1' as 'Tier 1' | 'Tier 2' | 'Tier 3',
    riskScore: 75,
    compromiseProbability: 45,
    financialExposure: 1500000,
    status: 'online' as 'online' | 'degraded' | 'under-investigation' | 'quarantined',
    cpuLoad: 42,
    dataThroughputMbps: 1200,
    operatingSystem: 'Ubuntu 22.04 LTS (Hardened Kernel)',
    owner: 'SecOps Infrastructure Team',
    description: 'Mission-critical enterprise microservice handling transactions.',
    cve: 'CVE-2024-3094',
    vulnTitle: 'Remote Code Execution Vulnerability',
    vulnRemediation: 'Upgrade package dependencies to latest patch release and enforce mTLS.'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Strictly Prioritize Nodes by Risk Score (Descending)
  const prioritizedNodes = useMemo(() => {
    return [...nodes]
      .filter((n) => {
        const matchesTier = tierFilter === 'all' || n.tier === tierFilter;
        const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
        const query = search.toLowerCase();
        const matchesSearch =
          !query ||
          n.name.toLowerCase().includes(query) ||
          n.hostname.toLowerCase().includes(query) ||
          n.ipAddress.includes(query) ||
          n.owner.toLowerCase().includes(query) ||
          n.vulnerabilities.some((v) => v.cve.toLowerCase().includes(query));
        return matchesTier && matchesStatus && matchesSearch;
      })
      .sort((a, b) => b.riskScore - a.riskScore); // Highest Risk Score First
  }, [nodes, search, tierFilter, statusFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.hostname || !formData.ipAddress) return;

    // Build vulnerabilities array from form
    const vulnerabilities = formData.cve
      ? [
          {
            id: `vuln-user-${Date.now()}`,
            cve: formData.cve,
            title: formData.vulnTitle || 'Security Vulnerability',
            severity: (formData.riskScore >= 80 ? 'critical' : formData.riskScore >= 65 ? 'high' : 'medium') as any,
            cvss: Number((formData.riskScore / 10).toFixed(1)),
            exploitAvailable: true,
            attackVector: 'Network' as const,
            description: formData.description,
            remediation: formData.vulnRemediation || 'Apply security patch immediately.'
          }
        ]
      : [];

    // Assign default 3D coordinates based on tier
    let position3D: [number, number, number] = [0, 0, 0];
    if (formData.tier === 'Perimeter') position3D = [Math.random() * 6 - 3, 0.4, -4];
    else if (formData.tier === 'Ingress') position3D = [Math.random() * 6 - 3, 0.4, -2];
    else if (formData.tier === 'Application') position3D = [Math.random() * 6 - 3, 0.4, 0];
    else if (formData.tier === 'Core Data') position3D = [Math.random() * 6 - 3, 0.4, 2];
    else position3D = [Math.random() * 6 - 3, 0.4, 4];

    onAddDevice({
      name: formData.name,
      hostname: formData.hostname,
      ipAddress: formData.ipAddress,
      category: formData.category,
      tier: formData.tier,
      riskScore: formData.riskScore,
      compromiseProbability: formData.compromiseProbability,
      businessCriticality: formData.businessCriticality,
      financialExposure: formData.financialExposure,
      status: formData.status,
      position3D,
      connections: [],
      vulnerabilities,
      anomaliesCount: vulnerabilities.length ? 1 : 0,
      cpuLoad: formData.cpuLoad,
      dataThroughputMbps: formData.dataThroughputMbps,
      operatingSystem: formData.operatingSystem,
      environment: formData.environment,
      owner: formData.owner,
      description: formData.description
    });

    setShowAddModal(false);
    showToast(`Device "${formData.name}" added to monitored 3D topology!`);

    // Reset form defaults
    setFormData({
      name: '',
      hostname: '',
      ipAddress: '',
      category: 'app-service',
      tier: 'Application',
      environment: 'AWS us-east-1',
      businessCriticality: 'Tier 1',
      riskScore: 75,
      compromiseProbability: 45,
      financialExposure: 1500000,
      status: 'online',
      cpuLoad: 42,
      dataThroughputMbps: 1200,
      operatingSystem: 'Ubuntu 22.04 LTS (Hardened Kernel)',
      owner: 'SecOps Infrastructure Team',
      description: 'Mission-critical enterprise microservice handling transactions.',
      cve: 'CVE-2024-3094',
      vulnTitle: 'Remote Code Execution Vulnerability',
      vulnRemediation: 'Upgrade package dependencies to latest patch release and enforce mTLS.'
    });
  };

  const handleDeleteConfirm = (id: string, name: string) => {
    const success = onDeleteDevice(id);
    setDeleteConfirmId(null);
    if (success) {
      showToast(`Device "${name}" deleted from infrastructure inventory.`);
    }
  };

  const handleSolve = (id: string, name: string) => {
    const success = onSolveDeviceProblem(id);
    if (success) {
      showToast(`Problems solved & patch applied for "${name}"! Risk score reduced.`);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-950/95 border border-cyan-500/50 rounded-xl shadow-2xl flex items-center gap-3 text-cyan-200 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold uppercase border border-cyan-800">
              DEVICE RISK MANAGER
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {nodes.length} Devices Monitored
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Device Risk Prioritization & Solutions
          </h1>
          <p className="text-xs text-slate-400">
            Prioritize devices strictly by Risk Score, inspect exact remediation solutions near each device, add new hardware, and monitor real-time telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-add-device-open"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Device</span>
          </button>

          <button
            onClick={() => onNavigate('/infrastructure')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Explore 3D Topology</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* View Switcher Tabs & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#090d15] border border-slate-800 rounded-xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            id="tab-prioritized"
            onClick={() => setActiveTab('prioritized')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'prioritized'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Risk-Prioritized Solutions ({prioritizedNodes.length})</span>
          </button>

          <button
            id="tab-monitoring"
            onClick={() => setActiveTab('monitoring')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'monitoring'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>Device Telemetry Monitor</span>
          </button>

          <button
            id="tab-table"
            onClick={() => setActiveTab('table')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'table'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4 text-slate-400" />
            <span>Full Inventory Table</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              id="input-device-search"
              type="text"
              placeholder="Search host, IP, CVE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-900 text-slate-300 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="Perimeter">Perimeter</option>
            <option value="Ingress">Ingress</option>
            <option value="Application">Application</option>
            <option value="Core Data">Core Data</option>
            <option value="Management">Management</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 text-slate-300 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="degraded">Degraded</option>
            <option value="under-investigation">Under Investigation</option>
            <option value="quarantined">Quarantined</option>
          </select>
        </div>
      </div>

      {/* TAB 1: RISK PRIORITIZED DEVICES & SOLUTIONS NEAR DEVICES */}
      {activeTab === 'prioritized' && (
        <div className="space-y-4">
          <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-xs text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                Devices are prioritized strictly by <strong>Risk Score (Highest First)</strong>. Inspect vulnerabilities and execute step-by-step solutions right alongside each device.
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400 font-medium">
              Ranked 1 to {prioritizedNodes.length}
            </span>
          </div>

          <div className="space-y-4">
            {prioritizedNodes.map((node, index) => {
              const isCritical = node.riskScore >= 80;
              const isHigh = node.riskScore >= 65 && node.riskScore < 80;
              const isQuarantined = node.status === 'quarantined';
              const hasVulnerabilities = node.vulnerabilities.length > 0;

              return (
                <div
                  key={node.id}
                  id={`device-card-${node.id}`}
                  className={`p-5 rounded-2xl border transition-all shadow-xl ${
                    isCritical
                      ? 'bg-gradient-to-r from-red-950/40 via-[#090d15] to-[#090d15] border-red-900/60'
                      : isHigh
                      ? 'bg-gradient-to-r from-orange-950/30 via-[#090d15] to-[#090d15] border-orange-900/50'
                      : 'bg-[#090d15] border-slate-800'
                  }`}
                >
                  {/* Top Row: Priority Rank, Device Header & Primary Metrics */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="flex items-start gap-3">
                      {/* Priority Rank Badge */}
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-cyan-400 text-xs shrink-0 shadow">
                        #{index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-bold text-white">{node.name}</h2>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {node.tier}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {node.environment}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          {node.hostname} • {node.ipAddress} • Owner: {node.owner}
                        </div>
                      </div>
                    </div>

                    {/* Risk Score & Financial Exposure Badges */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Risk Score</div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl font-extrabold font-mono ${
                            node.riskScore >= 80 ? 'text-red-400' : node.riskScore >= 65 ? 'text-orange-400' : node.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {node.riskScore}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">/100</span>
                        </div>
                      </div>

                      <div className="w-px h-8 bg-slate-800" />

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-mono uppercase">Exposure</div>
                        <div className="text-sm font-bold font-mono text-cyan-300">
                          ${(node.financialExposure / 1000000).toFixed(2)}M
                        </div>
                      </div>

                      <div className="w-px h-8 bg-slate-800" />

                      {/* Device Action Buttons: Focus 3D, Quarantine, Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onSelectNode(node.id);
                            onNavigate('/infrastructure');
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="Focus this device in 3D Space"
                        >
                          Focus 3D
                        </button>

                        <button
                          onClick={() => onQuarantineNode(node.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            isQuarantined
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                          title={isQuarantined ? 'Un-quarantine Device' : 'Quarantine Device'}
                        >
                          {isQuarantined ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>

                        <button
                          id={`btn-delete-${node.id}`}
                          onClick={() => setDeleteConfirmId(node.id)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition-colors cursor-pointer"
                          title="Delete Device from Inventory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Exact Problem & Step-by-Step Solution right near the device */}
                  <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* Problem / Active Vulnerabilities */}
                    <div className="lg:col-span-6 space-y-2 p-3.5 bg-slate-950/70 border border-slate-800/90 rounded-xl">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          <span>Identified Security Problems ({node.vulnerabilities.length})</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {node.operatingSystem}
                        </span>
                      </div>

                      {hasVulnerabilities ? (
                        <div className="space-y-2">
                          {node.vulnerabilities.map((v) => (
                            <div key={v.id} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-red-400 font-bold">{v.cve}</span>
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                                  CVSS {v.cvss}
                                </span>
                              </div>
                              <div className="font-medium text-slate-200">{v.title}</div>
                              <p className="text-[11px] text-slate-400">{v.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>No active security vulnerabilities detected on this device.</span>
                        </div>
                      )}
                    </div>

                    {/* Exact Solution & Step-by-Step Fix right alongside the device */}
                    <div className="lg:col-span-6 space-y-2 p-3.5 bg-slate-950/70 border border-cyan-900/40 rounded-xl flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Recommended Solution & Remediation Steps</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                            -{node.riskScore >= 50 ? 55 : 15} Pts Risk Reduction
                          </span>
                        </div>

                        {hasVulnerabilities ? (
                          <div className="space-y-2 text-xs">
                            {node.vulnerabilities.map((v) => (
                              <div key={v.id} className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-slate-300 leading-relaxed">
                                <div className="text-[10px] uppercase font-mono text-cyan-400 font-bold mb-1">
                                  Step-by-Step Action Plan:
                                </div>
                                <p className="text-xs text-slate-200">{v.remediation}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-slate-900/60 text-slate-400 text-xs">
                            System is fully patched. Maintain routine kernel updates and SAML token rotation.
                          </div>
                        )}
                      </div>

                      {/* Immediate Solve Problem Button */}
                      {hasVulnerabilities && (
                        <div className="pt-2">
                          <button
                            id={`btn-solve-${node.id}`}
                            onClick={() => handleSolve(node.id, node.name)}
                            className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all cursor-pointer"
                          >
                            <Zap className="w-4 h-4 fill-slate-950" />
                            <span>Solve Problem & Apply Security Patch</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DEVICE TELEMETRY MONITORING */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Real-time device monitoring feed updating CPU Load %, Throughput Mbps, and operational state.
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Live Stream Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prioritizedNodes.map((node) => (
              <div
                key={node.id}
                className="p-4 bg-[#090d15] border border-slate-800 rounded-2xl space-y-3 shadow-lg hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">{node.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{node.hostname}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                    node.status === 'quarantined' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                    node.status === 'degraded' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {node.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      <span>CPU Utilization</span>
                    </div>
                    <div className="text-base font-bold font-mono text-white mt-1">
                      {node.cpuLoad}%
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${node.cpuLoad >= 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
                        style={{ width: `${node.cpuLoad}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-xl">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>Throughput</span>
                    </div>
                    <div className="text-base font-bold font-mono text-emerald-300 mt-1">
                      {node.dataThroughputMbps} Mbps
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      {node.environment}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] font-mono">
                    Last update: {node.lastUpdated}
                  </span>
                  <button
                    onClick={() => setDeleteConfirmId(node.id)}
                    className="text-red-400 hover:text-red-300 text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FULL TECHNICAL INVENTORY TABLE */}
      {activeTab === 'table' && (
        <div className="bg-[#090d15] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px]">
                  <th className="p-3">Rank & Asset Name</th>
                  <th className="p-3">Category & Tier</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Loss Exposure</th>
                  <th className="p-3">Vulnerabilities</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {prioritizedNodes.map((node, idx) => (
                  <tr key={node.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold">#{idx + 1}</span>
                        <div>
                          <div className="font-semibold text-white">{node.name}</div>
                          <div className="font-mono text-[11px] text-slate-500">{node.hostname} • {node.ipAddress}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{node.tier} ({node.category})</td>
                    <td className="p-3">
                      <span className={`font-mono font-bold text-sm ${
                        node.riskScore >= 80 ? 'text-red-400' : node.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {node.riskScore} / 100
                      </span>
                    </td>
                    <td className="p-3 font-mono text-cyan-300 font-semibold">
                      ${(node.financialExposure / 1000000).toFixed(2)}M
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {node.vulnerabilities.length > 0 ? (
                        <span className="text-red-400 font-semibold">{node.vulnerabilities.length} active CVEs</span>
                      ) : (
                        <span className="text-emerald-400">0 (Patched)</span>
                      )}
                    </td>
                    <td className="p-3 uppercase font-mono text-[10px] font-bold">{node.status}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {node.vulnerabilities.length > 0 && (
                          <button
                            onClick={() => handleSolve(node.id, node.name)}
                            className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded font-bold text-[11px] cursor-pointer"
                          >
                            Solve
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirmId(node.id)}
                          className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                          title="Delete Device"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW DEVICE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090d15] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Add New Monitored Device</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Device Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Core Payment Gateway"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Hostname *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pay-gw-01.aws.internal"
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">IP Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10.140.20.15"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="app-service">App Service</option>
                    <option value="database">Database</option>
                    <option value="cloud-cluster">Cloud Cluster</option>
                    <option value="gateway-firewall">Gateway / Firewall</option>
                    <option value="core-datacenter">Core Datacenter</option>
                    <option value="endpoint-workstation">Endpoint Workstation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Architectural Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="Perimeter">Perimeter</option>
                    <option value="Ingress">Ingress</option>
                    <option value="Application">Application</option>
                    <option value="Core Data">Core Data</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Environment</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="AWS us-east-1">AWS us-east-1</option>
                    <option value="GCP asia-east">GCP asia-east</option>
                    <option value="On-Premises Core">On-Premises Core</option>
                    <option value="Edge DC">Edge DC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Initial Risk Score ({formData.riskScore}/100)</label>
                  <input
                    type="range"
                    min="10"
                    max="99"
                    value={formData.riskScore}
                    onChange={(e) => setFormData({ ...formData, riskScore: Number(e.target.value) })}
                    className="w-full accent-cyan-400 mt-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Financial Exposure (USD)</label>
                  <input
                    type="number"
                    value={formData.financialExposure}
                    onChange={(e) => setFormData({ ...formData, financialExposure: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Initial Vulnerability & Solution Input */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-cyan-300">Initial Problem & Solution Specification</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">CVE ID</label>
                    <input
                      type="text"
                      placeholder="e.g. CVE-2024-3094"
                      value={formData.cve}
                      onChange={(e) => setFormData({ ...formData, cve: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg font-mono text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Problem Title</label>
                    <input
                      type="text"
                      placeholder="e.g. RCE in SSH Daemon"
                      value={formData.vulnTitle}
                      onChange={(e) => setFormData({ ...formData, vulnTitle: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Solution & Step-by-Step Remediation Plan</label>
                  <textarea
                    rows={2}
                    placeholder="Describe how to solve the problem (e.g. Upgrade firmware to v7.4.3 or enforce mTLS)..."
                    value={formData.vulnRemediation}
                    onChange={(e) => setFormData({ ...formData, vulnRemediation: e.target.value })}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-cyan-950 cursor-pointer"
                >
                  Add Device to Monitored Topology
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090d15] border border-red-900/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 font-bold text-base">
              <Trash2 className="w-5 h-5" />
              <span>Delete Device Confirmation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this device from the monitored 3D topology? This will remove all associated connection conduits, anomalies, and risk exposures.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const node = nodes.find((n) => n.id === deleteConfirmId);
                  if (node) handleDeleteConfirm(node.id, node.name);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-red-950 cursor-pointer"
              >
                Permanently Delete Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
