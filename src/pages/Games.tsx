
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye, EyeOff, Calendar, Trophy } from "lucide-react";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  sport: string;
  match_date: string;
  status: string;
  home_odds?: number;
  away_odds?: number;
  draw_odds?: number;
  show_on_frontend: boolean;
  api_source_id?: string;
}

const Games = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (matchId: string, showOnFrontend: boolean) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ show_on_frontend: showOnFrontend })
        .eq('id', matchId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Match ${showOnFrontend ? 'shown on' : 'hidden from'} frontend`,
      });

      fetchMatches();
    } catch (error) {
      console.error('Error updating match visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update match visibility",
        variant: "destructive",
      });
    }
  };

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.away_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.sport.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || match.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      upcoming: "default",
      live: "destructive",
      completed: "secondary",
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
          <h2 className="text-3xl font-bold text-foreground">Game Manager</h2>
          <p className="text-muted-foreground">Control which games are visible to users</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Search className="h-5 w-5" />
            Filter Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search teams or sports..."
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
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Games Table */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Trophy className="h-5 w-5" />
            All Games ({filteredMatches.length})
          </CardTitle>
          <CardDescription>Manage game visibility and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Odds</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell className="font-medium">
                    {match.home_team} vs {match.away_team}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{match.sport}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(match.match_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(match.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {match.home_odds && <div>H: {match.home_odds}</div>}
                      {match.away_odds && <div>A: {match.away_odds}</div>}
                      {match.draw_odds && <div>D: {match.draw_odds}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {match.show_on_frontend ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={match.show_on_frontend}
                        onCheckedChange={(checked) => toggleVisibility(match.id, checked)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredMatches.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No matches found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Games;
