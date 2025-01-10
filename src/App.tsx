import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "./utils/auth";
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

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
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
              <PrivateRoute>
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
              <PrivateRoute>
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
              <PrivateRoute>
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
              <PrivateRoute>
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
              <PrivateRoute>
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
              <PrivateRoute>
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
              <PrivateRoute>
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
              <PrivateRoute>
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
              <PrivateRoute>
                <>
                  <Navigation />
                  <Backup />
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