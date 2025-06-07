
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import AccessControl from "@/components/auth/AccessControl";
import Login from "@/pages/Login";
import React from 'react';
import Dashboard from '@/pages/Dashboard';
import Appointments from '@/pages/Appointments';
import Customers from '@/pages/Customers';
import Services from '@/pages/Services';
import Stock from '@/pages/Stock';
import Sales from '@/pages/Sales';
import Costs from '@/pages/Costs';
import Financial from '@/pages/Financial';
import Reports from '@/pages/Reports';
import Backup from '@/pages/Backup';
import UserManagement from '@/pages/UserManagement';
import Personnel from '@/pages/Personnel';
import Performance from '@/pages/Performance';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

const AppContent = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AccessControl user={user} isAuthenticated={isAuthenticated} loading={loading}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/costs" element={<Costs />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/performance" element={<Performance />} />
        </Routes>
      </AccessControl>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
