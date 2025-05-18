
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navigation from './components/Navigation';
import { runMigrations } from './utils/storage/migration';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Customers from './pages/Customers';
import Stock from './pages/Stock';
import Services from './pages/Services';
import Reports from './pages/Reports';
import Sales from './pages/Sales';
import UserManagement from './pages/UserManagement';
import PersonnelManagement from './pages/PersonnelManagement';
import Financial from './pages/Financial';
import Costs from './pages/Costs';
import Backup from './pages/Backup';
import Performance from './pages/Performance';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  useEffect(() => {
    runMigrations();
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="flex w-full">
                    <Navigation />
                    <div className="flex-1">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/appointments" element={<Appointments />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/stock" element={
                          <ProtectedRoute requiredRole="admin">
                            <Stock />
                          </ProtectedRoute>
                        } />
                        <Route path="/services" element={<Services />} />
                        <Route path="/reports" element={
                          <ProtectedRoute requiredRole="admin">
                            <Reports />
                          </ProtectedRoute>
                        } />
                        <Route path="/sales" element={
                          <ProtectedRoute requiredRole="admin">
                            <Sales />
                          </ProtectedRoute>
                        } />
                        <Route path="/users" element={
                          <ProtectedRoute requiredRole="admin">
                            <UserManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/personnel" element={
                          <ProtectedRoute requiredRole="admin">
                            <PersonnelManagement />
                          </ProtectedRoute>
                        } />
                        <Route path="/financial" element={
                          <ProtectedRoute requiredRole="admin">
                            <Financial />
                          </ProtectedRoute>
                        } />
                        <Route path="/costs" element={
                          <ProtectedRoute requiredRole="admin">
                            <Costs />
                          </ProtectedRoute>
                        } />
                        <Route path="/backup" element={
                          <ProtectedRoute requiredRole="admin">
                            <Backup />
                          </ProtectedRoute>
                        } />
                        <Route path="/performance" element={
                          <ProtectedRoute requiredRole="admin">
                            <Performance />
                          </ProtectedRoute>
                        } />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
