import React, { useState, useEffect, useRef } from 'react';
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
  Zap,
  Globe,
  Radio,
  Layers,
  SearchCode,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sliders,
  Award
} from 'lucide-react';
import { InfrastructureNode, DataFlowLink, EnterpriseRiskSummary } from '../types';
import { ThreeInfrastructureViewer } from '../components/three/ThreeInfrastructureViewer';
import { apiService } from '../services/apiService';
import { formatRiskScore } from '../utils/riskCalculator';
import { useScrollReveal } from '../components/common/ScrollEffects';

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

const FEATURE_CAROUSEL_ITEMS = [
  {
    icon: <BoxIcon className="w-5 h-5 text-cyan-400" />,
    title: 'Spatial 3D Infrastructure Mesh',
    desc: 'Interactive WebGL 3D rendering of physical server racks, cloud clusters, firewalls, and routers with real-time risk color-grading.'
  },
  {
    icon: <Activity className="w-5 h-5 text-red-400" />,
    title: 'Behavioral Anomaly Engine',
    desc: 'Identifies suspicious traffic bursts, lateral movement, and container escapes without relying solely on static IOC signatures.'
  },
  {
    icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
    title: 'FAIR Financial Loss Quantifier',
    desc: 'Translates technical vulnerabilities into real-world business loss expectancy ($) and Value-at-Risk (VaR 95th percentile).'
  },
  {
    icon: <SearchCode className="w-5 h-5 text-amber-400" />,
    title: 'Interactive Attack Path Tracer',
    desc: 'Graph-based visualization mapping initial breach vectors to high-value database targets and data exfiltration paths.'
  },
  {
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    title: 'OpenRouter AI ChatBot Assistant',
    desc: 'Contextual AI assistant powered by Gemini & Llama for real-time threat investigation, automated isolation, and policy guidance.'
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-cyan-300" />,
    title: 'Biometric Face ID Authentication',
    desc: 'Neural 468-point facial recognition login with camera video stream and synthetic fallback for instant SecOps authentication.'
  }
];

function BoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
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
  const [activeStoryStep, setActiveStoryStep] = useState<number>(1);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const workflowSectionRef = useRef<HTMLDivElement | null>(null);

  useScrollReveal();

  // High risk assets sorted for showcase
  const highRiskNodes = [...nodes]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 4);

  // Storytelling step focal node selection
  useEffect(() => {
    if (activeStoryStep === 1) {
      onSelectNode(null);
    } else if (activeStoryStep === 2) {
      onSelectNode('node-k8s-cluster');
    } else if (activeStoryStep === 3) {
      onSelectNode('node-app-cluster-a');
    } else if (activeStoryStep === 4) {
      onSelectNode('node-dc-core');
    } else if (activeStoryStep === 5) {
      onSelectNode('node-db-primary');
    } else if (activeStoryStep === 6) {
      onSelectNode('node-fw-ingress');
    }
  }, [activeStoryStep]);

  const scrollToWorkflow = () => {
    workflowSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="p-4 lg:p-8 space-y-12 max-w-[1700px] mx-auto font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* 1. HERO SECTION: Cinematic Split Layout */}
      <section 
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch reveal-on-scroll"
        aria-label="Threat Catcher Landing Hero"
      >
        {/* Left Hero Content */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-b from-[#080d19] via-[#060912] to-[#04060c] border border-cyan-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl bg-orb-cyan pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Monitoring infrastructure telemetry</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              See Hidden Threats <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                Before They Become
              </span> <br />
              Business Losses.
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Threat Catcher uses continuous behavioral anomaly analysis and FAIR loss modeling to detect compromised firewalls, clusters, and databases without relying strictly on known signatures.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="cta-explore-command"
                onClick={() => onNavigate('/dashboard')}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/60 transition-all cursor-pointer group"
              >
                <span>Explore Live Command Center</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="cta-how-it-works"
                onClick={scrollToWorkflow}
                className="px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>View How It Works</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Key Posture Metric Cards (Count-Up Animation) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80 text-xs relative z-10">
            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/70">
              <div className="text-slate-400 text-[11px] mb-1">Monitored Assets</div>
              <div className="text-xl font-black font-mono text-white">
                {nodes.length}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">100% Active</div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/70">
              <div className="text-slate-400 text-[11px] mb-1">Risk Score</div>
              <div className="text-xl font-black font-mono text-cyan-300">
                {formatRiskScore(riskSummary.enterpriseRiskScore)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{riskSummary.riskLevel} Level</div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/70">
              <div className="text-slate-400 text-[11px] mb-1">Critical Signals</div>
              <div className="text-xl font-black font-mono text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                {riskSummary.criticalAnomaliesCount}
              </div>
              <div className="text-[10px] text-red-400/80 mt-1">Active Triage</div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/70">
              <div className="text-slate-400 text-[11px] mb-1">Financial Exposure</div>
              <div className="text-xl font-black font-mono text-emerald-400">
                ₹3.5L
              </div>
              <div className="text-[10px] text-slate-400 mt-1">FAIR Modeled</div>
            </div>
          </div>
        </div>

        {/* Right Hero Visual: 3D Centerpiece Viewer */}
        <div className="lg:col-span-7 relative min-h-[480px] lg:min-h-[580px] flex flex-col rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl">
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
            className="flex-1"
          />
        </div>
      </section>

      {/* 2. STICKY 3D SHOWCASE SECTION (Scroll-Based Storytelling Workflow) */}
      <section 
        ref={workflowSectionRef}
        className="space-y-6 pt-4 reveal-scale"
      >
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
            Interactive Security Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How Threat Catcher Identifies & Mitigates Risk
          </h2>
          <p className="text-xs text-slate-400">
            Step through the continuous intelligence lifecycle to see how spatial telemetry converts into actionable risk reduction.
          </p>
        </div>

        {/* Step Selector Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {[
            { step: 1, title: '1. Baseline' },
            { step: 2, title: '2. Anomaly' },
            { step: 3, title: '3. Probability' },
            { step: 4, title: '4. Propagation' },
            { step: 5, title: '5. Financial' },
            { step: 6, title: '6. Remediation' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveStoryStep(item.step)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                activeStoryStep === item.step
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-950'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Step Content Card */}
        <div className="p-6 bg-[#080d19] border border-cyan-500/30 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            {activeStoryStep === 1 && (
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Step 1 • Continuous Ingestion</span>
                <h3 className="text-xl font-bold text-white mt-1">Normal Baseline Telemetry Ingestion</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Firewalls, routers, Kubernetes clusters, and core databases continually stream bandwidth, CPU load, and network flow telemetry into the Threat Catcher analysis engine.
                </p>
              </div>
            )}
            {activeStoryStep === 2 && (
              <div>
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase">Step 2 • Behavioral Detection</span>
                <h3 className="text-xl font-bold text-white mt-1">Behavioral Anomaly Spike Detected</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A workstation or cluster sends 4.8 GB of outbound traffic to an unverified IP destination. The anomaly engine flags a deviation without requiring a pre-existing malware hash.
                </p>
              </div>
            )}
            {activeStoryStep === 3 && (
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Step 3 • Compromise Assessment</span>
                <h3 className="text-xl font-bold text-white mt-1">Compromise Probability Calculation</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Machine learning model correlates CVSS 8.6 CVE container escape vulnerabilities with real-time network behavior, computing a 51% compromise probability for the Kubernetes cluster.
                </p>
              </div>
            )}
            {activeStoryStep === 4 && (
              <div>
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Step 4 • Lateral Movement</span>
                <h3 className="text-xl font-bold text-white mt-1">Attack Path & Lateral Risk Propagation</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Graph relationships reveal that if the application mesh is breached, adversaries can move laterally to the Core Data Vault and Financial SQL Database.
                </p>
              </div>
            )}
            {activeStoryStep === 5 && (
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Step 5 • Financial Modeling</span>
                <h3 className="text-xl font-bold text-white mt-1">FAIR Financial Exposure Quantified</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The FAIR financial loss model estimates a potential Single Loss Expectancy of ₹3,50,000, framing the cyber threat directly in business terms for executive leadership.
                </p>
              </div>
            )}
            {activeStoryStep === 6 && (
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Step 6 • Actionable Defense</span>
                <h3 className="text-xl font-bold text-white mt-1">Automated Device Isolation & Remediation</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  SecOps analysts can isolate the compromised node with 1 click or invoke the AI ChatBot to patch CVEs, immediately reducing enterprise risk score down to healthy levels.
                </p>
              </div>
            )}
          </div>

          <div className="md:col-span-4 flex items-center justify-end gap-2">
            <button
              onClick={() => onNavigate('/infrastructure')}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>View in 3D Space</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. HORIZONTAL FEATURE SHOWCASE CAROUSEL */}
      <section className="space-y-4 reveal-left">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <span>Platform Core Capabilities</span>
            </h2>
            <p className="text-xs text-slate-400">Enterprise defensive modules integrated into a unified risk platform</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
              disabled={carouselIndex === 0}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCarouselIndex(Math.min(FEATURE_CAROUSEL_ITEMS.length - 3, carouselIndex + 1))}
              disabled={carouselIndex >= FEATURE_CAROUSEL_ITEMS.length - 3}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURE_CAROUSEL_ITEMS.slice(carouselIndex, carouselIndex + 3).map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 card-cyber-glow space-y-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HIGH RISK ASSET & QUICK DEFENSE ACTION SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 reveal-on-scroll">
        {/* Highest Risk Infrastructure Assets */}
        <div className="lg:col-span-8 p-6 bg-[#080d19] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Highest Risk Monitored Assets</span>
              </h2>
              <p className="text-xs text-slate-400">Ranked by risk score, compromise probability, and financial exposure</p>
            </div>
            <button
              onClick={() => onNavigate('/assets')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>View All Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highRiskNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedNodeId === node.id
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {node.tier}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-snug">{node.name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{node.ipAddress}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-base font-black font-mono ${
                      node.riskScore >= 70 ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {node.riskScore}/100
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ₹{(node.financialExposure / 10).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] text-red-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {node.vulnerabilities.length} Active CVEs
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode(node.id);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Inspect 3D</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Immediate Priority Remediation Actions */}
        <div className="lg:col-span-4 p-6 bg-[#080d19] border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Priority Remediation Fixes</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-800">
                High ROI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Applying top 2 prioritized remediation recommendations reduces enterprise financial risk exposure by <strong className="text-emerald-400">₹2,45,000</strong>.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-red-400 font-bold uppercase">P1 • Perimeter Gateway</span>
                  <span className="font-mono text-emerald-400 font-bold">-₹1,45,000 Exp</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">Enforce HTTP/2 Stream Reset Rate Limits</div>
                <button
                  onClick={() => onNavigate('/recommendations')}
                  className="w-full mt-1 py-1.5 px-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Review Recommendation</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-red-400 font-bold uppercase">P1 • App Microservices</span>
                  <span className="font-mono text-emerald-400 font-bold">-₹1,00,000 Exp</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">Patch CVE-2024-21626 Container Escape</div>
                <button
                  onClick={() => onNavigate('/recommendations')}
                  className="w-full mt-1 py-1.5 px-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Review Recommendation</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigate('/reports')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Generate Audit & Risk PDF Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION BANNER */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-cyan-950 via-blue-950 to-slate-950 border border-cyan-500/40 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-2 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ready to Secure Your Cyber Infrastructure?
          </h2>
          <p className="text-xs text-slate-300">
            Launch the real-time command center dashboard or run a device-by-device diagnostic scan now.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-950 cursor-pointer flex items-center gap-2 transition-all"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('/infrastructure')}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2 transition-colors"
            >
              <span>Explore 3D Topology</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
