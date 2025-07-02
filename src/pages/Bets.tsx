
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, DollarSign, TrendingUp, Users, Calendar } from "lucide-react";

interface Bet {
  id: string;
  user_id: string;
  match_id: string;
  bet_type: string;
  amount: number;
  odds: number;
  potential_win: number;
  status: string;
  placed_at: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
  matches?: {
    home_team: string;
    away_team: string;
    sport: string;
  };
}

const Bets = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    totalBets: 0,
    totalAmount: 0,
    pendingBets: 0,
    activeBets: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBets();
    fetchStats();
  }, []);

  const fetchBets = async () => {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select(`
          *,
          profiles:user_id(full_name, email),
          matches:match_id(home_team, away_team, sport)
        `)
        .order('placed_at', { ascending: false });

      if (error) throw error;
      setBets(data || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('amount, status');

      if (error) throw error;
      
      const totalBets = data?.length || 0;
      const totalAmount = data?.reduce((sum, bet) => sum + bet.amount, 0) || 0;
      const pendingBets = data?.filter(bet => bet.status === 'pending').length || 0;
      const activeBets = data?.filter(bet => bet.status === 'active').length || 0;

      setStats({ totalBets, totalAmount, pendingBets, activeBets });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateBetStatus = async (betId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bets')
        .update({ status: newStatus })
        .eq('id', betId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Bet status updated to ${newStatus}`,
      });

      fetchBets();
      fetchStats();
    } catch (error) {
      console.error('Error updating bet:', error);
      toast({
        title: "Error",
        description: "Failed to update bet status",
        variant: "destructive",
      });
    }
  };

  const filteredBets = bets.filter(bet => {
    const matchesSearch = bet.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bet.matches?.home_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bet.matches?.away_team?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || bet.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      active: "default",
      won: "default",
      lost: "destructive",
      cancelled: "outline"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Bets Management</h2>
          <p className="text-muted-foreground">Monitor and manage all betting activity</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBets}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bets</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBets}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Search className="h-5 w-5" />
            Filter Bets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by user email or match..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-input/50 border-border/50"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bets Table */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground">All Bets ({filteredBets.length})</CardTitle>
          <CardDescription>Manage betting activity and results</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Bet Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Odds</TableHead>
                <TableHead>Potential Win</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBets.map((bet) => (
                <TableRow key={bet.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{bet.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{bet.profiles?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {bet.matches?.home_team} vs {bet.matches?.away_team}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {bet.matches?.sport}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{bet.bet_type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">₹{bet.amount}</TableCell>
                  <TableCell>{bet.odds}</TableCell>
                  <TableCell className="font-medium text-green-600">₹{bet.potential_win}</TableCell>
                  <TableCell>{getStatusBadge(bet.status)}</TableCell>
                  <TableCell>{new Date(bet.placed_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {bet.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => updateBetStatus(bet.id, 'won')}>
                            Win
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateBetStatus(bet.id, 'lost')}>
                            Lose
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => updateBetStatus(bet.id, 'cancelled')}>
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredBets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No bets found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Bets;
