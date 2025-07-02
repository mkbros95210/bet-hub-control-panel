import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/betting-hero.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      {/* Hero Section */}
      <div className="relative flex items-center justify-center min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              BetHub Control Panel
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional betting game administration platform with comprehensive game API integration, 
              user management, and real-time analytics.
            </p>
          </div>
          
          <div className="relative w-full max-w-3xl mx-auto">
            <img 
              src={heroImage} 
              alt="Betting platform dashboard" 
              className="w-full h-64 object-cover rounded-xl shadow-elegant border border-border/50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-xl" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/admin/login")}
              className="text-lg px-8"
            >
              Access Admin Panel
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/admin/dashboard")}
              className="text-lg px-8"
            >
              View Dashboard
            </Button>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-primary">Game API Integration</CardTitle>
                <CardDescription>
                  Connect multiple game data sources and automatically sync match information
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-success">User Management</CardTitle>
                <CardDescription>
                  Comprehensive user administration with balance management and betting history
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-warning">Real-time Analytics</CardTitle>
                <CardDescription>
                  Monitor betting activity, user engagement, and platform performance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
