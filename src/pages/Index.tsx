
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Users, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Zap,
  ArrowRight,
  ExternalLink
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Users,
      title: "User Management",
      description: "Complete user profile and account management system"
    },
    {
      icon: Trophy,
      title: "Sports Betting",
      description: "Multi-sport betting platform with live odds"
    },
    {
      icon: DollarSign,
      title: "Wallet System",
      description: "Secure digital wallet with deposits and withdrawals"
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Real-time betting analytics and reporting"
    },
    {
      icon: Shield,
      title: "Security",
      description: "Bank-level security with RLS and encryption"
    },
    {
      icon: Zap,
      title: "Real-time",
      description: "Live betting with instant updates"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">BetHub</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/client">
                <Button variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Client Site
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button>Admin Panel</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Production Ready Betting Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Complete Betting
            <span className="bg-gradient-primary bg-clip-text text-transparent block">
              Management System
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Full-featured sports betting platform with admin panel, user management, 
            real-time odds, secure payments, and comprehensive analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/client">
              <Button size="lg" className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                View Client Site
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="lg" variant="outline" className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground">
              Production-ready features for a complete betting platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-card border-border/50 text-center">
            <CardContent className="py-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Start?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Experience the complete betting platform with advanced admin controls
                and user-friendly client interface.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/client">
                  <Button size="lg" className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Explore Client Site
                  </Button>
                </Link>
                <Link to="/admin/login">
                  <Button size="lg" variant="outline" className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Access Admin Panel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
