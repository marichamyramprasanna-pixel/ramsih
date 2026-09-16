import React, { useState } from 'react';
import { 
  Shield, 
  Activity, 
  Bell, 
  Search, 
  Radio, 
  RotateCcw,
  CheckCircle2,
  Database,
  UserCheck,
  Lock,
  Radar
} from 'lucide-react';
import { EnterpriseRiskSummary, InfrastructureNode, AnomalyDetection, Investigation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { NotificationCenterDropdown } from '../common/NotificationCenterDropdown';

interface TopNavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  riskSummary: EnterpriseRiskSummary;
  nodes?: InfrastructureNode[];
  anomalies?: AnomalyDetection[];
  investigations?: Investigation[];
  onSelectNode?: (id: string) => void;
  liveStreaming: boolean;
  onToggleStreaming: () => void;
  onResetData: () => void;
  onOpenAuth?: () => void;
  onOpenDeviceScanner?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentRoute,
  onNavigate,
  riskSummary,
  nodes = [],
  anomalies = [],
  investigations = [],
  onSelectNode = () => {},
  liveStreaming,
  onToggleStreaming,
  onResetData,
  onOpenAuth,
  onOpenDeviceScanner
}) => {
  const { user, isConfigured } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <header className="h-14 bg-[#080b11] border-b border-slate-800/80 px-4 flex items-center justify-between gap-4 z-40 select-none print:hidden">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <button
          id="btn-brand-home"
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center font-mono font-black text-xs group-hover:border-cyan-300 transition-colors shadow-sm shadow-cyan-950">
            <span className="text-cyan-400 text-sm font-black">T</span><span className="text-blue-400 text-sm font-black">C</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base">
                <span className="text-lg text-cyan-400 font-black">T</span>hreat <span className="text-lg text-cyan-400 font-black">C</span>atcher
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 font-mono border border-cyan-800/60 font-bold">
                T Catcher
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Interactive Cybersecurity & Risk Visualizer</p>
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
          <span className="hidden sm:inline">{liveStreaming ? 'Telemetry Live' : 'Paused'}</span>
        </button>

        {/* Device-by-Device Scanner Trigger */}
        {onOpenDeviceScanner && (
          <button
            id="btn-device-scanner"
            onClick={onOpenDeviceScanner}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-900/80 transition-colors cursor-pointer shadow-sm shadow-cyan-950"
            title="Inspect & Diagnostic Scan Device-by-Device"
          >
            <Radar className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span className="hidden sm:inline">Inspect Device-by-Device</span>
          </button>
        )}

        {/* Supabase Cloud Connection Status */}
        <button
          id="btn-supabase-status"
          onClick={onOpenAuth}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            isConfigured
              ? 'bg-cyan-950/50 text-cyan-300 border-cyan-700/50 hover:bg-cyan-900/60'
              : 'bg-slate-900 text-amber-400 border-amber-800/40 hover:bg-slate-800'
          }`}
          title="Manage Supabase Database & Auth Connection"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">{isConfigured ? 'Supabase Cloud' : 'Connect Supabase'}</span>
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

        {/* Search Trigger Button */}
        <button
          id="btn-global-search"
          onClick={() => setIsSearchOpen(true)}
          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded-md transition-colors flex items-center gap-1.5"
          title="Search assets, CVEs, IPs, alerts, incidents (Cmd+K)"
          aria-label="Global Search"
        >
          <Search className="w-4 h-4" />
          <span className="hidden xl:inline text-xs text-slate-400">Search...</span>
        </button>

        {/* Notifications Icon with Badge & Dropdown */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-md transition-colors cursor-pointer"
            aria-label="View Active Threat Detections"
          >
            <Bell className="w-4 h-4 text-cyan-400" />
            {riskSummary.criticalAnomaliesCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#080b11] animate-pulse" />
            )}
          </button>

          <NotificationCenterDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            anomalies={anomalies || []}
            riskSummary={riskSummary}
            onNavigate={onNavigate}
          />
        </div>

        {/* User Avatar & Sign Out Trigger */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <button
            id="btn-user-auth"
            onClick={onOpenAuth}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left focus:outline-none cursor-pointer"
            title="Manage Account / Database Auth"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-300">
              {user ? (user.email?.charAt(0).toUpperCase() || 'U') : 'SEC'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-medium text-slate-200 leading-tight">
                {user ? (user.user_metadata?.full_name || 'SecOps User') : 'SecOps Lead'}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <UserCheck className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Authenticated</span>
              </div>
            </div>
          </button>

          {/* Sign Out / Lock Platform Button */}
          {user && (
            <button
              id="btn-sign-out"
              onClick={async () => {
                const { signOut } = useAuth();
                await signOut();
                onNavigate('/login');
              }}
              className="p-1.5 text-slate-400 hover:text-red-300 hover:bg-red-950/60 rounded-md border border-slate-800 hover:border-red-800/60 transition-colors cursor-pointer ml-1"
              title="Sign Out / Lock Platform"
              aria-label="Sign Out"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        nodes={nodes}
        anomalies={anomalies}
        investigations={investigations}
        onSelectNode={onSelectNode}
        onNavigate={onNavigate}
      />
    </header>
  );
};
