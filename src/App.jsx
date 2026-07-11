import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import LanguageSelect from "./pages/LanguageSelect";
import RoleSelect from "./pages/RoleSelect";
import Auth from "./pages/Auth";
import ProducerDashboard from "./pages/ProducerDashboard";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import {
  DashboardRedirect,
  PublicOnlyRoute,
  RoleBasedRoute,
} from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <BrowserRouter>
          <Routes>
            {/* Core Fix: Wrapped the root path with PublicOnlyRoute. 
              This prevents logged-in sessions from getting trapped in the onboarding screens.
            */}
            <Route 
              path="/" 
              element={
                <PublicOnlyRoute>
                  <LanguageSelect />
                </PublicOnlyRoute>
              } 
            />
            
            <Route 
              path="/user-type" 
              element={
                <PublicOnlyRoute>
                  <RoleSelect />
                </PublicOnlyRoute>
              } 
            />
            
            <Route 
              path="/auth" 
              element={
                <PublicOnlyRoute>
                  <Auth />
                </PublicOnlyRoute>
              } 
            />
            
            {/* Dynamic Core Dashboard Routing Hub Switcher */}
            <Route 
              path="/dashboard" 
              element={<DashboardRedirect />} 
            />
            
            {/* Isolated Workspaces backed by explicit security role configurations */}
            <Route 
              path="/dashboard/producer" 
              element={
                <RoleBasedRoute requiredRole="producer">
                  <ProducerDashboard />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/consumer" 
              element={
                <RoleBasedRoute requiredRole="consumer">
                  <ConsumerDashboard />
                </RoleBasedRoute>
              } 
            />
            
            {/* Fallback Catch-all Security Layer Redirect */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </BrowserRouter>
      </OnboardingProvider>
    </AuthProvider>
  );
}