import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute: Enforces basic authentication checks.
 */
export function ProtectedRoute({ children }) {
  const { loading, session } = useAuth();

  if (loading) return <RouteLoader />;
  if (!session) return <Navigate to="/" replace />;

  return children;
}

/**
 * RoleBasedRoute: Enforces strict isolation boundaries between user types.
 */
export function RoleBasedRoute({ children, requiredRole }) {
  const { role, loading, session } = useAuth();

  if (loading) return <RouteLoader />;
  if (!session) return <Navigate to="/" replace />;
  if (role !== requiredRole) return <Navigate to="/dashboard" replace />;

  return children;
}

/**
 * PublicOnlyRoute: Prevents logged-in users from seeing onboarding panels.
 */
export function PublicOnlyRoute({ children }) {
  const { loading, session, role } = useAuth();

  if (loading) return <RouteLoader />;
  
  if (session) {
    if (!role) return <RouteLoader />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

/**
 * DashboardRedirect: Evaluates profile details to route users instantly.
 */
export function DashboardRedirect() {
  const { role, loading, session, profileError, logout } = useAuth();

  if (loading) return <RouteLoader />;
  if (!session) return <Navigate to="/" replace />;
  
  if (role === "producer") return <Navigate to="/dashboard/producer" replace />;
  if (role === "consumer") return <Navigate to="/dashboard/consumer" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-7 text-center dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profile Configuration Error</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {profileError || "Your account setup is verified, but does not have a designated user role type yet."}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button 
            onClick={() => window.location.href = '/user-type'} 
            className="rounded-xl bg-[#00B761] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#009c52] transition-all"
          >
            Select Role / ಪಾತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ
          </button>
          <button 
            onClick={logout} 
            className="rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950 transition-colors">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-b-[#00B761] dark:border-zinc-800 dark:border-b-[#00B761]" />
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide animate-pulse">
          Opening your workspace…
        </p>
      </div>
    </div>
  );
}