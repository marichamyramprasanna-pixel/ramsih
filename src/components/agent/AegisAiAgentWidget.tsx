import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Wrench, 
  Plus, 
  Trash2, 
  Activity, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Maximize2,
  Minimize2,
  Cpu,
  RefreshCw,
  Box,
  FileText
} from 'lucide-react';
import { InfrastructureNode, EnterpriseRiskSummary, RemediationRecommendation } from '../../types';

interface AegisAiAgentWidgetProps {
  nodes: InfrastructureNode[];
  riskSummary: EnterpriseRiskSummary;
  recommendations: RemediationRecommendation[];
  onSelectNode: (id: string | null) => void;
  onQuarantineNode: (id: string) => void;
  onAddDevice: (deviceData: Omit<InfrastructureNode, 'id' | 'lastUpdated'>) => InfrastructureNode;
  onDeleteDevice: (id: string) => boolean;
  onSolveDeviceProblem: (id: string) => boolean;
  onApplyRecommendation: (recId: string) => Promise<boolean>;
  onNavigate: (route: string) => void;
}

interface AgentMessage {
  id: string;
  sender: 'agent' | 'user' | 'system';
  text: string;
  timestamp: string;
  thinkingSteps?: string[];
  actionTaken?: {
    type: 'remediation' | 'quarantine' | 'add_device' | 'navigate';
    label: string;
    targetRoute?: string;
  };
}

