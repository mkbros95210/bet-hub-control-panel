
import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Trophy, Eye, EyeOff } from "lucide-react";

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

const APIGames = () => {
  const { apiId } = useParams();
  const [searchParams] = useSearchParams();
  const apiName = searchParams.get('name') || 'Unknown API';
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (apiId) {
      fetchAPIGames();
    }
  }, [apiId]);

  const fetchAPIGames = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('api_source_id', apiId)
        .order('match_date', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching API games:', error);
      toast({
        title: "Error",
        description: "Failed to fetch games from this API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleGameVisibility = async (matchId: string, showOnFrontend: boolean) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ show_on_frontend: showOnFrontend })
        .eq('id', matchId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Game ${showOnFrontend ? 'activated' : 'deactivated'} successfully`,
      });

      fetchAPIGames();
    } catch (error) {
      console.error('Error updating game visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update game visibility",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      upcoming: "default",
      live: "destructive",
      completed: "secondary",
      cancelled: "outline"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>;
  };

  const getSportBadge = (sport: string) => {
    const colors = {
      cricket: "bg-green-100 text-green-800",
      football: "bg-blue-100 text-blue-800",
      basketball: "bg-orange-100 text-orange-800",
      tennis: "bg-purple-100 text-purple-800",
    } as const;
    
    return (
      <Badge 
        variant="outline" 
        className={colors[sport as keyof typeof colors] || "bg-gray-100 text-gray-800"}
      >
        {sport}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/game-api">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to APIs
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Games from {apiName}</h2>
          <p className="text-muted-foreground">Manage games imported from this API</p>
        </div>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Trophy className="h-5 w-5" />
            All Games ({matches.length})
          </CardTitle>
          <CardDescription>Activate/deactivate games to show on client website</CardDescription>
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
                <TableHead>Active</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell className="font-medium">
                    {match.home_team} vs {match.away_team}
                  </TableCell>
                  <TableCell>
                    {getSportBadge(match.sport)}
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
                        onCheckedChange={(checked) => toggleGameVisibility(match.id, checked)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={match.show_on_frontend ? "default" : "secondary"}>
                      {match.show_on_frontend ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {matches.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No games found from this API. Try importing games first.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default APIGames;
