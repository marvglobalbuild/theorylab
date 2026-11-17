import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { isSupabaseConfigured } from "@/lib/supabase";
import { authService, type AuthSession, type UserRole } from "@/services";

export interface AuthContextValue {
  /** False until initial browser session check completes (guarantees identical SSR + first client paint). */
  initialized: boolean;
  loading: boolean;
  configured: boolean;
  session: AuthSession | null;
  error: string | null;
  recoveryMode: boolean;
  hasRole: (role: UserRole) => boolean;
  refreshSession: () => Promise<AuthSession | null>;
  signOut: () => Promise<void>;
  setSessionDirect: (session: AuthSession | null) => void;
  clearRecoveryMode: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const seqRef = useRef(0);

  const refreshSession = useCallback(async (): Promise<AuthSession | null> => {
    const seq = ++seqRef.current;
    const isConfigured = isSupabaseConfigured();
    setConfigured(isConfigured);

    if (!isConfigured) {
      if (seq === seqRef.current) {
        setSession(null);
        setError(null);
        setLoading(false);
        setInitialized(true);
      }
      return null;
    }

    const res = await authService.getSession();
    if (seq !== seqRef.current) return null;

    if (res.status === "unavailable") {
      setConfigured(false);
      setSession(null);
      setError(null);
    } else if (res.status === "error") {
      setConfigured(true);
      setSession(null);
      setError(res.message);
    } else {
      setConfigured(true);
      setSession(res.data);
      setError(null);
    }

    setLoading(false);
    setInitialized(true);
    return res.status === "ok" ? res.data : null;
  }, []);

  useEffect(() => {
    let mounted = true;
    void refreshSession();

    const unsubscribe = authService.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      seqRef.current += 1;
      setConfigured(isSupabaseConfigured());
      setSession(nextSession);
      setError(null);
      setLoading(false);
      setInitialized(true);
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      } else if (event === "SIGNED_OUT") {
        setRecoveryMode(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    seqRef.current += 1;
    await authService.signOut();
    setSession(null);
    setError(null);
    setRecoveryMode(false);
    setLoading(false);
    setInitialized(true);
  }, []);

  const setSessionDirect = useCallback((nextSession: AuthSession | null) => {
    seqRef.current += 1;
    setSession(nextSession);
    setError(null);
    setLoading(false);
    setInitialized(true);
  }, []);

  const clearRecoveryMode = useCallback(() => {
    setRecoveryMode(false);
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => Boolean(session && (session.roles.includes(role) || session.role === role)),
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      loading,
      configured,
      session,
      error,
      recoveryMode,
      hasRole,
      refreshSession,
      signOut,
      setSessionDirect,
      clearRecoveryMode,
    }),
    [
      initialized,
      loading,
      configured,
      session,
      error,
      recoveryMode,
      hasRole,
      refreshSession,
      signOut,
      setSessionDirect,
      clearRecoveryMode,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return ctx;
}
