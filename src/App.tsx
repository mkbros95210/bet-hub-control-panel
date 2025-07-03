
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClientSite from "./pages/ClientSite";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Games from "./pages/Games";
import GameAPI from "./pages/GameAPI";
import APIGames from "./pages/APIGames";  
import SportCategories from "./pages/SportCategories";
import Users from "./pages/Users";
import Bets from "./pages/Bets";
import PaymentGateways from "./pages/PaymentGateways";
import Wallet from "./pages/Wallet";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/AdminLayout";

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
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="games" element={<Games />} />
              <Route path="game-api" element={<GameAPI />} />
              <Route path="api-games/:apiId" element={<APIGames />} />
              <Route path="sport-categories/:apiId" element={<SportCategories />} />
              <Route path="users" element={<Users />} />
              <Route path="bets" element={<Bets />} />
              <Route path="payment-gateways" element={<PaymentGateways />} />
              <Route path="wallet" element={<Wallet />} />
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
