import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';
import { checkPasswordStrength, sanitizeInput } from '../utils/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  connectionStatus: { success: boolean; message: string } | null;
  failedAttempts: number;
  isLockedOut: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithFaceId: (email: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [configured, setConfigured] = useState<boolean>(isSupabaseConfigured());
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const checkConnection = async () => {
    const isConf = isSupabaseConfigured();
    setConfigured(isConf);
    if (isConf) {
      const status = await testSupabaseConnection();
      setConnectionStatus(status);
    } else {
      setConnectionStatus({
        success: false,
        message: 'Supabase credentials unconfigured. Operating in Local Mode with localStorage persistence.'
      });
    }
  };

  useEffect(() => {
    checkConnection();
    const supabase = getSupabase();

    if (!supabase) {
      // Local Mode Auth Check
      const storedUser = localStorage.getItem('tc_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('tc_user');
        }
      }
      setLoading(false);
      return;
    }

    // Fetch active session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('tc_user', JSON.stringify(session.user));
      } else {
        const storedUser = localStorage.getItem('tc_user');
        if (storedUser) {
          try { setUser(JSON.parse(storedUser)); } catch (e) {}
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('tc_user', JSON.stringify(session.user));
      } else {
        setUser(null);
        localStorage.removeItem('tc_user');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Session Inactivity Auto-Lock Guard (15 Minutes)
  useEffect(() => {
    if (!user) return;

    let lastActivity = Date.now();
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

    const resetTimer = () => {
      lastActivity = Date.now();
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    const checkInterval = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_LIMIT) {
        console.warn('[Security Hardening] Inactivity timeout reached (15m). Auto-locking session.');
        signOut();
      }
    }, 10000);

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
      clearInterval(checkInterval);
    };
  }, [user]);

  const refreshConnection = async () => {
    setLoading(true);
    await checkConnection();
    const supabase = getSupabase();
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    } else {
      setSession(null);
      const storedUser = localStorage.getItem('tc_user');
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch (e) {}
      }
    }
    setLoading(false);
  };

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;

  const signIn = async (email: string, password: string) => {
    if (isLockedOut) {
      const secondsLeft = Math.ceil((lockoutUntil! - Date.now()) / 1000);
      return {
        success: false,
        error: `Security Lockout active due to multiple failed login attempts. Please wait ${secondsLeft}s before retrying.`
      };
    }

    const cleanEmail = sanitizeInput(email.trim());
    const supabase = getSupabase();

    // Fallback for Local Mode when Supabase is not configured
    if (!supabase) {
      if (!password || password.length < 4) {
        return { success: false, error: 'Password must be at least 4 characters.' };
      }
      const localUser = {
        id: 'local-' + Math.abs(cleanEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)),
        email: cleanEmail,
        user_metadata: {
          full_name: cleanEmail.split('@')[0] || 'SecOps Admin',
          role: 'SecOps Admin',
          auth_provider: 'Local Storage Auth'
        },
        app_metadata: { provider: 'local' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as User;

      setUser(localUser);
      localStorage.setItem('tc_user', JSON.stringify(localUser));
      setFailedAttempts(0);
      setLockoutUntil(null);
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          const lockTime = Date.now() + 60000;
          setLockoutUntil(lockTime);
        }
        return { success: false, error: error.message };
      }

      setFailedAttempts(0);
      setLockoutUntil(null);
      setUser(data.user);
      setSession(data.session);
      if (data.user) {
        localStorage.setItem('tc_user', JSON.stringify(data.user));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to sign in' };
    }
  };

  const signInWithFaceId = async (email: string, fullName: string) => {
    const cleanEmail = sanitizeInput(email.trim());
    const cleanName = sanitizeInput(fullName.trim());

    const faceUser = {
      id: 'faceid-' + Math.abs(cleanEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)),
      email: cleanEmail,
      user_metadata: {
        full_name: cleanName,
        role: 'SecOps Admin',
        auth_provider: 'Biometric Face ID'
      },
      app_metadata: { provider: 'face_id' },
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as User;

    setUser(faceUser);
    localStorage.setItem('tc_user', JSON.stringify(faceUser));
    setFailedAttempts(0);
    setLockoutUntil(null);
    return { success: true };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const cleanEmail = sanitizeInput(email.trim());
    const cleanName = fullName ? sanitizeInput(fullName.trim()) : 'Security Analyst';
    const supabase = getSupabase();

    if (!supabase) {
      const localUser = {
        id: 'local-' + Math.abs(cleanEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)),
        email: cleanEmail,
        user_metadata: {
          full_name: cleanName,
          role: 'SecOps Admin',
          auth_provider: 'Local Storage Auth'
        },
        app_metadata: { provider: 'local' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as User;

      setUser(localUser);
      localStorage.setItem('tc_user', JSON.stringify(localUser));
      return { success: true };
    }

    const passwordAssessment = checkPasswordStrength(password);
    if (!passwordAssessment.isValid) {
      return {
        success: false,
        error: `Password security requirements not met: ${passwordAssessment.feedback.join('. ')}`
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            role: 'SecOps Admin'
          }
        }
      });

      if (error) return { success: false, error: error.message };

      setUser(data.user);
      setSession(data.session);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to sign up' };
    }
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('tc_user');
  };

  const resetPassword = async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Supabase URL and API Key are not configured.' };
    }

    try {
      const cleanEmail = sanitizeInput(email.trim());
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/#settings`
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send reset email' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: configured,
        connectionStatus,
        failedAttempts,
        isLockedOut,
        signIn,
        signInWithFaceId,
        signUp,
        signOut,
        resetPassword,
        refreshConnection
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
