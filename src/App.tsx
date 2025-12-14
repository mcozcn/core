import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import React from 'react';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import GuestPrompt from '@/components/auth/GuestPrompt';
import AuthDebugPanel from '@/components/auth/AuthDebugPanel';
import { useLocation } from 'react-router-dom';
import Calendar from '@/pages/Calendar';
import Customers from '@/pages/Customers';
import PaymentTracking from '@/pages/PaymentTracking';
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
import MembershipPackages from '@/pages/MembershipPackages';
import CheckIn from '@/pages/CheckIn';
import BodyMetrics from '@/pages/BodyMetrics';
// Auth page and guard are optional now that the app can run without login

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

const ProtectedRoutes = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const showDebug = query.get('debug') === 'true';
  return (
    <div className="min-h-screen bg-background">
      <GuestPrompt />
      {showDebug && <div className="max-w-7xl mx-auto px-4"><AuthDebugPanel /></div>}
      <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/payment-tracking" element={<PaymentTracking />} />
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
          <Route path="/membership-packages" element={<MembershipPackages />} />
          <Route path="/check-in" element={<CheckIn />} />
          <Route path="/body-metrics" element={<BodyMetrics />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
        <Toaster />
      </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
