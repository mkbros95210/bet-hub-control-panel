import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import GameAPI from "./pages/GameAPI";
import Games from "./pages/Games";
import Users from "./pages/Users";
import Bets from "./pages/Bets";
import Wallet from "./pages/Wallet";
import Settings from "./pages/Settings";
import PaymentGateways from "./pages/PaymentGateways";
import ClientSite from "./pages/ClientSite";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/client" element={<ClientSite />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="game-api" element={<GameAPI />} />
              <Route path="games" element={<Games />} />
              <Route path="users" element={<Users />} />
              <Route path="bets" element={<Bets />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="payment-gateways" element={<PaymentGateways />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
