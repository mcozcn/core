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
import Costs from "./pages/Costs";
import Financial from "./pages/Financial";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/services" element={<Services />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/costs" element={<Costs />} />
          <Route path="/financial" element={<Financial />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;