import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, hasAccess } from "./utils/auth";
import Navigation from "./components/Navigation";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Appointments from "./pages/Appointments";
import Services from "./pages/Services";
import Stock from "./pages/Stock";
import Sales from "./pages/Sales";
import Costs from "./pages/Costs";
import Financial from "./pages/Financial";
import Backup from "./pages/Backup";
import UserManagement from "./pages/UserManagement";

const queryClient = new QueryClient();

const PrivateRoute = ({ children, page }: { children: React.ReactNode; page: string }) => {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!hasAccess(page)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <PrivateRoute page="dashboard">
                <>
                  <Navigation />
                  <Dashboard />
                </>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/customers"
            element={
              <PrivateRoute page="customers">
                <>
                  <Navigation />
                  <Customers />
                </>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/appointments"
            element={
              <PrivateRoute page="appointments">
                <>
                  <Navigation />
                  <Appointments />
                </>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/services"
            element={
              <PrivateRoute page="services">
                <>
                  <Navigation />
                  <Services />
                </>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/stock"
            element={
              <PrivateRoute page="stock">
                <>
                  <Navigation />
                  <Stock />
                </>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/sales"
            element={
              <PrivateRoute page="sales">
                <>
                  <Navigation />
                  <Sales />
                </>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/costs"
            element={
              <PrivateRoute page="costs">
                <>
                  <Navigation />
                  <Costs />
                </>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/financial"
            element={
              <PrivateRoute page="financial">
                <>
                  <Navigation />
                  <Financial />
                </>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/backup"
            element={
              <PrivateRoute page="backup">
                <>
                  <Navigation />
                  <Backup />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/user-management"
            element={
              <PrivateRoute page="user-management">
                <>
                  <Navigation />
                  <UserManagement />
                </>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;