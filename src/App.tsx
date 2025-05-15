
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Appointments from "./pages/Appointments";
import Services from "./pages/Services";
import Stock from "./pages/Stock";
import Sales from "./pages/Sales";
import Costs from "./pages/Costs";
import Financial from "./pages/Financial";
import Backup from "./pages/Backup";
import PersonnelManagement from "./pages/PersonnelManagement";
import Reports from "./pages/Reports";
import UpdateSystem from "./components/update/UpdateSystem";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UpdateSystem />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navigation />
                <Dashboard />
              </>
            }
          />
          
          <Route
            path="/customers"
            element={
              <>
                <Navigation />
                <Customers />
              </>
            }
          />
          
          <Route
            path="/appointments"
            element={
              <>
                <Navigation />
                <Appointments />
              </>
            }
          />
          
          <Route
            path="/services"
            element={
              <>
                <Navigation />
                <Services />
              </>
            }
          />
          
          <Route
            path="/stock"
            element={
              <>
                <Navigation />
                <Stock />
              </>
            }
          />
          
          <Route
            path="/sales"
            element={
              <>
                <Navigation />
                <Sales />
              </>
            }
          />
          
          <Route
            path="/costs"
            element={
              <>
                <Navigation />
                <Costs />
              </>
            }
          />
          
          <Route
            path="/financial"
            element={
              <>
                <Navigation />
                <Financial />
              </>
            }
          />
          
          <Route
            path="/reports"
            element={
              <>
                <Navigation />
                <Reports />
              </>
            }
          />
          
          <Route
            path="/backup"
            element={
              <>
                <Navigation />
                <Backup />
              </>
            }
          />

          <Route
            path="/personnel"
            element={
              <>
                <Navigation />
                <PersonnelManagement />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
