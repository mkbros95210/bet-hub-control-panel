
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Settings, Search, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameAPI {
  id: string;
  name: string;
  api_url: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  last_sync?: string;
}

const GameAPI = () => {
  const [apiForm, setApiForm] = useState({
    name: "",
    url: "",
    apiKey: "",
    description: ""
  });
  const [connectedAPIs, setConnectedAPIs] = useState<GameAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAPIs();
  }, []);

  const fetchAPIs = async () => {
    try {
      console.log('Fetching APIs...');
      const { data, error } = await supabase
        .from('game_apis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching APIs:', error);
        throw error;
      }
      
      console.log('APIs fetched successfully:', data);
      setConnectedAPIs(data || []);
    } catch (error: any) {
      console.error('Error fetching APIs:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch connected APIs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAPI = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiForm.name || !apiForm.url || !apiForm.apiKey) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('Adding API with data:', {
        name: apiForm.name,
        api_url: apiForm.url,
        api_key: apiForm.apiKey,
        is_active: true
      });

      const { data, error } = await supabase
        .from('game_apis')
        .insert({
          name: apiForm.name,
          api_url: apiForm.url,
          api_key: apiForm.apiKey,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('API added successfully:', data);

      toast({
        title: "API Added Successfully",
        description: `${apiForm.name} has been connected successfully.`,
      });

      setApiForm({ name: "", url: "", apiKey: "", description: "" });
      fetchAPIs();
    } catch (error: any) {
      console.error('Error adding API:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add API. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const testAPI = async (api: GameAPI) => {
    try {
      // Simulate API test - in real implementation, you'd make actual API call
      const response = await fetch(api.api_url, {
        headers: {
          'Authorization': `Bearer ${api.api_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "API Test Successful",
          description: `Connection to ${api.name} is working properly.`,
        });
      } else {
        throw new Error('API test failed');
      }
    } catch (error) {
      toast({
        title: "API Test Failed",
        description: `Failed to connect to ${api.name}. Please check your credentials.`,
        variant: "destructive",
      });
    }
  };

  const importGames = async (api: GameAPI) => {
    setImporting(api.id);
    try {
      // Simulate importing games - add sample data for demonstration
      const sampleGames = [
        {
          home_team: "Mumbai Indians",
          away_team: "Chennai Super Kings",
          sport: "cricket",
          match_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "upcoming",
          home_odds: 1.85,
          away_odds: 1.95,
          show_on_frontend: false,
          api_source_id: api.id
        },
        {
          home_team: "Manchester United",
          away_team: "Liverpool",
          sport: "football",
          match_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          status: "upcoming",
          home_odds: 2.1,
          away_odds: 1.75,
          draw_odds: 3.2,
          show_on_frontend: false,
          api_source_id: api.id
        },
        {
          home_team: "Lakers",
          away_team: "Warriors",
          sport: "basketball",
          match_date: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
          status: "upcoming",
          home_odds: 1.9,
          away_odds: 1.9,
          show_on_frontend: false,
          api_source_id: api.id
        },
        {
          home_team: "Novak Djokovic",
          away_team: "Rafael Nadal",
          sport: "tennis",
          match_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          status: "upcoming",
          home_odds: 1.6,
          away_odds: 2.3,
          show_on_frontend: false,
          api_source_id: api.id
        }
      ];

      const { error } = await supabase
        .from('matches')
        .insert(sampleGames);

      if (error) throw error;

      // Update last sync time
      await supabase
        .from('game_apis')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', api.id);

      toast({
        title: "Games Imported Successfully",
        description: `Imported ${sampleGames.length} games from ${api.name}.`,
      });

      fetchAPIs();
    } catch (error) {
      console.error('Error importing games:', error);
      toast({
        title: "Import Failed",
        description: `Failed to import games from ${api.name}.`,
        variant: "destructive",
      });
    } finally {
      setImporting(null);
    }
  };

  const showAPIGames = (apiId: string, apiName: string) => {
    navigate(`/admin/api-games/${apiId}?name=${encodeURIComponent(apiName)}`);
  };

  const deleteAPI = async (apiId: string) => {
    try {
      const { error } = await supabase
        .from('game_apis')
        .delete()
        .eq('id', apiId);

      if (error) throw error;

      toast({
        title: "API Deleted",
        description: "API has been removed successfully.",
      });

      fetchAPIs();
    } catch (error) {
      console.error('Error deleting API:', error);
      toast({
        title: "Error",
        description: "Failed to delete API",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Game API Management</h2>
          <p className="text-muted-foreground">Connect and manage external game data sources</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New API */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Plus className="h-5 w-5" />
              Add Game API
            </CardTitle>
            <CardDescription>Connect a new external game data source</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAPI} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiName">API Name</Label>
                <Input
                  id="apiName"
                  placeholder="e.g., The Odds API"
                  value={apiForm.name}
                  onChange={(e) => setApiForm({ ...apiForm, name: e.target.value })}
                  required
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiUrl">API URL</Label>
                <Input
                  id="apiUrl"
                  placeholder="https://api.the-odds-api.com/v4/sports/"
                  value={apiForm.url}
                  onChange={(e) => setApiForm({ ...apiForm, url: e.target.value })}
                  required
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="fac67bb4d9a4714e2023c44619f55796"
                  value={apiForm.apiKey}
                  onChange={(e) => setApiForm({ ...apiForm, apiKey: e.target.value })}
                  required
                  className="bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this API"
                  value={apiForm.description}
                  onChange={(e) => setApiForm({ ...apiForm, description: e.target.value })}
                  className="bg-input/50 border-border/50 focus:border-primary min-h-[80px]"
                />
              </div>
              
              <Button type="submit" className="w-full">
                Add API
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Connected APIs */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5" />
              Connected APIs
            </CardTitle>
            <CardDescription>Manage your existing game data sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connectedAPIs.map((api) => (
                <div key={api.id} className="p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{api.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={api.is_active ? "default" : "secondary"}>
                        {api.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteAPI(api.id)}
                        className="p-1 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{api.api_url}</p>
                  {api.last_sync && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Last sync: {new Date(api.last_sync).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => testAPI(api)}
                      className="flex-1"
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => importGames(api)}
                      disabled={importing === api.id}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {importing === api.id ? "Importing..." : "Import"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => showAPIGames(api.id, api.name)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Show Games
                    </Button>
                  </div>
                </div>
              ))}
              
              {connectedAPIs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No APIs connected yet. Add your first API above.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const testAPI = async (api: GameAPI) => {
    try {
      // Simulate API test - in real implementation, you'd make actual API call
      const response = await fetch(api.api_url, {
        headers: {
          'Authorization': `Bearer ${api.api_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "API Test Successful",
          description: `Connection to ${api.name} is working properly.`,
        });
      } else {
        throw new Error('API test failed');
      }
    } catch (error) {
      toast({
        title: "API Test Failed",
        description: `Failed to connect to ${api.name}. Please check your credentials.`,
        variant: "destructive",
      });
    }
  };

  const importGames = async (api: GameAPI) => {
    setImporting(api.id);
    try {
      // Simulate importing games - add sample data for demonstration
      const sampleGames = [
        {
          home_team: "Mumbai Indians",
          away_team: "Chennai Super Kings",
          sport: "cricket",
          match_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "upcoming",
          home_odds: 1.85,
          away_odds: 1.95,
          show_on_frontend: false,
          api_source_id: api.id
        },
        {
          home_team: "Manchester United",
          away_team: "Liverpool",
          sport: "football",
          match_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          status: "upcoming",
          home_odds: 2.1,
          away_odds: 1.75,
          draw_odds: 3.2,
          show_on_frontend: false,
          api_source_id: api.id
        }
      ];

      const { error } = await supabase
        .from('matches')
        .insert(sampleGames);

      if (error) throw error;

      // Update last sync time
      await supabase
        .from('game_apis')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', api.id);

      toast({
        title: "Games Imported Successfully",
        description: `Imported ${sampleGames.length} games from ${api.name}.`,
      });

      fetchAPIs();
    } catch (error) {
      console.error('Error importing games:', error);
      toast({
        title: "Import Failed",
        description: `Failed to import games from ${api.name}.`,
        variant: "destructive",
      });
    } finally {
      setImporting(null);
    }
  };

  const showAPIGames = (apiId: string, apiName: string) => {
    navigate(`/admin/api-games/${apiId}?name=${encodeURIComponent(apiName)}`);
  };

  const deleteAPI = async (apiId: string) => {
    try {
      const { error } = await supabase
        .from('game_apis')
        .delete()
        .eq('id', apiId);

      if (error) throw error;

      toast({
        title: "API Deleted",
        description: "API has been removed successfully.",
      });

      fetchAPIs();
    } catch (error) {
      console.error('Error deleting API:', error);
      toast({
        title: "Error",
        description: "Failed to delete API",
        variant: "destructive",
      });
    }
  };
};

export default GameAPI;
