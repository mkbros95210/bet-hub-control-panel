
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  CreditCard, 
  Settings, 
  GamepadIcon,
  Wallet,
  Star,
  Globe
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Games",
    href: "/admin/games",
    icon: Trophy,
  },
  {
    title: "Game APIs",
    href: "/admin/game-api",
    icon: GamepadIcon,
  },
  {
    title: "Bets",
    href: "/admin/bets",
    icon: Trophy,
  },
  {
    title: "Wallet",
    href: "/admin/wallet",
    icon: Wallet,
  },
  {
    title: "Payment Gateways",
    href: "/admin/payment-gateways",
    icon: CreditCard,
  },
  {
    title: "Hero Banners",
    href: "/admin/hero-banners",
    icon: Star,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-2">
            <Globe className="h-6 w-6 mr-2" />
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
