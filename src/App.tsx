
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
            <div className="flex">
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
                          <Route path="/stock" element={<Stock />} />
                          <Route path="/services" element={<Services />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/sales" element={<Sales />} />
                          <Route path="/users" element={<UserManagement />} />
                          <Route path="/personnel" element={<PersonnelManagement />} />
                          <Route path="/financial" element={<Financial />} />
                          <Route path="/costs" element={<Costs />} />
                          <Route path="/backup" element={<Backup />} />
                          <Route path="/performance" element={<Performance />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
