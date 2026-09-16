import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  Eye, 
  EyeOff,
  RotateCcw, 
  Radio, 
  Sliders, 
  CheckCircle2,
  Shield,
  Monitor,
  Database,
  Key,
  CloudUpload,
  Terminal,
  ExternalLink,
  Lock,
  RefreshCw
} from 'lucide-react';
import { UserPreferences } from '../types';
import { useAuth } from '../context/AuthContext';
import { getSupabaseCredentials, saveSupabaseCredentials, testSupabaseConnection } from '../lib/supabase';
import { apiService } from '../services/apiService';
import { SecurityHardeningPanel } from '../components/security/SecurityHardeningPanel';

interface SettingsPageProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onResetData: () => void;
  onOpenAuth?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  preferences,
  onUpdatePreferences,
  onResetData,
  onOpenAuth
}) => {
  const { user, isConfigured, connectionStatus, refreshConnection } = useAuth();
  const credentials = getSupabaseCredentials();
  
  const [supabaseUrl, setSupabaseUrl] = React.useState(credentials.url);
  const [supabaseKey, setSupabaseKey] = React.useState(credentials.key);
  const [showSupabaseSecrets, setShowSupabaseSecrets] = useState(false);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(connectionStatus);
  const [isTesting, setIsTesting] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncMsg, setSyncMsg] = React.useState<string | null>(null);

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    await refreshConnection();

    const res = await testSupabaseConnection();
    setTestResult(res);
    setIsTesting(false);
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncMsg(null);
    const res = await apiService.syncToCloud();
    setSyncMsg(res.message);
    setIsSyncing(false);
  };

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
          Configure 3D WebGL renderer fidelity, Supabase cloud database & authentication, accessibility settings, and simulation data streams.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">

        {/* Security Posture & Hardening Audit Panel */}
        <SecurityHardeningPanel />
        
        {/* Supabase Database & Auth Configuration */}
        <div className="p-5 bg-[#090d15] border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Supabase Database & Authentication</span>
            </h2>
            <div className="flex items-center gap-2">
              {isConfigured ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-semibold">
                  CONNECTED TO CLOUD
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-mono font-semibold">
                  LOCAL MODE
                </span>
              )}
              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Open Auth Modal
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Connect Aegis 3D to your PostgreSQL Supabase database to persist assets, anomalies, risk scores, and user credentials.
          </p>

          <form onSubmit={handleSaveAndTest} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                <span>Supabase Project URL</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSupabaseSecrets(!showSupabaseSecrets)}
                    className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {showSupabaseSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showSupabaseSecrets ? 'Hide URL' : 'Show URL'}</span>
                  </button>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Dashboard</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </label>
              <input
                type={showSupabaseSecrets ? "text" : "password"}
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                <span>Supabase Anon API Key</span>
                <button
                  type="button"
                  onClick={() => setShowSupabaseSecrets(!showSupabaseSecrets)}
                  className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  {showSupabaseSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showSupabaseSecrets ? 'Hide Key' : 'Show Key'}</span>
                </button>
              </label>
              <input
                type={showSupabaseSecrets ? "text" : "password"}
                required
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isTesting}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Connection...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Test Supabase Connection</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCloudSync}
                disabled={isSyncing || !isConfigured}
                className="px-4 py-2 bg-slate-800 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4 text-cyan-400" />
                <span>Sync Local Data to Supabase Database</span>
              </button>
            </div>
          </form>

          {testResult && (
            <div className={`p-3 rounded-xl border text-xs ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-red-950/40 border-red-800 text-red-300'
            }`}>
              <div className="font-bold mb-0.5">{testResult.success ? '✓ Connection Operational' : '✕ Connection Warning'}</div>
              <div>{testResult.message}</div>
            </div>
          )}

          {syncMsg && (
            <div className="p-3 rounded-xl bg-slate-900 border border-cyan-800/60 text-xs text-cyan-300">
              {syncMsg}
            </div>
          )}
        </div>
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
