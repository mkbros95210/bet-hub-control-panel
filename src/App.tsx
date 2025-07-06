
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

// Import pages
import Index from "@/pages/Index";
import ClientSite from "@/pages/ClientSite";
import Auth from "@/pages/Auth";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Users from "@/pages/Users";
import Games from "@/pages/Games";
import GameAPI from "@/pages/GameAPI";
import APIGames from "@/pages/APIGames";
import SportCategories from "@/pages/SportCategories";
import Bets from "@/pages/Bets";
import Wallet from "@/pages/Wallet";
import PaymentGateways from "@/pages/PaymentGateways";
import HeroBanners from "@/pages/HeroBanners";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import AdminLayout from "@/components/AdminLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ClientSite />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><Users /></AdminLayout>} />
            <Route path="/admin/games" element={<AdminLayout><Games /></AdminLayout>} />
            <Route path="/admin/game-api" element={<AdminLayout><GameAPI /></AdminLayout>} />
            <Route path="/admin/api-games/:id" element={<AdminLayout><APIGames /></AdminLayout>} />
            <Route path="/admin/sport-categories/:id" element={<AdminLayout><SportCategories /></AdminLayout>} />
            <Route path="/admin/bets" element={<AdminLayout><Bets /></AdminLayout>} />
            <Route path="/admin/wallet" element={<AdminLayout><Wallet /></AdminLayout>} />
            <Route path="/admin/payment-gateways" element={<AdminLayout><PaymentGateways /></AdminLayout>} />
            <Route path="/admin/hero-banners" element={<AdminLayout><HeroBanners /></AdminLayout>} />
            <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
