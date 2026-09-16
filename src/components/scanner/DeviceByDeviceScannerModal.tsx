import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Trash2, 
  Wrench, 
  Activity, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Wifi, 
  DollarSign, 
  ArrowRight,
  Radar,
  RefreshCw,
  Info
} from 'lucide-react';
import { InfrastructureNode } from '../../types';

interface DeviceByDeviceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: InfrastructureNode[];
  onSelectNode: (id: string | null) => void;
  onQuarantineNode: (id: string) => void;
  onDeleteDevice: (id: string) => boolean;
  onSolveDeviceProblem: (id: string) => boolean;
}

export const DeviceByDeviceScannerModal: React.FC<DeviceByDeviceScannerModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onSelectNode,
  onQuarantineNode,
  onDeleteDevice,
  onSolveDeviceProblem
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen || nodes.length === 0) return null;

  // Clamp index within bounds
  const activeIndex = Math.min(currentIndex, nodes.length - 1);
  const currentNode = nodes[activeIndex];
  const isQuarantined = currentNode.status === 'quarantined';

  const handleNext = () => {
    setIsScanning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % nodes.length);
      setIsScanning(false);
    }, 200);
  };

  const handlePrev = () => {
    setIsScanning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + nodes.length) % nodes.length);
      setIsScanning(false);
    }, 200);
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return { bg: 'bg-red-500/20 text-red-400 border-red-500/40', label: 'CRITICAL THREAT' };
    if (score >= 65) return { bg: 'bg-orange-500/20 text-orange-400 border-orange-500/40', label: 'HIGH RISK' };
    if (score >= 40) return { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40', label: 'MODERATE RISK' };
    return { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', label: 'SECURE / HEALTHY' };
  };

  const badge = getRiskBadge(currentNode.riskScore);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#090d16] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-[#0a101f] to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Radar className="w-5 h-5 animate-spin text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Threat Catcher — Device-by-Device Scanner</h3>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-800">
                  STEP {activeIndex + 1} OF {nodes.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sequential diagnostic scanner inspecting risks, isolation, and root causes device-by-device.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Navigator Controls */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <button
            onClick={handlePrev}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Device</span>
          </button>

          <div className="flex items-center gap-1 max-w-[200px] overflow-x-auto">
            {nodes.map((n, idx) => (
              <button
                key={n.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === activeIndex
                    ? 'bg-cyan-400 scale-125 ring-2 ring-cyan-950'
                    : n.riskScore >= 70
                    ? 'bg-red-500/80'
                    : 'bg-slate-700'
                }`}
                title={`${n.name} (Risk: ${n.riskScore}/100)`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Next Device</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {isScanning ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="font-mono text-cyan-300 text-xs">Scanning 3D Telemetry for Device #{activeIndex + 1}...</p>
            </div>
          ) : (
            <>
              {/* Device Overview Banner */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-medium">{currentNode.category}</span>
                    <span className="text-xs text-slate-500 font-mono">({currentNode.location || 'AWS Cloud'})</span>
                  </div>
                  <h2 className="text-lg font-bold text-white leading-tight">{currentNode.name}</h2>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5">IP: {currentNode.ipAddress} • {currentNode.hostname}</p>
                </div>

                <div className="text-right sm:text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Risk Score</div>
                  <div className={`text-2xl font-mono font-extrabold ${
                    currentNode.riskScore >= 70 ? 'text-red-400' : currentNode.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {currentNode.riskScore} / 100
                  </div>
                </div>
              </div>

              {/* THREAT EXPLANATION CARD (Student-Friendly Non-Tech Explanation) */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${
                currentNode.riskScore >= 70
                  ? 'bg-red-950/40 border-red-800/80 text-red-200'
                  : currentNode.riskScore >= 40
                  ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                  : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    {currentNode.riskScore >= 70 ? (
                      <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                    ) : currentNode.riskScore >= 40 ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>Why This Threat Is Happening (Easy Explanation)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 font-bold">
                    {currentNode.vulnerabilities.length > 0 ? currentNode.vulnerabilities[0].cve : 'NO ACTIVE CVE'}
                  </span>
                </div>

                {currentNode.vulnerabilities.length > 0 ? (
                  <div className="space-y-2.5 text-xs leading-relaxed">
                    <div>
                      <strong className="text-white block mb-0.5">What is the problem?</strong>
                      <p className="text-slate-300">
                        {currentNode.vulnerabilities[0].title}. {currentNode.vulnerabilities[0].description}
                      </p>
                    </div>

                    <div className="bg-black/40 p-2.5 rounded-lg border border-white/10">
                      <strong className="text-amber-300 block mb-0.5">How could an attacker exploit this?</strong>
                      <p className="text-slate-300 text-[11px]">
                        An attacker on the internet can send malicious packets over the network to bypass password checks and execute unauthorized computer commands on <strong>{currentNode.name}</strong>.
                      </p>
                    </div>

                    <div>
                      <strong className="text-emerald-300 block mb-0.5">How to fix it:</strong>
                      <p className="text-emerald-200 font-mono text-[11px] bg-emerald-950/50 p-2 rounded border border-emerald-800/50">
                        {currentNode.vulnerabilities[0].remediation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-emerald-300">Device is Secure!</p>
                    <p className="text-slate-300">
                      No active security threats or software bugs detected on <strong>{currentNode.name}</strong>. Firewalls and access controls are actively protecting this node.
                    </p>
                  </div>
                )}
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">CPU Load</div>
                  <div className="text-sm font-mono font-bold text-cyan-300 mt-1">{currentNode.cpuLoad}%</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Throughput</div>
                  <div className="text-sm font-mono font-bold text-cyan-300 mt-1">{currentNode.networkThroughputMbps || 250} Mbps</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Loss Exposure</div>
                  <div className="text-sm font-mono font-bold text-cyan-300 mt-1">${(currentNode.financialExposure / 1000).toFixed(0)}k</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Status</div>
                  <div className={`text-sm font-mono font-bold uppercase mt-1 ${isQuarantined ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {currentNode.status}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Device Action Toolbar (Isolate, Remediate, Delete) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Isolate Device Button */}
            <button
              onClick={() => onQuarantineNode(currentNode.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isQuarantined
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950'
                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-lg shadow-amber-950'
              }`}
            >
              {isQuarantined ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{isQuarantined ? 'Un-Isolate Device' : 'Isolate Device'}</span>
            </button>

            {/* Remediate / Patch Device Button */}
            <button
              onClick={() => onSolveDeviceProblem(currentNode.id)}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950"
            >
              <Wrench className="w-4 h-4" />
              <span>Fix / Remediate Threat</span>
            </button>
          </div>

          {/* Delete Device Button */}
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${currentNode.name}? This will remove it from the 3D topology map.`)) {
                onDeleteDevice(currentNode.id);
                if (nodes.length > 1) {
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                } else {
                  onClose();
                }
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Delete Device</span>
          </button>
        </div>
      </div>
    </div>
  );
};
