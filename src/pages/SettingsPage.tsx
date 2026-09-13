import React from 'react';
import { 
  Settings, 
  Cpu, 
  Eye, 
  RotateCcw, 
  Radio, 
  Sliders, 
  CheckCircle2,
  Shield,
  Monitor
} from 'lucide-react';
import { UserPreferences } from '../types';

interface SettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onResetData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  preferences,
  onUpdatePreferences,
  onResetData
}) => {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold uppercase">
            CONFIG
          </span>
          <span className="text-xs text-slate-500 font-mono">Telemetry & Viewport Options</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Application Preferences & Configuration</h1>
        <p className="text-xs text-slate-400">
          Configure 3D WebGL renderer fidelity, motion preferences, accessibility settings, and simulation data streams.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* 3D Graphics & Rendering */}
        <div className="p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>3D Visualizer & Hardware Performance</span>
          </h2>
          <p className="text-xs text-slate-400">
            Adjust Three.js rendering settings to optimize frame rates on resource-constrained devices.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5">
                Rendering Fidelity
              </label>
              <select
                value={preferences.qualityPreset}
                onChange={(e) => onUpdatePreferences({ qualityPreset: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="auto">Auto (Detect hardware capabilities)</option>
                <option value="high">High (Full antialiasing, bloom glow, high DPI)</option>
                <option value="medium">Medium (Standard DPI, antialiasing)</option>
                <option value="low">Low (Power saver, lower polygon packets)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">Reduced Motion</div>
                <div className="text-[11px] text-slate-400">Disables idle rotation and rapid pulse animations</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) => onUpdatePreferences({ reducedMotion: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Accessibility & Topology Fallback */}
        <div className="p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Accessibility (WCAG 2.1 AA)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Ensure non-visual and 2D equivalents for full compliance and screen-reader accessibility.
          </p>

          <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Default to 2D SVG Topology Map</div>
              <div className="text-[11px] text-slate-400">
                Uses clean SVG matrix diagram instead of WebGL 3D canvas by default
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.accessibilityMode}
              onChange={(e) => onUpdatePreferences({ accessibilityMode: e.target.checked })}
              className="w-4 h-4 accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Data Reset */}
        <div className="p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Synthetic Demonstration Data</span>
          </h2>
          <p className="text-xs text-slate-400">
            Reset all mitigated vulnerabilities, active anomalies, and risk postures to baseline state.
          </p>

          <button
            id="btn-settings-reset"
            onClick={onResetData}
            className="px-4 py-2 bg-slate-800 hover:bg-red-950 text-slate-200 hover:text-red-300 border border-slate-700 hover:border-red-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo State to Baseline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
