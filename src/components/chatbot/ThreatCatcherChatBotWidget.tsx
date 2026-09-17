import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  RefreshCw, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  HelpCircle,
  MessageSquare,
  ChevronRight,
  Terminal,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { askOpenRouterAgent, ChatMessage as ServiceChatMessage } from '../../services/openrouterService';
import { 
  InfrastructureNode, 
  EnterpriseRiskSummary, 
  RemediationRecommendation 
} from '../../types';
import { AegisLogo } from '../common/AegisLogo';
import { 
  formatRiskScore, 
  isValidRiskScore, 
  FALLBACK_TELEMETRY,
  calculateEnterpriseRiskScore,
  calculateRiskLevel
} from '../../utils/riskCalculator';

interface ThreatCatcherChatBotWidgetProps {
  nodes: InfrastructureNode[];
  riskSummary: EnterpriseRiskSummary;
  recommendations: RemediationRecommendation[];
  onSelectNode: (id: string | null) => void;
  onQuarantineNode: (id: string) => void;
  onAddDevice: (device: Omit<InfrastructureNode, 'id' | 'lastUpdated'>) => void;
  onDeleteDevice: (id: string) => boolean;
  onSolveDeviceProblem: (id: string) => boolean;
  onApplyRecommendation: (id: string) => Promise<boolean>;
  onNavigate: (route: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actionTaken?: string;
  error?: boolean;
  isFallback?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init-1',
    sender: 'bot',
    text: 'Hello! I am your **Threat Catcher AI Assistant** powered by OpenRouter LLM. Ask me any cybersecurity question, request threat telemetry analysis, or command me to isolate devices and remediate risks.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

const PROMPT_SUGGESTIONS = [
  { label: '📊 Explain Risk Score', query: 'What is our current enterprise risk score and security telemetry?' },
  { label: '🔍 Scan Network Risks', query: 'Scan all monitored infrastructure devices and summarize active vulnerabilities.' },
  { label: '🛡️ Isolate Vulnerable Devices', query: 'Identify compromised or high-risk devices and isolate them.' },
  { label: '🔒 Security Hardening', query: 'What are the top security hardening recommendations for our system?' },
  { label: '🚀 Navigate Workspace', query: 'Take me to the Infrastructure 3D topology view.' }
];

export const ThreatCatcherChatBotWidget: React.FC<ThreatCatcherChatBotWidgetProps> = ({
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [telemetryStatus, setTelemetryStatus] = useState<'loading' | 'success' | 'fallback'>('success');
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Safely resolve live telemetry or fallback snapshot
  const getActiveTelemetry = (): EnterpriseRiskSummary => {
    const rawScore = riskSummary?.enterpriseRiskScore ?? riskSummary?.overallRiskScore;
    
    if (riskSummary && isValidRiskScore(rawScore)) {
      // Temporary Dev Debugging Logs (Requirement 10)
      console.log('Chatbot telemetry response:', riskSummary);
      console.log('Enterprise risk score:', rawScore);
      return riskSummary;
    }

    console.warn('[Threat Catcher] Unvalidated risk summary received. Utilizing fallback telemetry snapshot.');
    // Temporary Dev Debugging Logs (Requirement 10)
    console.log('Chatbot telemetry response (fallback):', FALLBACK_TELEMETRY);
    console.log('Enterprise risk score (fallback):', FALLBACK_TELEMETRY.enterpriseRiskScore);
    return FALLBACK_TELEMETRY;
  };

  const telemetry = getActiveTelemetry();
  const isDemoFallback = !riskSummary || !isValidRiskScore(riskSummary?.enterpriseRiskScore ?? riskSummary?.overallRiskScore);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playBotChime = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  // Build system context string with live telemetries
  const getSystemContext = () => {
    const compromisedNodes = (nodes || []).filter(n => n.status === 'compromised' || n.status === 'vulnerable');
    const quarantinedNodes = (nodes || []).filter(n => n.status === 'quarantined');
    const scoreText = formatRiskScore(telemetry.enterpriseRiskScore);
    
    return `You are Threat Catcher AI, an intelligent, powerful cyber risk assistant powered by OpenRouter LLM.

YOUR CORE MANDATE:
Answer ANY and ALL questions asked by the user thoroughly, comprehensively, accurately, and step-by-step.

Live System Telemetry Snapshot:
- Enterprise Risk Score: ${scoreText} (Level: ${telemetry.riskLevel || 'High'})
- Monitored Devices Count: ${telemetry.monitoredDevices ?? nodes.length ?? 6}
- Compromised / Vulnerable Devices (${compromisedNodes.length}): ${compromisedNodes.map(n => `${n.name} (${n.ipAddress}, Status: ${n.status})`).join(', ') || 'None'}
- Quarantined Devices (${quarantinedNodes.length}): ${quarantinedNodes.map(n => n.name).join(', ') || 'None'}
- Critical Incidents Count: ${telemetry.criticalIncidents ?? 2}
- Estimated Financial Exposure: ${telemetry.currency === 'INR' ? '₹' : '$'}${telemetry.estimatedFinancialExposure?.toLocaleString('en-IN') ?? '3,50,000'}

FORMATTING INSTRUCTIONS:
- Format your response with clear Markdown formatting (headers, bold text, bullet points, numbered lists, and code blocks).
- Always display the enterprise risk score using valid format (e.g. 72/100). Never render undefined or raw unformatted tokens.`;
  };

  // Standardized Telemetry Report Generator (Requirement 8)
  const generateTelemetryResponse = (): string => {
    const scoreText = formatRiskScore(telemetry.enterpriseRiskScore ?? telemetry.overallRiskScore);
    const monitoredCount = telemetry.monitoredDevices ?? telemetry.activeAssetsCount ?? nodes.length ?? 6;
    const levelStr = telemetry.riskLevel || 'High';
    const compromisedCount = telemetry.compromisedDevices ?? nodes.filter(n => n.status === 'compromised' || n.status === 'vulnerable').length ?? 1;
    const incidentsCount = telemetry.criticalIncidents ?? telemetry.criticalAnomaliesCount ?? 2;
    const financialVal = telemetry.estimatedFinancialExposure ?? 350000;
    const currencySym = telemetry.currency === 'INR' ? '₹' : '$';
    const formattedExposure = `${currencySym}${financialVal.toLocaleString('en-IN')}`;

    return `I have analyzed your query.

**Current system telemetry:**
• **Monitored devices:** ${monitoredCount}
• **Enterprise risk score:** ${scoreText}
• **Risk level:** ${levelStr}
• **Potentially compromised devices:** ${compromisedCount}
• **Critical incidents:** ${incidentsCount}
• **Estimated financial exposure:** ${formattedExposure}

The current risk score is calculated from behavioral anomalies, compromise probability, asset criticality, and incident severity. Let me know if you would like to isolate compromised devices or apply remediation actions.`;
  };

  // Parse autonomous intent from user query and trigger application actions
  const parseAndExecuteIntent = (query: string): string | null => {
    const q = query.toLowerCase();

    // 1. Navigation intent
    if (q.includes('navigate') || q.includes('go to') || q.includes('open page') || q.includes('take me to')) {
      if (q.includes('infrastructure') || q.includes('3d') || q.includes('topology')) {
        onNavigate('/infrastructure');
        return 'Navigated to 3D Infrastructure Topology View.';
      } else if (q.includes('dashboard') || q.includes('overview')) {
        onNavigate('/dashboard');
        return 'Navigated to Risk Dashboard.';
      } else if (q.includes('asset') || q.includes('device')) {
        onNavigate('/assets');
        return 'Navigated to Asset Inventory.';
      } else if (q.includes('attack') || q.includes('path')) {
        onNavigate('/attack-path');
        return 'Navigated to Attack Path Analysis.';
      } else if (q.includes('recommendation') || q.includes('remediat')) {
        onNavigate('/recommendations');
        return 'Navigated to Recommendations.';
      } else if (q.includes('report')) {
        onNavigate('/reports');
        return 'Navigated to Reports.';
      }
    }

    // 2. Quarantine intent
    if (q.includes('isolate') || q.includes('quarantine')) {
      const compromised = (nodes || []).filter(n => n.status === 'compromised' || n.status === 'vulnerable');
      if (compromised.length > 0) {
        compromised.forEach(n => onQuarantineNode(n.id));
        return `Isolated ${compromised.length} compromised/vulnerable device(s): ${compromised.map(c => c.name).join(', ')}.`;
      }
    }

    // 3. Solve threats intent
    if (q.includes('solve') || q.includes('fix threat') || q.includes('remediate all')) {
      const compromised = (nodes || []).filter(n => n.status === 'compromised' || n.status === 'vulnerable');
      if (compromised.length > 0) {
        let fixedCount = 0;
        compromised.forEach(n => {
          if (onSolveDeviceProblem(n.id)) fixedCount++;
        });
        return `Applied automated threat resolution to ${fixedCount} device(s). Status updated to Secure.`;
      }
    }

    return null;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isThinking) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsThinking(true);

    // Check for direct local action trigger
    const localActionNotice = parseAndExecuteIntent(query);

    // Check if user asked explicitly about risk score or telemetry report
    const isTelemetryQuery = query.toLowerCase().includes('risk') || 
                              query.toLowerCase().includes('telemetry') || 
                              query.toLowerCase().includes('score') ||
                              query.toLowerCase().includes('report');

    // Build OpenRouter LLM message history
    const historyPayload: ServiceChatMessage[] = messages.slice(-4).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    // Query OpenRouter API
    const result = await askOpenRouterAgent(query, getSystemContext(), historyPayload);

    setIsThinking(false);

    let responseText = result.text;
    
    // Standardize risk response or use fallback if LLM offline / query is telemetry focused
    if (isTelemetryQuery && (!responseText || !responseText.includes('/100'))) {
      responseText = generateTelemetryResponse();
    } else if (result.error || !responseText) {
      responseText = generateTelemetryResponse();
    }

    if (localActionNotice) {
      responseText = `⚡ **[ACTION EXECUTED]**: ${localActionNotice}\n\n${responseText}`;
    }

    const botMsg: ChatMessage = {
      id: 'msg-' + (Date.now() + 1),
      sender: 'bot',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionTaken: localActionNotice || undefined,
      error: Boolean(result.error),
      isFallback: isDemoFallback
    };

    setMessages(prev => [...prev, botMsg]);
    playBotChime();

    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-cleared-' + Date.now(),
        sender: 'bot',
        text: 'Chat history cleared. How can I assist with Threat Catcher cybersecurity intelligence today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Chat Launcher Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="fixed bottom-6 right-6 z-40 p-3 bg-[#080d19]/95 hover:bg-slate-900 border border-cyan-400/80 rounded-2xl shadow-2xl shadow-cyan-950/80 flex items-center gap-3 transition-all hover:scale-105 cursor-pointer group animate-in fade-in zoom-in-90 print:hidden backdrop-blur-xl"
        >
          <AegisLogo size="sm" subtitle="AI Assistant" />

          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border border-slate-900 animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded AI Chat Bot Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-full max-w-[440px] bg-[#080d19]/95 border border-cyan-500/40 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col transition-all duration-200 overflow-hidden font-sans print:hidden ${
            isMinimized ? 'h-16' : 'h-[600px] max-h-[88vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="p-3.5 bg-slate-950/90 border-b border-cyan-900/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AegisLogo size="xs" subtitle="AI ChatBot" />
              {isDemoFallback && (
                <span className="ml-1 text-[9px] px-1 py-0.2 bg-amber-950/80 border border-amber-800/80 text-amber-300 rounded font-mono">
                  Demo Telemetry
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Telemetry Status Bar Banner (Requirement 5 & 9) */}
              <div className="px-3.5 py-1.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>
                    Enterprise Risk Score: <strong className="text-cyan-300">{formatRiskScore(telemetry.enterpriseRiskScore)}</strong> ({telemetry.riskLevel || 'High'})
                  </span>
                </div>
                {isDemoFallback && (
                  <span className="text-[9px] font-semibold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/50">
                    Demo Telemetry
                  </span>
                )}
              </div>

              {/* Message List Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-[#080d19] to-[#040710]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-700/80 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-950 font-semibold rounded-tr-none shadow-md'
                          : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md font-sans'
                      }`}
                    >
                      {/* Formatted Text Content */}
                      <div className="whitespace-pre-wrap break-words space-y-1">
                        {msg.text.split('\n').map((line, idx) => {
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={idx} className={line.startsWith('•') ? 'pl-2 text-slate-100 font-medium' : ''}>
                              {parts.map((part, pIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong key={pIdx} className="font-extrabold text-cyan-300">
                                      {part.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return part;
                              })}
                            </p>
                          );
                        })}
                      </div>

                      <div className={`text-[9px] font-mono mt-1 text-right flex items-center justify-end gap-1 ${msg.sender === 'user' ? 'text-slate-900' : 'text-slate-500'}`}>
                        {msg.isFallback && msg.sender === 'bot' && (
                          <span className="text-[8px] text-amber-400/90 font-mono">Demo Telemetry •</span>
                        )}
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Thinking Indicator */}
                {isThinking && (
                  <div className="flex gap-2.5 justify-start items-center">
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-700/80 flex items-center justify-center text-cyan-400 shrink-0">
                      <Bot className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
                      <span className="font-mono text-[11px]">Analyzing system telemetry with OpenRouter AI...</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompt Suggestions Carousel */}
              <div className="p-2 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
                {PROMPT_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(sug.query)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/50 rounded-lg text-slate-300 hover:text-cyan-300 text-[10px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <span>{sug.label}</span>
                  </button>
                ))}
              </div>

              {/* Input Control Box */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask Threat Catcher AI (e.g. Explain risk score)..."
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />

                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isThinking}
                  className="p-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-cyan-950 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
