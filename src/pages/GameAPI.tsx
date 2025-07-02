import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, Search } from "lucide-react";

const GameAPI = () => {
  const [apiForm, setApiForm] = useState({
    name: "",
    url: "",
    apiKey: "",
    description: ""
  });
  const [connectedAPIs, setConnectedAPIs] = useState([
    { id: 1, name: "SportAPI Pro", url: "https://api.sportapi.com", status: "active", games: 142 },
    { id: 2, name: "BetData Live", url: "https://betdata.live/api", status: "active", games: 89 },
    { id: 3, name: "MatchSync", url: "https://matchsync.io/api", status: "inactive", games: 0 },
  ]);
  
  const { toast } = useToast();

  const handleAddAPI = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAPI = {
      id: Date.now(),
      name: apiForm.name,
      url: apiForm.url,
      status: "active" as const,
      games: Math.floor(Math.random() * 100)
    };
    
    setConnectedAPIs([...connectedAPIs, newAPI]);
    setApiForm({ name: "", url: "", apiKey: "", description: "" });
    
    toast({
      title: "API Added Successfully",
      description: `${apiForm.name} has been connected and is importing games.`,
    });
  };

  const testAPI = (apiName: string) => {
    toast({
      title: "API Test Successful",
      description: `Connection to ${apiName} is working properly.`,
    });
  };

  const importGames = (apiName: string) => {
    toast({
      title: "Importing Games",
      description: `Started importing games from ${apiName}. This may take a few minutes.`,
    });
  };

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
                  placeholder="e.g., SportAPI Pro"
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
                  placeholder="https://api.example.com"
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
                  placeholder="Enter your API key"
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
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Add API
                </Button>
                <Button type="button" variant="outline" onClick={() => testAPI(apiForm.name || "API")}>
                  Test Connection
                </Button>
              </div>
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
                    <Badge variant={api.status === "active" ? "default" : "secondary"}>
                      {api.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{api.url}</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {api.games} games imported
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => testAPI(api.name)}
                      className="flex-1"
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => importGames(api.name)}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Import
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameAPI;