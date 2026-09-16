import React from 'react';
import { Bell, X, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { AnomalyDetection, EnterpriseRiskSummary } from '../../types';

interface NotificationCenterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anomalies: AnomalyDetection[];
  riskSummary: EnterpriseRiskSummary;
  onNavigate: (route: string) => void;
}

export const NotificationCenterDropdown: React.FC<NotificationCenterDropdownProps> = ({
  isOpen,
  onClose,
  anomalies,
  riskSummary,
  onNavigate
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-12 z-50 w-80 sm:w-96 bg-[#080d1a] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/80 p-4 space-y-3 font-sans animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Threat Center Notifications</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {anomalies.map((anom) => (
          <div
            key={anom.id}
            onClick={() => {
              onNavigate('/detections');
              onClose();
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer space-y-1 group"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">{anom.title}</span>
              <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 text-[9px] font-mono font-bold">
                {anom.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1">{anom.description}</p>
            <div className="text-[9px] font-mono text-cyan-400/80 flex items-center justify-between pt-0.5">
              <span>{anom.assetName}</span>
              <span>{anom.detectedAt}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <button
          onClick={() => {
            onNavigate('/detections');
            onClose();
          }}
          className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View All Detections & Signals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
