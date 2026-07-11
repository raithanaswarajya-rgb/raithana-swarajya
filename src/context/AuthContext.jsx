import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

/**
 * AuthProvider: Core session provider distributing auth states,
 * metadata structures, roles, and profile synchronizations natively.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Sync session structures, profile records, and metadata objects responsively
  const hydrateSession = useCallback(async (nextSession) => {
    setLoading(true);
    setSession(nextSession);
    setProfileError(null);

    if (!nextSession?.user) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    const authUser = nextSession.user;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (error) throw error;

      // Clean fallback parameters chain to survive database model changes
      const resolvedRole =
        data?.user_role ?? 
        data?.role ?? 
        authUser.user_metadata?.user_role ??
        authUser.user_metadata?.role ?? 
        null;

      setUser({
        id: authUser.id,
        email: authUser.email,
        ...authUser.user_metadata,
        ...data,
      });
      setRole(resolvedRole);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setUser({
        id: authUser.id,
        email: authUser.email,
        ...authUser.user_metadata,
      });
      setRole(
        authUser.user_metadata?.user_role ?? authUser.user_metadata?.role ?? null
      );
      setProfileError(err.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up listeners for initial state synchronization
  useEffect(() => {
    let active = true;

    // Get current storage session credentials on load
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (active) void hydrateSession(initialSession);
    });

    // Listen for third-party OAuth callbacks or email magic validation redirect parameters
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Defer database lookups until the call stack finishes execution
      setTimeout(() => {
        if (active) void hydrateSession(nextSession);
      }, 0);
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [hydrateSession]);

  /**
   * Logout and clear all session contexts cleanly
   */
  async function logout() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("Supabase engine sign out failure:", err);
      setProfileError(err.message || "Failed to sign out securely.");
    } finally {
      setUser(null);
      setRole(null);
      setSession(null);
      setLoading(false);
    }
  }

  // Handle explicit manual profile refresh executions
  const refreshProfile = useCallback(() => {
    return hydrateSession(session);
  }, [hydrateSession, session]);

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        role, 
        loading, 
        session, 
        profileError, 
        logout, 
        refreshProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Reusable hook structure mapping
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an active AuthProvider instance.");
  }
  return context;
}