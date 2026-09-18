import React, { useState } from 'react';
import { 
  GitCommit, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Unlock,
  DollarSign,
  Activity,
  Layers,
  Terminal,
  Crosshair,
  Share2
} from 'lucide-react';
import { InfrastructureNode, DataFlowLink } from '../types';
import { ThreeInfrastructureViewer } from '../components/three/ThreeInfrastructureViewer';

interface AttackPathPageProps {
  nodes: InfrastructureNode[];
  links: DataFlowLink[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onQuarantineNode: (id: string) => void;
  onNavigate: (route: string) => void;
}

interface AttackScenario {
  id: string;
  title: string;
  threatActor: string;
  initialVector: string;
  targetAsset: string;
  totalLossExposureUSD: number;
  blastRadiusPercentage: number;
  status: 'active' | 'severed';
  hops: {
    hopIndex: number;
    sourceNodeId: string;
    sourceNodeName: string;
    targetNodeId: string;
    targetNodeName: string;
    protocol: string;
    cve: string;
    mitreTactic: string;
    description: string;
    remediationAction: string;
  }[];
}

export const AttackPathPage: React.FC<AttackPathPageProps> = ({
  nodes,
  links,
  selectedNodeId,
  onSelectNode,
  onQuarantineNode,
  onNavigate
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-1');
  const [severedScenarios, setSeveredScenarios] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const attackScenarios: AttackScenario[] = [
    {
      id: 'scenario-1',
      title: 'Operation Velvet Breach: XZ Backdoor to Financial SQL Vault',
      threatActor: 'UNC-3882 (Volt Shadow)',
      initialVector: 'Trojanized liblzma Build Dependency in Bastion Control Plane',
      targetAsset: 'Primary Financial SQL Vault (node-dc-core)',
      totalLossExposureUSD: 2450000,
      blastRadiusPercentage: 68.5,
      status: severedScenarios['scenario-1'] ? 'severed' : 'active',
      hops: [
        {
          hopIndex: 1,
          sourceNodeId: 'node-internet',
          sourceNodeName: 'External Ingress Surges',
          targetNodeId: 'node-bastion',
          targetNodeName: 'Zero-Trust Bastion Teleport Host',
          protocol: 'SSH / TLS',
          cve: 'CVE-2024-3094',
          mitreTactic: 'T1190 - Exploit Public-Facing Application',
          description: 'Attacker leverages malicious liblzma 5.6.0 binary to intercept SSH authentication calls.',
          remediationAction: 'Quarantine Bastion host and downgrade liblzma package to 5.4.6.'
        },
        {
          hopIndex: 2,
          sourceNodeId: 'node-bastion',
          sourceNodeName: 'Zero-Trust Bastion Teleport Host',
          targetNodeId: 'node-dc-core',
          targetNodeName: 'Primary Financial SQL Vault',
          protocol: 'SSH / mTLS',
          cve: 'CVE-2024-3094',
          mitreTactic: 'T1021.004 - Remote Services: SSH',
          description: 'Attacker pivots from compromised Bastion using stolen root certificates to query SQL Vault.',
          remediationAction: 'Revoke Kerberos/SSH keys and enforce mTLS with Kubernetes API.'
        },
        {
          hopIndex: 3,
          sourceNodeId: 'node-dc-core',
          sourceNodeName: 'Primary Financial SQL Vault',
          targetNodeId: 'node-payment-api',
          targetNodeName: 'Kubernetes Payment Microservice API',
          protocol: 'gRPC / TLS-DB',
          cve: 'CVE-2024-21762',
          mitreTactic: 'T1041 - Exfiltration Over C2 Protocol',
          description: 'Unauthorized bulk query exfiltrates 1.2M cardholder tokens across payment boundary.',
          remediationAction: 'Isolate database tier via SDN VLAN swap and enable rate limiting.'
        }
      ]
    },
    {
      id: 'scenario-2',
      title: 'Perimeter SSL-VPN Buffer Spray & Database Infiltration',
      threatActor: 'Scattered Viper (APT-41 Syndicate)',
      initialVector: 'Unauthenticated Out-of-Bound Write in Perimeter VPN Gateway',
      targetAsset: 'Primary Financial SQL Vault (node-dc-core)',
      totalLossExposureUSD: 1850000,
      blastRadiusPercentage: 52.0,
      status: severedScenarios['scenario-2'] ? 'severed' : 'active',
      hops: [
        {
          hopIndex: 1,
          sourceNodeId: 'node-vpn-gw',
          sourceNodeName: 'Executive & Remote VPN Gateway',
          targetNodeId: 'node-waf-edge',
          targetNodeName: 'Edge Web Application Firewall (WAF)',
          protocol: 'HTTPS Ingress',
          cve: 'CVE-2024-21762',
          mitreTactic: 'T1190 - Exploit Public-Facing Application',
          description: 'Specially crafted HTTP requests trigger out-of-bound write in sslvpnd daemon.',
          remediationAction: 'Upgrade FortiOS firmware to v7.4.3 or disable SSL-VPN web portal.'
        },
        {
          hopIndex: 2,
          sourceNodeId: 'node-waf-edge',
          sourceNodeName: 'Edge Web Application Firewall (WAF)',
          targetNodeId: 'node-payment-api',
          targetNodeName: 'Kubernetes Payment Microservice API',
          protocol: 'HTTPS',
          cve: 'CVE-2023-44487',
          mitreTactic: 'T1078 - Valid Accounts',
          description: 'Attacker uses hijacked employee VPN session token to bypass edge rate limits.',
          remediationAction: 'Force immediate re-authentication for all active employee VPN sessions.'
        }
      ]
    },
    {
      id: 'scenario-3',
      title: 'GitOps CI/CD Controller Supply Chain Credential Poisoning',
      threatActor: 'Lazarus Cyber Operations',
      initialVector: 'Anomalous Automated Credential Probing on Build Runners',
      targetAsset: 'GitOps CI/CD Deployment Controller (node-cicd-runner)',
      totalLossExposureUSD: 1100000,
      blastRadiusPercentage: 42.0,
      status: severedScenarios['scenario-3'] ? 'severed' : 'active',
      hops: [
        {
          hopIndex: 1,
          sourceNodeId: 'node-cicd-runner',
          sourceNodeName: 'GitOps CI/CD Deployment Controller',
          targetNodeId: 'node-bastion',
          targetNodeName: 'Zero-Trust Bastion Teleport Host',
          protocol: 'SSH / AWS STS',
          cve: 'CVE-2024-3094',
          mitreTactic: 'T1195.002 - Supply Chain Compromise',
          description: 'Out-of-schedule build runner probes long-lived AWS IAM STS root credentials.',
          remediationAction: 'Revoke long-lived IAM user keys; replace with short-lived OIDC roles.'
        }
      ]
    }
  ];

  const currentScenario = attackScenarios.find((s) => s.id === selectedScenarioId) || attackScenarios[0];
  const isSevered = severedScenarios[currentScenario.id];

  const handleSeverKillChain = () => {
    setSeveredScenarios({ ...severedScenarios, [currentScenario.id]: true });

    // Quarantine the entry hop node
    const firstHop = currentScenario.hops[0];
    if (firstHop) {
      onQuarantineNode(firstHop.targetNodeId);
    }

    setToastMessage(`Attack Path Severed! Entrance node quarantined & credentials revoked.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto relative overflow-hidden">
      {/* Background Floating Ambient Glowing Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl bg-orb-cyan pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl bg-orb-blue pointer-events-none" />
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-950/95 border border-emerald-500/50 rounded-xl shadow-2xl flex items-center gap-3 text-emerald-200 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-mono text-[10px] font-bold uppercase border border-red-800">
              ATTACK PATH & BLAST RADIUS ENGINE
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Adversary Lateral Movement Simulator
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Attack Path Analysis & Kill-Chain Isolation
          </h1>
          <p className="text-xs text-slate-400">
            Map entry vectors, lateral movement hops, MITRE ATT&CK tactics, and sever kill-chains before crown jewels are compromised.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeverKillChain}
            disabled={isSevered}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              isSevered
                ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 cursor-default'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950'
            }`}
          >
            {isSevered ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Kill-Chain Severed & Contained</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Sever Attack Vector / Break Kill-Chain</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Attack Scenario Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {attackScenarios.map((scenario) => {
          const isSelected = scenario.id === selectedScenarioId;
          const isScenarioSevered = severedScenarios[scenario.id];

          return (
            <div
              key={scenario.id}
              onClick={() => setSelectedScenarioId(scenario.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-cyan-950/20 border-cyan-500/60 shadow-xl ring-1 ring-cyan-500/30'
                  : 'bg-[#090d15] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  isScenarioSevered
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-red-950 text-red-300 border-red-800'
                }`}>
                  {isScenarioSevered ? 'CONTAINED' : 'CRITICAL ATTACK PATH'}
                </span>
                <span className="font-mono text-xs font-bold text-cyan-300">
                  ${(scenario.totalLossExposureUSD / 1000000).toFixed(2)}M
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">{scenario.title}</h3>
              <p className="text-[11px] text-slate-400 font-mono">Actor: {scenario.threatActor}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-800/80">
                <span>{scenario.hops.length} Lateral Hops</span>
                <span>Blast Radius: {scenario.blastRadiusPercentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Interactive 3D/2D Viewer + Step-by-Step Kill Chain Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 3D Topology Attack Path Canvas */}
        <div className="lg:col-span-7 bg-[#090d15] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">Live Topology Attack Path View</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Scenario: <strong className="text-cyan-300">{currentScenario.threatActor}</strong>
            </span>
          </div>

          <div className="h-[440px] w-full rounded-xl overflow-hidden border border-slate-800">
            <ThreeInfrastructureViewer
              nodes={nodes}
              links={links}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              onQuarantineNode={onQuarantineNode}
            />
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between font-mono">
            <span>Entry Hop: <strong className="text-red-400">{currentScenario.hops[0]?.sourceNodeName}</strong></span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span>Target: <strong className="text-cyan-400">{currentScenario.targetAsset}</strong></span>
          </div>
        </div>

        {/* Right Column: Step-by-Step Lateral Movement Timeline */}
        <div className="lg:col-span-5 bg-[#090d15] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase">Attack Vector Details</div>
              <h3 className="text-base font-bold text-white">{currentScenario.title}</h3>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs font-bold">
              {currentScenario.hops.length} Steps
            </span>
          </div>

          {/* Hop Steps Pipeline */}
          <div className="space-y-4">
            {currentScenario.hops.map((hop) => (
              <div
                key={hop.hopIndex}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 relative"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-950 border border-red-700 text-red-300 font-mono font-bold text-[11px] flex items-center justify-center">
                      #{hop.hopIndex}
                    </span>
                    <span className="font-bold text-white">{hop.sourceNodeName}</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                    {hop.protocol}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pl-8">
                  <ArrowRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Target: <strong className="text-slate-200">{hop.targetNodeName}</strong></span>
                </div>

                <div className="pl-8 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-red-400 font-bold text-[11px]">{hop.cve}</span>
                    <span className="text-slate-500">•</span>
                    <span className="font-mono text-[10px] text-amber-300">{hop.mitreTactic}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{hop.description}</p>

                  <div className="mt-2 p-2 rounded bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200">
                    <strong className="text-cyan-400">Step Solution:</strong> {hop.remediationAction}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Sever Button */}
          <div className="pt-2">
            <button
              onClick={handleSeverKillChain}
              disabled={isSevered}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                isSevered
                  ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950'
              }`}
            >
              {isSevered ? (
                <span>Attack Vector Contained & Quarantined</span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Execute Emergency Kill-Chain Severance</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
