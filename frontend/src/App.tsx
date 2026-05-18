import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext"; // Import useAuth here
import { ThemeProvider } from "@/context/ThemeContext";
import { RBACProvider } from "@/context/RBACContext";

// Layouts
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";

// Auth Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { TwoFactorPage } from "@/pages/auth/TwoFactorPage";

// Dashboard Pages
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ProjectsPage } from "@/pages/projects/ProjectsPage";
import { ProjectDetailPage } from "@/pages/projects/ProjectDetailPage";
import { TasksPage } from "@/pages/tasks/TasksPage";
import { TeamPage } from "@/pages/team/TeamPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { NotificationsPage } from "@/pages/notifications/NotificationsPage";
import { AuditLogsPage } from "@/pages/admin/AuditLogsPage";

import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";

const queryClient = new QueryClient();

// 1. Create a sub-component for your routes so it can access the useAuth hook
const AppContent = () => {
  const { isLoading } = useAuth();

  // 2. If the AuthProvider is still verifying the token on refresh, hold the render
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-zinc-950 text-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-zinc-400 tracking-wide animate-pulse">Verifying session...</p>
      </div>
    );
  }

  // 3. Once isLoading is false, user data is populated and routes render safely without flashes
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/2fa" element={<TwoFactorPage />} />
        </Route>

        {/* Dashboard routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/:tab" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Main App Wrapper keeping your Provider configuration intact
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <RBACProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent /> {/* Render the routing sub-component here */}
          </TooltipProvider>
        </RBACProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;