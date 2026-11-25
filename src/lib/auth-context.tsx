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
  enterPresentationDemo: () => AuthSession;
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

    // Check presentation demo entry in browser sessionStorage
    if (typeof window !== "undefined") {
      try {
        const demoRaw = window.sessionStorage.getItem("theorylab_presentation_demo_session");
        if (demoRaw) {
          const parsed = JSON.parse(demoRaw) as AuthSession;
          if (parsed && parsed.userId && seq === seqRef.current) {
            setConfigured(true);
            setSession(parsed);
            setError(null);
            setLoading(false);
            setInitialized(true);
            return parsed;
          }
        }
      } catch {
        // Ignore JSON/sessionStorage access errors
      }
    }

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
      setConfigured(isConfigured);
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
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem("theorylab_presentation_demo_session");
      } catch {
        // Ignore errors
      }
    }
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

  const enterPresentationDemo = useCallback((): AuthSession => {
    seqRef.current += 1;
    const demoSession: AuthSession = {
      userId: "demo-presenter-guest",
      email: "presenter-demo@theorylab.internal",
      role: "independent_learner",
      roles: ["independent_learner"],
      displayName: "Guest Presenter (Demo)",
      preferredLevel: "intermediate",
      accountStatus: "active",
      emailVerified: true,
      profileComplete: true,
    };
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(
          "theorylab_presentation_demo_session",
          JSON.stringify(demoSession),
        );
      } catch {
        // Ignore quota/private mode errors
      }
    }
    setSession(demoSession);
    setConfigured(true);
    setError(null);
    setLoading(false);
    setInitialized(true);
    return demoSession;
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
      enterPresentationDemo,
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
      enterPresentationDemo,
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
