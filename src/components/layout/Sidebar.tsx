import React from 'react';
import {
  Compass,
  LayoutDashboard,
  Box,
  Server,
  AlertTriangle,
  SearchCode,
  DollarSign,
  Globe2,
  CheckSquare,
  FileText,
  Settings,
  ChevronRight,
  ShieldCheck,
  ChevronLeft,
  GitCommit,
  Lock
} from 'lucide-react';
import { EnterpriseRiskSummary } from '../../types';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  riskSummary: EnterpriseRiskSummary;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  riskSummary,
  isCollapsed,
  onToggleCollapse
}) => {
  const navItems = [
    {
      route: '/',
      label: 'Overview',
      icon: <Compass className="w-4 h-4" />,
      badge: null
    },
    {
      route: '/login',
      label: 'Sign In / Account',
      icon: <Lock className="w-4 h-4 text-cyan-400" />,
      badge: 'Auth',
      badgeColor: 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono font-bold'
    },
    {
      route: '/dashboard',
      label: 'Enterprise Risk',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: riskSummary.overallRiskScore >= 70 ? `${riskSummary.overallRiskScore}` : null,
      badgeColor: 'bg-red-950 text-red-400 border border-red-800/60'
    },
    {
      route: '/infrastructure',
      label: '3D Infrastructure',
      icon: <Box className="w-4 h-4" />,
      badge: '3D',
      badgeColor: 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
    },
    {
      route: '/attack-path',
      label: 'Attack Path Analysis',
      icon: <GitCommit className="w-4 h-4" />,
      badge: 'Path',
      badgeColor: 'bg-red-950 text-red-400 border border-red-800/60'
    },
    {
      route: '/assets',
      label: 'Asset Inventory',
      icon: <Server className="w-4 h-4" />,
      badge: `${riskSummary.activeAssetsCount}`,
      badgeColor: 'bg-slate-800 text-slate-300'
    },
    {
      route: '/detections',
      label: 'Detections & Signals',
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: riskSummary.criticalAnomaliesCount > 0 ? `${riskSummary.criticalAnomaliesCount}` : null,
      badgeColor: 'bg-red-900/80 text-red-200 border border-red-700 animate-pulse'
    },
    {
      route: '/investigations',
      label: 'Investigations',
      icon: <SearchCode className="w-4 h-4" />,
      badge: '1 Active',
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800/60'
    },
    {
      route: '/risk-quantification',
      label: 'Risk Quantification',
      icon: <DollarSign className="w-4 h-4" />,
      badge: 'FAIR',
      badgeColor: 'bg-slate-800 text-slate-400'
    },
    {
      route: '/threat-intelligence',
      label: 'Threat Intelligence',
      icon: <Globe2 className="w-4 h-4" />,
      badge: null
    },
    {
      route: '/recommendations',
      label: 'Recommendations',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: '5 Actionable',
      badgeColor: 'bg-blue-950 text-blue-300 border border-blue-800/60'
    },
    {
      route: '/reports',
      label: 'Reports & Audit',
      icon: <FileText className="w-4 h-4" />,
      badge: null
    },
    {
      route: '/settings',
      label: 'Settings & Telemetry',
      icon: <Settings className="w-4 h-4" />,
      badge: null
    }
  ];

  return (
    <aside
      className={`relative bg-[#07090f] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation List */}
      <div className="p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              id={`nav-${item.route.replace('/', '') || 'root'}`}
              onClick={() => onNavigate(item.route)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {item.icon}
              </div>

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`ml-2 px-1.5 py-0.2 text-[10px] font-mono rounded font-medium ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info & Collapse Toggle */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {!isCollapsed && (
          <div className="mb-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Aegis Continuous Engine</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>Risk Engine:</span>
              <span className="text-emerald-400">FAIR v3.2</span>
            </div>
          </div>
        )}

        <button
          id="btn-toggle-sidebar"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
