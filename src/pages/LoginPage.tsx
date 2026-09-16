import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Key, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Database, 
  Sparkles,
  Zap,
  Globe,
  Radio,
  Check,
  Scan,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkPasswordStrength } from '../utils/security';
import { FaceIdScannerModal } from '../components/auth/FaceIdScannerModal';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { 
    user, 
    isConfigured, 
    connectionStatus, 
    failedAttempts, 
    isLockedOut, 
    signIn, 
    signInWithFaceId,
    signUp, 
    signOut 
  } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Face ID state
  const [isFaceIdModalOpen, setIsFaceIdModalOpen] = useState(false);
  const [faceIdMode, setFaceIdMode] = useState<'authenticate' | 'enroll' | 'members'>('authenticate');

  const handleFaceIdSuccess = async (verifiedEmail: string, verifiedName: string) => {
    setIsFaceIdModalOpen(false);
    setIsSubmitting(true);
    await signInWithFaceId(verifiedEmail, verifiedName);
    setAuthSuccess(`Face ID Verified! Signed in as ${verifiedName}. Directing to workspace...`);
    setTimeout(() => onNavigate('/'), 900);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    if (authMode === 'signin') {
      const res = await signIn(email, password);
      if (res.success) {
        setAuthSuccess('Sign in successful! Directing to Threat Catcher workspace...');
        setTimeout(() => onNavigate('/'), 1000);
      } else {
        setAuthError(res.error || 'Failed to sign in');
      }
    } else {
      const res = await signUp(email, password, fullName);
      if (res.success) {
        setAuthSuccess('Account created successfully! Welcome to Threat Catcher.');
        setTimeout(() => onNavigate('/'), 1200);
      } else {
        setAuthError(res.error || 'Failed to sign up');
      }
    }
    setIsSubmitting(false);
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoName: string) => {
    setIsSubmitting(true);
    setEmail(demoEmail);
    setPassword('DemoPass123!');
    setFullName(demoName);

    const res = await signIn(demoEmail, 'DemoPass123!');
    if (!res.success) {
      // Create demo account if not exists
      await signUp(demoEmail, 'DemoPass123!', demoName);
    }
    setAuthSuccess(`Signed in as ${demoName}! Directing to workspace...`);
    setTimeout(() => onNavigate('/'), 800);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#04060b] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#080d17]/90 border border-cyan-500/30 rounded-2xl shadow-2xl backdrop-blur-2xl p-6 sm:p-8 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 mx-auto shadow-lg shadow-cyan-950 font-mono font-black text-lg">
            <span className="text-cyan-400 font-black">T</span><span className="text-blue-400 font-black">C</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
              <span className="text-cyan-400 font-black">T</span>hreat <span className="text-cyan-400 font-black">C</span>atcher
            </h1>
            <p className="text-xs text-slate-400 mt-1">Interactive Cybersecurity & Risk Visualizer</p>
          </div>
        </div>

        {/* Currently Authenticated State Banner */}
        {user ? (
          <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-800/80 space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-cyan-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>You are currently signed in</span>
            </div>
            <p className="text-xs text-slate-300 font-mono">{user.email}</p>
            
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onNavigate('/')}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={async () => await signOut()}
                className="px-3 py-2 bg-slate-900 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
              <button
                onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                  authMode === 'signin' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold' : 'text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                  authMode === 'signup' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold' : 'text-slate-400'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="SecOps Security Analyst"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
                
                {authMode === 'signup' && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {(() => {
                      const strength = checkPasswordStrength(password);
                      const colors = ['bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-cyan-400'];
                      return (
                        <>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Password Strength:</span>
                            <span className="font-mono font-semibold text-slate-200">{strength.label}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex gap-1">
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

              {/* Lockout Warning */}
              {isLockedOut && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-700 text-xs text-red-200 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Brute-Force Lockout Active:</strong> Multiple failed login attempts detected. Access is temporarily locked for security.
                  </div>
                </div>
              )}

              {/* Error and Success Alerts */}
              {authError && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-300">
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLockedOut}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950"
              >
                <Lock className="w-4 h-4 text-slate-950" />
                <span>{authMode === 'signin' ? 'Sign In to Workspace' : 'Create Account & Enter'}</span>
              </button>
            </form>

            {/* Face ID Biometric Login & Member Registration */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setFaceIdMode('authenticate');
                  setIsFaceIdModalOpen(true);
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-950/90 via-blue-950/90 to-slate-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-400/60 hover:border-cyan-300 text-cyan-200 font-bold rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer shadow-lg shadow-cyan-950/50 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                    <Scan className="w-4 h-4 text-cyan-300 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-extrabold flex items-center gap-1.5">
                      <span>Scan Face ID to Enter Workspace</span>
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-[9px] font-mono text-cyan-300 font-semibold border border-cyan-500/40">AI Biometrics</span>
                    </div>
                    <div className="text-[10px] text-cyan-400/80 font-mono">Instant Facial Recognition Scan</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setFaceIdMode('enroll');
                  setIsFaceIdModalOpen(true);
                }}
                className="w-full py-2 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-emerald-300 font-semibold rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Enroll My Face / Add Team Member</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Register Biometrics &rarr;</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-500 uppercase">Or standard credentials</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Quick Demo Sign In Options */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="text-[10px] uppercase font-mono text-slate-500 text-center font-semibold">
                Quick 1-Click Demo Login
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ram@secops-aegis.com', 'Ram Prasanna (CISO)')}
                  className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ram Prasanna</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('analyst@secops-aegis.com', 'SecOps Lead Analyst')}
                  className="py-2 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SecOps Lead</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Face ID Recognition Modal */}
        <FaceIdScannerModal
          isOpen={isFaceIdModalOpen}
          onClose={() => setIsFaceIdModalOpen(false)}
          onSuccess={handleFaceIdSuccess}
          initialTab={faceIdMode}
          targetEmail={email || 'ram@secops-aegis.com'}
          targetName={fullName || 'Ram Prasanna'}
        />
      </div>
    </div>
  );
};
