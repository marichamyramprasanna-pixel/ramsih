import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Database, 
  Key, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  User as UserIcon, 
  LogOut, 
  CloudUpload, 
  RefreshCw,
  Terminal,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSupabaseCredentials, saveSupabaseCredentials, testSupabaseConnection } from '../../lib/supabase';
import { apiService } from '../../services/apiService';
import { checkPasswordStrength } from '../../utils/security';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    session, 
    isConfigured, 
    connectionStatus, 
    failedAttempts,
    isLockedOut,
    signIn, 
    signUp, 
    signOut, 
    refreshConnection 
  } = useAuth();

  const [tab, setTab] = useState<'auth' | 'config'>('auth');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Config Form State
  const credentials = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(credentials.url);
  const [supabaseKey, setSupabaseKey] = useState(credentials.key);
  const [showSupabaseSecrets, setShowSupabaseSecrets] = useState(false);
  const [configMessage, setConfigMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    if (authMode === 'signin') {
      const res = await signIn(email, password);
      if (res.success) {
        setAuthSuccess('Successfully signed in!');
        setTimeout(() => onClose(), 1200);
      } else {
        setAuthError(res.error || 'Sign in failed');
      }
    } else {
      const res = await signUp(email, password, fullName);
      if (res.success) {
        setAuthSuccess('Account created successfully! Check your email if confirmation is required.');
        setTimeout(() => onClose(), 1500);
      } else {
        setAuthError(res.error || 'Sign up failed');
      }
    }
    setIsSubmitting(false);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setConfigMessage(null);

    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    await refreshConnection();

    const status = await testSupabaseConnection();
    setConfigMessage({
      success: status.success,
      text: status.message
    });
    setIsTesting(false);
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    const result = await apiService.syncToCloud();
    setSyncResult(result.message);
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-[#090d16] border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Supabase Cloud Integration</span>
                {isConfigured ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-mono">
                    CONNECTED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/60 text-[10px] font-mono">
                    LOCAL MODE
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Authentication & Realtime Cloud Database</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-slate-800 bg-[#060910]">
          <button
            onClick={() => setTab('auth')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              tab === 'auth'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>User Authentication</span>
          </button>

          <button
            onClick={() => setTab('config')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              tab === 'config'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Supabase Connection Config</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* TAB 1: AUTHENTICATION */}
          {tab === 'auth' && (
            <div>
              {user ? (
                /* Authenticated User View */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-lg">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">
                        {user.user_metadata?.full_name || 'SecOps Lead'}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{user.email}</div>
                      <div className="text-[10px] text-cyan-400 mt-1 font-mono">
                        User ID: {user.id.substring(0, 18)}...
                      </div>
                    </div>
                  </div>

                  {/* Cloud Database Actions */}
                  <div className="p-4 rounded-xl bg-[#0d1320] border border-cyan-900/40 space-y-3">
                    <div className="text-xs font-semibold text-cyan-300 flex items-center gap-2">
                      <CloudUpload className="w-4 h-4 text-cyan-400" />
                      <span>Cloud Data Synchronization</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Sync your local infrastructure nodes, risk scores, and recommendations directly to your Supabase tables.
                    </p>

                    <button
                      onClick={handleCloudSync}
                      disabled={isSyncing || !isConfigured}
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Pushing Data to Supabase...</span>
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-4 h-4" />
                          <span>Push Local Data to Supabase Cloud</span>
                        </>
                      )}
                    </button>

                    {syncResult && (
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
                        {syncResult}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={async () => {
                      await signOut();
                      onClose();
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Supabase</span>
                  </button>
                </div>
              ) : (
                /* Unauthenticated View: Sign In / Sign Up */
                <div className="space-y-4">
                  {!isConfigured && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Supabase Credentials Unconfigured:</strong> You can test local features now, or click the <strong>Supabase Connection Config</strong> tab to enter your project URL & API key.
                      </div>
                    </div>
                  )}

                  {/* Toggle Sign In / Sign Up */}
                  <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-medium">
                    <button
                      onClick={() => setAuthMode('signin')}
                      className={`flex-1 py-1.5 rounded-md transition-colors ${
                        authMode === 'signin' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode('signup')}
                      className={`flex-1 py-1.5 rounded-md transition-colors ${
                        authMode === 'signup' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Auth Form */}
                  <form onSubmit={handleAuthSubmit} className="space-y-3">
                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="SecOps Security Analyst"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="analyst@secops-aegis.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      {authMode === 'signup' && password.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {(() => {
                            const strength = checkPasswordStrength(password);
                            const colors = ['bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-cyan-400'];
                            return (
                              <>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-400">Strength:</span>
                                  <span className="font-mono font-semibold text-slate-200">{strength.label}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                                  {[0, 1, 2, 3].map((idx) => (
                                    <div
                                      key={idx}
                                      className={`h-full flex-1 rounded-full transition-all ${
                                        idx < strength.score ? colors[strength.score] : 'bg-slate-800'
                                      }`}
                                    />
                                  ))}
                                </div>
                                {strength.feedback.length > 0 && (
                                  <ul className="text-[10px] text-amber-400 space-y-0.5 mt-1 list-disc list-inside">
                                    {strength.feedback.map((item, i) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {isLockedOut && (
                      <div className="p-3 rounded-lg bg-red-950/80 border border-red-700 text-xs text-red-200 flex items-start gap-2">
                        <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Brute-Force Lockout Triggered:</strong> Too many consecutive failed sign-in attempts detected. Access is temporarily locked.
                        </div>
                      </div>
                    )}

                    {!isLockedOut && failedAttempts > 0 && failedAttempts < 5 && authMode === 'signin' && (
                      <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Failed attempt {failedAttempts}/5 before temporary lockout</span>
                      </div>
                    )}

                    {authError && (
                      <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-300">
                        {authError}
                      </div>
                    )}

                    {authSuccess && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300">
                        {authSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-md shadow-cyan-950/50"
                    >
                      {isSubmitting ? 'Processing...' : authMode === 'signin' ? 'Sign In with Supabase' : 'Create Supabase Account'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUPABASE CONFIGURATION */}
          {tab === 'config' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Connect Aegis 3D to your live Supabase project by providing your <strong>Project URL</strong> and <strong>Anon Public Key</strong>.
              </p>

              <form onSubmit={handleSaveConfig} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Supabase Project URL (VITE_SUPABASE_URL)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSupabaseSecrets(!showSupabaseSecrets)}
                        className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        {showSupabaseSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showSupabaseSecrets ? 'Hide Secrets' : 'Show Secrets'}</span>
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
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Supabase Anon API Key (VITE_SUPABASE_ANON_KEY)</span>
                    <button
                      type="button"
                      onClick={() => setShowSupabaseSecrets(!showSupabaseSecrets)}
                      className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      {showSupabaseSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSupabaseSecrets ? 'Hide Secrets' : 'Show Secrets'}</span>
                    </button>
                  </label>
                  <input
                    type={showSupabaseSecrets ? "text" : "password"}
                    required
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Testing Connection...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save & Test Connection</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {configMessage && (
                <div className={`p-3 rounded-xl border text-xs ${
                  configMessage.success
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/40 border-red-800 text-red-300'
                }`}>
                  <div className="font-bold mb-0.5">{configMessage.success ? '✓ Connection Verified' : '✕ Connection Error'}</div>
                  <div>{configMessage.text}</div>
                </div>
              )}

              {/* Blueprint SQL Schema Info */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Database Setup SQL Blueprint</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Execute <code className="text-cyan-300 font-mono">supabase_schema.sql</code> in your Supabase SQL Editor to create tables (<code className="text-slate-300">nodes</code>, <code className="text-slate-300">recommendations</code>, <code className="text-slate-300">anomalies</code>).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#060910] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Aegis 3D Security Intelligence</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
