import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("adminToken");

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("rememberAdmin");
    navigate("/admin/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-foreground hover:bg-muted" />
              <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              Logout
            </Button>
          </header>
          
          <main className="flex-1 p-6 bg-gradient-hero">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;