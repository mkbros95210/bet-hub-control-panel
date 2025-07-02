import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  Settings,
  Users,
  Search,
  Plus,
  User
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Search },
  { title: "Game API", url: "/admin/game-api", icon: Plus },
  { title: "Game Manager", url: "/admin/games", icon: Settings },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Bets", url: "/admin/bets", icon: Search },
  { title: "Wallet", url: "/admin/wallet", icon: Settings },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} bg-sidebar border-sidebar-border transition-all duration-300`}>
      <SidebarContent className="bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-sidebar-foreground">BetHub</h2>
                <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
              </div>
            )}
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {!collapsed && "Main Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-card" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-sidebar-foreground">Admin User</p>
                <p className="text-xs text-sidebar-foreground/60">admin@bethub.com</p>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;