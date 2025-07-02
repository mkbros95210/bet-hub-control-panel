import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Settings, Plus } from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    { title: "Total Users", value: "2,847", change: "+12%", icon: Users, color: "text-primary" },
    { title: "Active Games", value: "156", change: "+5%", icon: Search, color: "text-success" },
    { title: "Ongoing Bets", value: "1,234", change: "+18%", icon: Settings, color: "text-warning" },
    { title: "Pending Withdrawals", value: "89", change: "-3%", icon: Plus, color: "text-destructive" },
  ];

  const recentActivity = [
    { user: "John Doe", action: "Placed bet on Liverpool vs Arsenal", time: "2 mins ago", amount: "$50" },
    { user: "Jane Smith", action: "Withdrawal request", time: "5 mins ago", amount: "$200" },
    { user: "Mike Johnson", action: "Account registration", time: "10 mins ago", amount: "-" },
    { user: "Sarah Wilson", action: "Placed bet on NBA Finals", time: "15 mins ago", amount: "$75" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">Welcome back, admin. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.includes('+') ? 'text-success' : 'text-destructive'}>
                  {stat.change}
                </span>
                {" "}from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <CardDescription>Latest user actions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{activity.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gradient-primary/10 border border-primary/20 hover:bg-gradient-primary/20 transition-colors cursor-pointer">
                <Search className="h-6 w-6 text-primary mb-2" />
                <p className="font-medium text-foreground">Add Game API</p>
                <p className="text-xs text-muted-foreground">Connect new game source</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-success/10 border border-success/20 hover:bg-gradient-success/20 transition-colors cursor-pointer">
                <Users className="h-6 w-6 text-success mb-2" />
                <p className="font-medium text-foreground">Manage Users</p>
                <p className="text-xs text-muted-foreground">View user accounts</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors cursor-pointer">
                <Settings className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="font-medium text-foreground">System Settings</p>
                <p className="text-xs text-muted-foreground">Configure platform</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors cursor-pointer">
                <Plus className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="font-medium text-foreground">View Bets</p>
                <p className="text-xs text-muted-foreground">Monitor all bets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;