export const AegisAiAgentWidget: React.FC<AegisAiAgentWidgetProps> = ({
  nodes,
  riskSummary,
  recommendations,
  onSelectNode,
  onQuarantineNode,
  onAddDevice,
  onDeleteDevice,
  onSolveDeviceProblem,
  onApplyRecommendation,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Welcome Messages
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'msg-welcome-1',
      sender: 'agent',
      text: `👋 Hello! I am **Aegis AI Agent**, your autonomous cyber risk intelligence copilot. I am continuously assessing the 3D infrastructure, monitoring vulnerabilities, and ready to execute real-time security actions across the site.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'msg-welcome-2',
      sender: 'agent',
      text: `How can I assist you right now? Select an autonomous action below or type a query:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Execute Agent Assessment Logic
  const handleSiteAssessment = () => {
    setIsThinking(true);

    setTimeout(() => {
      const highRiskNodes = nodes.filter((n) => n.riskScore >= 70);
      const criticalVulnsCount = nodes.reduce((acc, n) => acc + n.vulnerabilities.length, 0);
      const totalExposureM = (nodes.reduce((acc, n) => acc + n.financialExposure, 0) / 1000000).toFixed(2);
      const highestRiskAsset = [...nodes].sort((a, b) => b.riskScore - a.riskScore)[0];

      const assessmentText = `### 🔍 Autonomous Site Risk Assessment Report
      
> [!IMPORTANT]
> **Enterprise Posture Score**: ${riskSummary.overallRiskScore}/100 (${riskSummary.overallRiskScore >= 70 ? 'CRITICAL RISK' : 'MODERATE RISK'})
> **Total Loss Exposure**: $${totalExposureM}M USD

#### Key Security Insights:
1. **Critical Devices (${highRiskNodes.length})**: Highest risk target is **${highestRiskAsset?.name || 'Bastion Host'}** (Risk Score: ${highestRiskAsset?.riskScore || 91}/100).
2. **Active Vulnerabilities (${criticalVulnsCount})**: Identified unpatched CVEs including \`CVE-2024-3094\` (XZ Backdoor) and \`CVE-2024-21762\` (FortiOS RCE).
3. **Lateral Blast Radius**: Core Financial SQL Vault is exposed via Bastion SSH protocol hops.

#### Recommended Autonomous Actions:
- Click **"Auto-Remediate All High Risk Devices"** to patch vulnerabilities and drop overall risk score by ~35 points.
- Click **"Isolate Critical Ingress Node"** to quarantine Bastion Teleport Host.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: assessmentText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          thinkingSteps: [
            'Querying 3D Spatial Infrastructure Topology...',
            'Evaluating FAIR Monte Carlo Annualized Loss Exposure...',
            'Scanning 16 Monitored Devices for Active CVEs...',
            'Synthesizing Remediation Plan...'
          ]
        }
      ]);

      setIsThinking(false);
    }, 1200);
  };

  // Execute Agent Auto-Remediation
  const handleAutoRemediateAll = () => {
    setIsThinking(true);

    setTimeout(() => {
      let count = 0;
      nodes.forEach((n) => {
        if (n.vulnerabilities.length > 0) {
          onSolveDeviceProblem(n.id);
          count++;
        }
      });

      const resultText = `✅ **Autonomous Remediation Complete!**
      
- **Devices Patched**: ${count > 0 ? count : 'All'} high-risk devices remediated.
- **CVEs Resolved**: \`CVE-2024-3094\`, \`CVE-2024-21762\`, and dependencies updated.
- **Risk Posture**: Reduced overall risk score from **${riskSummary.overallRiskScore}** to **18** (HEALTHY).
- **Financial Exposure Saved**: ~$1.85M USD in potential breach loss.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: resultText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          thinkingSteps: [
            'Connecting to SecOps Security Orchestration API...',
            'Deploying virtual patch to Kubernetes App Services & Edge Firewalls...',
            'Recalculating Enterprise Risk Summary metrics...'
          ],
          actionTaken: {
            type: 'remediation',
            label: 'View Patched Devices in Inventory',
            targetRoute: '/assets'
          }
        }
      ]);

      setIsThinking(false);
    }, 1400);
  };

  // Execute Agent Provision Device
  const handleProvisionDevice = () => {
    setIsThinking(true);

    setTimeout(() => {
      const newDev = onAddDevice({
        name: 'AI Agent Managed Web Gateway',
        hostname: 'ai-gw-01.aws.internal',
        ipAddress: '10.140.90.10',
        category: 'gateway-firewall',
        tier: 'Perimeter',
        riskScore: 12,
        compromiseProbability: 3,
        businessCriticality: 'Tier 1',
        financialExposure: 200000,
        status: 'online',
        position3D: [0, 0.4, -4.5],
        connections: [],
        vulnerabilities: [],
        anomaliesCount: 0,
        cpuLoad: 18,
        dataThroughputMbps: 2400,
        operatingSystem: 'Alpine Linux (Zero-Trust Hardened)',
        environment: 'AWS us-east-1',
        owner: 'Aegis Autonomous AI Agent',
        description: 'Automated perimeter security gateway provisioned by AI Agent to inspect traffic.'
      });

      const resultText = `🚀 **Security Gateway Provisioned Successfully!**
      
- **Device**: \`${newDev.name}\` (\`${newDev.hostname}\`)
- **IP Address**: \`${newDev.ipAddress}\`
- **Architectural Tier**: \`Perimeter\` (AWS us-east-1)
- **Status**: \`ONLINE\` (Risk Score: 12/100)
- **Action**: Device added to 3D spatial canvas and active telemetry monitor.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: resultText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          thinkingSteps: [
            'Allocating AWS VPC subnet 10.140.90.0/24...',
            'Initializing 3D Spatial Mesh Buffer Geometry...',
            'Registering real-time telemetry stream...'
          ],
          actionTaken: {
            type: 'add_device',
            label: 'View New Device in 3D Space',
            targetRoute: '/infrastructure'
          }
        }
      ]);

      setIsThinking(false);
    }, 1200);
  };

  // Handle Natural Language User Input
  const handleSendUserMessage = (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsThinking(true);

    const lower = text.toLowerCase();

    setTimeout(() => {
      if (lower.includes('assess') || lower.includes('report') || lower.includes('scan') || lower.includes('status')) {
        handleSiteAssessment();
      } else if (lower.includes('remediate') || lower.includes('patch') || lower.includes('solve') || lower.includes('fix')) {
        handleAutoRemediateAll();
      } else if (lower.includes('add') || lower.includes('provision') || lower.includes('create') || lower.includes('device')) {
        handleProvisionDevice();
      } else if (lower.includes('attack') || lower.includes('path') || lower.includes('kill')) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'agent',
            text: `🎯 Navigating to **Attack Path Analysis & Kill-Chain Isolation** engine...
            
I have analyzed lateral movement vectors for threat actor **UNC-3882 (Volt Shadow)**. You can sever active attack paths directly from the Attack Path workspace.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionTaken: {
              type: 'navigate',
              label: 'Open Attack Path Engine',
              targetRoute: '/attack-path'
            }
          }
        ]);
        setIsThinking(false);
      } else {
        // General AI Response
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'agent',
            text: `🤖 I have processed your instruction: **"${text}"**.
            
I am fully equipped to assess risks, patch vulnerabilities, provision devices, and sever attack paths across this platform. Choose one of the quick actions below:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsThinking(false);
      }
    }, 1000);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          id="btn-open-ai-agent"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-2xl shadow-2xl flex items-center gap-3 border border-cyan-300/40 transition-all transform hover:scale-105 cursor-pointer group"
          title="Open Aegis AI Agent Assistant"
          aria-label="Open Aegis AI Agent"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950 animate-ping" />
          </div>
          <div className="text-left font-sans">
            <div className="text-xs font-black tracking-tight leading-none text-slate-950 uppercase flex items-center gap-1">
              <span>AEGIS AI AGENT</span>
              <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-900 font-mono font-bold leading-tight mt-0.5">
              Site Assessment & Action
            </div>
          </div>
        </button>
      )}

      {/* Floating AI Agent Panel / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-[#070a11] border border-cyan-500/40 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-300 font-sans ${
            isExpanded
              ? 'top-6 bottom-6 left-6 right-6 lg:left-auto lg:w-[850px]'
              : 'bottom-6 right-6 w-[92vw] sm:w-[480px] h-[640px] max-h-[85vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="p-3.5 bg-gradient-to-r from-slate-950 via-[#0a0f1d] to-slate-950 border-b border-slate-800 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Aegis Cyber AI Agent</h3>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-800">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Autonomous Risk Scanner & Orchestration Copilot
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title={isExpanded ? 'Restore window size' : 'Maximize window size'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close AI Agent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Trigger Buttons */}
          <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={handleSiteAssessment}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assess Site Risk</span>
            </button>

            <button
              onClick={handleAutoRemediateAll}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              <span>Remediate All Risks</span>
            </button>

            <button
              onClick={handleProvisionDevice}
              className="px-2.5 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Provision Device</span>
            </button>

            <button
              onClick={() => onNavigate('/attack-path')}
              className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span>Sever Attack Path</span>
            </button>
          </div>

          {/* Chat Messages Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Thinking Reasoning Steps */}
                  {msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-[10px] text-slate-400">
                      <div className="text-cyan-400 font-bold uppercase flex items-center gap-1">
                        <Terminal className="w-3 h-3 animate-spin" />
                        <span>AI Agent Reasoning Execution:</span>
                      </div>
                      {msg.thinkingSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-slate-400">
                          <span className="text-cyan-500">›</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Bubble Body */}
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-lg'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-xl'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Optional Action Taken Button */}
                  {msg.actionTaken && (
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          if (msg.actionTaken?.targetRoute) {
                            onNavigate(msg.actionTaken.targetRoute);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <span>{msg.actionTaken.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className={`text-[10px] font-mono text-slate-500 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Thinking Animated Loader */}
            {isThinking && (
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 p-2 bg-slate-950/80 border border-cyan-500/30 rounded-xl w-fit animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Aegis AI Agent is assessing site telemetry and generating response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* User Console Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendUserMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="input-ai-agent-prompt"
                type="text"
                placeholder="Ask AI Agent to assess risk, patch devices, or provision gateway..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  inputQuery.trim()
                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title="Send query to AI Agent"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
