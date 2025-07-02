
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Trophy, Users, Star } from "lucide-react";

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
}

const ClientSite = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", name: "All Sports", icon: Trophy },
    { id: "cricket", name: "Cricket", icon: Trophy },
    { id: "football", name: "Football", icon: Trophy },
    { id: "tennis", name: "Tennis", icon: Trophy },
  ];

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('show_on_frontend', true)
        .eq('status', 'upcoming')
        .order('match_date', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = activeCategory === "all" 
    ? matches 
    : matches.filter(match => match.sport === activeCategory);

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'cricket': return '🏏';
      case 'football': return '⚽';
      case 'tennis': return '🎾';
      default: return '🏆';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-orange-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">
                <span className="text-white">BET</span>
                <span className="text-orange-500">HUB</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" className="text-orange-500 hover:text-orange-400">
                  Sports
                </Button>
                <Button variant="ghost" className="text-white hover:text-orange-400">
                  Casino
                </Button>
                <Button variant="ghost" className="text-white hover:text-orange-400">
                  Live
                </Button>
                <Button variant="ghost" className="text-white hover:text-orange-400">
                  Promotions
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                Login
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-black/30 backdrop-blur-sm border-r border-orange-500/20 min-h-screen">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-500" />
              Sports
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    activeCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-orange-500/20 hover:text-orange-400'
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-auto bg-gray-700 text-gray-300">
                    {category.id === "all" 
                      ? matches.length 
                      : matches.filter(m => m.sport === category.id).length
                    }
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-4">
                Go Crazy With
                <span className="block text-yellow-300">LIVE BETTING</span>
              </h1>
              <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-8 py-3">
                PLAY NOW
              </Button>
            </div>
            <div className="absolute right-4 top-4 opacity-20">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="h-16 w-16" />
              </div>
            </div>
          </div>

          {/* Sports Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {categories.slice(1).map((category) => (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  activeCategory === category.id 
                    ? 'bg-orange-500 border-orange-400' 
                    : 'bg-black/30 border-gray-700 hover:border-orange-500/50'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{getSportIcon(category.id)}</div>
                  <h3 className={`font-medium ${
                    activeCategory === category.id ? 'text-white' : 'text-gray-300'
                  }`}>
                    {category.name}
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className={`mt-1 ${
                      activeCategory === category.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {matches.filter(m => m.sport === category.id).length}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Matches */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              {activeCategory === "all" ? "All Matches" : `${categories.find(c => c.id === activeCategory)?.name} Matches`}
            </h2>
            
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading matches...</div>
            ) : filteredMatches.length > 0 ? (
              filteredMatches.map((match) => (
                <Card key={match.id} className="bg-black/30 border-gray-700 hover:border-orange-500/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{getSportIcon(match.sport)}</div>
                        <div>
                          <h3 className="text-white font-medium">
                            {match.home_team} vs {match.away_team}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="h-4 w-4" />
                            {new Date(match.match_date).toLocaleDateString()} at{' '}
                            {new Date(match.match_date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {match.home_odds && (
                          <Button 
                            variant="outline" 
                            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                          >
                            {match.home_team.split(' ')[0]} {match.home_odds}
                          </Button>
                        )}
                        {match.draw_odds && (
                          <Button 
                            variant="outline" 
                            className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
                          >
                            Draw {match.draw_odds}
                          </Button>
                        )}
                        {match.away_odds && (
                          <Button 
                            variant="outline" 
                            className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                          >
                            {match.away_team.split(' ')[0]} {match.away_odds}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No matches available for {activeCategory === "all" ? "any sport" : categories.find(c => c.id === activeCategory)?.name}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientSite;
