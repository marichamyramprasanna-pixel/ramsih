import React from 'react';
import { 
  Shield, 
  Activity, 
  Bell, 
  Search, 
  Radio, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { EnterpriseRiskSummary } from '../../types';

interface TopNavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  riskSummary: EnterpriseRiskSummary;
  liveStreaming: boolean;
  onToggleStreaming: () => void;
  onResetData: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentRoute,
  onNavigate,
  riskSummary,
  liveStreaming,
  onToggleStreaming,
  onResetData
}) => {
  return (
    <header className="h-14 bg-[#080b11] border-b border-slate-800/80 px-4 flex items-center justify-between gap-4 z-40 select-none">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <button
          id="btn-brand-home"
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-sm shadow-cyan-950">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-white text-sm">AEGIS 3D</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 font-mono border border-cyan-800/60 font-medium">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Continuous Cyber Risk Intelligence</p>
          </div>
        </button>
      </div>

      {/* Center Quick Posture Indicator */}
      <div className="hidden md:flex items-center gap-6 px-4 py-1 rounded-full bg-slate-900/60 border border-slate-800/70 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Posture Score:</span>
          <span className={`font-mono font-bold ${
            riskSummary.overallRiskScore >= 70 ? 'text-red-400' : 
            riskSummary.overallRiskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {riskSummary.overallRiskScore} / 100
          </span>
        </div>
        <div className="w-px h-3.5 bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Expected Loss:</span>
          <span className="font-mono font-semibold text-cyan-300">
            ${(riskSummary.fairMetrics.totalExpectedLossUSD / 1000000).toFixed(2)}M
          </span>
        </div>
        <div className="w-px h-3.5 bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Critical Alerts:</span>
          <span className="font-mono font-bold text-red-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {riskSummary.criticalAnomaliesCount}
          </span>
        </div>
      </div>

      {/* Right Controls & User Info */}
      <div className="flex items-center gap-2.5">
        {/* Live Simulation Pulse */}
        <button
          id="btn-live-stream"
          onClick={onToggleStreaming}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            liveStreaming
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
          title="Toggle synthetic real-time telemetry stream"
        >
          <Radio className={`w-3.5 h-3.5 ${liveStreaming ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">{liveStreaming ? 'Telemetry Live' : 'Paused'}</span>
        </button>

        {/* Reset State Button */}
        <button
          id="btn-reset-demo"
          onClick={onResetData}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-md transition-colors"
          title="Reset all mitigations and simulated alerts to default"
          aria-label="Reset State"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Notifications Icon with Badge */}
        <button
          id="btn-notifications"
          onClick={() => onNavigate('/detections')}
          className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-md transition-colors"
          aria-label="View Active Threat Detections"
        >
          <Bell className="w-4 h-4" />
          {riskSummary.criticalAnomaliesCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#080b11]" />
          )}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-300">
            SEC
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-medium text-slate-200 leading-tight">SecOps Lead</div>
            <div className="text-[10px] text-slate-500 font-mono">SOC Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
