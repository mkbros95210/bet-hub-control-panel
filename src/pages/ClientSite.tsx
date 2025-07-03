
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Trophy, Users, Star, Wallet, User, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import WalletModal from "@/components/WalletModal";
import ProfileModal from "@/components/ProfileModal";
import BettingModal from "@/components/BettingModal";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  sport: string;
  category?: string;
  match_date: string;
  status: string;
  home_odds?: number;
  away_odds?: number;
  draw_odds?: number;
}

interface SportCategory {
  id: string;
  category_key: string;
  category_name: string;
  is_active: boolean;
}

const ClientSite = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState("inplay");
  const [activeTab, setActiveTab] = useState("live");
  const [loading, setLoading] = useState(true);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [bettingModalOpen, setBettingModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [userBalance, setUserBalance] = useState(0);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Mobile categories matching the first image
  const mobileCategories = [
    { id: "inplay", name: "Inplay", icon: "🟢", count: 121 },
    { id: "cricket", name: "Cricket", icon: "🏏", count: 28 },
    { id: "tennis", name: "Tennis", icon: "🎾", count: 109 },
    { id: "kabaddi", name: "Kabaddi", icon: "🤼", count: 1 },
  ];

  // Desktop sidebar categories matching the second image
  const desktopCategories = [
    { id: "sports", name: "Sports", icon: "⚽", hasSubmenu: true },
    { id: "e-sports", name: "E-Sports", icon: "🎮", hasSubmenu: true },
    { id: "cricket", name: "Cricket", icon: "🏏" },
    { id: "tennis", name: "Tennis", icon: "🎾" },
    { id: "horse-racing", name: "Horse Racing", icon: "🏇" },
    { id: "greyhound-racing", name: "Greyhound Racing", icon: "🐕" },
    { id: "bigg-boss", name: "BIGG BOSS", icon: "⭐" },
    { id: "soccer", name: "Soccer", icon: "⚽" },
    { id: "politics", name: "Politics", icon: "🏛️" },
    { id: "volleyball", name: "Volleyball", icon: "🏐" },
    { id: "baseball", name: "Baseball", icon: "⚾" },
    { id: "ice-hockey", name: "Ice Hockey", icon: "🏒" },
    { id: "virtual-cricket", name: "Virtual Cricket", icon: "🏏" },
    { id: "boxing", name: "Boxing", icon: "🥊" },
    { id: "rugby-league", name: "Rugby League", icon: "🏉" },
    { id: "darts", name: "Darts", icon: "🎯" },
    { id: "snooker", name: "Snooker", icon: "🎱" },
  ];

  useEffect(() => {
    fetchData();
    if (user) {
      fetchUserBalance();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('show_on_frontend', true)
        .order('match_date', { ascending: true });

      if (matchesError) throw matchesError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('sport_categories')
        .select('*')
        .eq('is_active', true)
        .order('category_name', { ascending: true });

      if (categoriesError) throw categoriesError;

      setMatches(matchesData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserBalance(data?.wallet_balance || 0);
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  };

  const filterMatchesByStatus = (status: string) => {
    const now = new Date();
    return matches.filter(match => {
      const matchDate = new Date(match.match_date);
      const isFiltered = activeCategory === "inplay" || match.category === activeCategory || match.sport === activeCategory;
      
      if (!isFiltered) return false;
      
      switch (status) {
        case 'live':
          return match.status === 'live' || (matchDate <= now && match.status !== 'completed');
        case 'upcoming':
          return matchDate > now && match.status === 'upcoming';
        case 'results':
          return match.status === 'completed';
        default:
          return true;
      }
    });
  };

  const handleBetClick = (match: Match) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setSelectedMatch(match);
    setBettingModalOpen(true);
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-orange-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">
                <span className="text-white">IBE</span>
                <span className="text-orange-500">FX</span>
                <span className="text-white">WIN</span>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-6">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Events, Markets, and more" 
                    className="bg-orange-500 text-black placeholder-black px-4 py-2 rounded-lg w-64"
                  />
                </div>
                <Button variant="ghost" className="text-orange-500 hover:text-orange-400">
                  Sports
                </Button>
                <Button variant="ghost" className="text-white hover:text-orange-400">
                  Casino
                </Button>
                <Button variant="ghost" className="text-white hover:text-orange-400">
                  Promotion
                </Button>
                <Button variant="ghost" className="text-white hover:text-orange-400">
                  E-Sports
                </Button>
                <Button variant="ghost" className="text-white hover:text-orange-400">
                  Sportsbook
                </Button>
                <Button variant="ghost" className="text-white hover:text-orange-400">
                  JetX
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setWalletModalOpen(true)}
                    className="text-white hover:text-orange-400 flex items-center gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    ₹{userBalance.toLocaleString()}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setProfileModalOpen(true)}
                    className="text-white hover:text-orange-400"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleLogin}
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  >
                    SIGN IN
                  </Button>
                  <Button
                    onClick={handleLogin}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    REGISTER
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-black/30 backdrop-blur-sm border-r border-orange-500/20 min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              {desktopCategories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      activeCategory === category.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:bg-orange-500/20 hover:text-orange-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    {category.hasSubmenu && (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 lg:p-8 mb-6 lg:mb-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-2xl lg:text-4xl font-bold mb-4">
                Go Crazy With
                <span className="block text-yellow-300">LIVE BETTING</span>
              </h1>
              <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-6 lg:px-8 py-2 lg:py-3">
                PLAY NOW
              </Button>
            </div>
            <div className="absolute right-4 top-4 opacity-20">
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="h-12 w-12 lg:h-16 lg:w-16" />
              </div>
            </div>
          </div>

          {/* Mobile Sports Categories */}
          <div className="lg:hidden mb-6">
            <div className="grid grid-cols-2 gap-3">
              {mobileCategories.map((category) => (
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
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="flex items-center justify-center gap-2">
                      <h3 className={`font-medium text-sm ${
                        activeCategory === category.id ? 'text-white' : 'text-gray-300'
                      }`}>
                        {category.name}
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          activeCategory === category.id 
                            ? 'bg-white/20 text-white' 
                            : 'bg-orange-500 text-white'
                        }`}
                      >
                        {category.count}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Desktop Sports Categories - Top Bar */}
          <div className="hidden lg:flex items-center gap-4 mb-6">
            {mobileCategories.map((category) => (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  activeCategory === category.id 
                    ? 'bg-orange-500 border-orange-400' 
                    : 'bg-black/30 border-gray-700 hover:border-orange-500/50'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <CardContent className="p-4 text-center min-w-[120px]">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className={`font-medium text-sm ${
                      activeCategory === category.id ? 'text-white' : 'text-gray-300'
                    }`}>
                      {category.name}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        activeCategory === category.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-orange-500 text-white'
                      }`}
                    >
                      {category.count}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Match Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-black/30">
              <TabsTrigger value="live" className="data-[state=active]:bg-orange-500">Live</TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-orange-500">Upcoming</TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-orange-500">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Cricket (10)
                </h2>
                <div className="text-white text-right">
                  <div className="text-xs text-gray-400">1 X 2</div>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading matches...</div>
              ) : (
                <div className="space-y-4">
                  {/* Sample Cricket Matches */}
                  <Card className="bg-black/30 border-gray-700 hover:border-orange-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-orange-500 text-xs">IN-PLAY</Badge>
                          <span className="text-white text-sm font-medium">
                            Eng Legends (V) vs WI Legends (V)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>Virtual Cricket League</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          TODAY 09:22
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-6"
                            onClick={() => handleBetClick({
                              id: '1',
                              home_team: 'Eng Legends',
                              away_team: 'WI Legends',
                              sport: 'cricket',
                              match_date: new Date().toISOString(),
                              status: 'live',
                              home_odds: 1.85
                            })}
                          >
                            -
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white px-6"
                            onClick={() => handleBetClick({
                              id: '1',
                              home_team: 'Eng Legends',
                              away_team: 'WI Legends',
                              sport: 'cricket',
                              match_date: new Date().toISOString(),
                              status: 'live',
                              away_odds: 2.10
                            })}
                          >
                            -
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/30 border-gray-700 hover:border-orange-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-orange-500 text-xs">IN-PLAY</Badge>
                          <span className="text-white text-sm font-medium">
                            Pakistan (V) vs New Zealand (V)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>Virtual Cricket League</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          TODAY 09:36
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-6"
                          >
                            -
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white px-6"
                          >
                            -
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Upcoming Matches</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading matches...</div>
              ) : filterMatchesByStatus('upcoming').length > 0 ? (
                filterMatchesByStatus('upcoming').map((match) => (
                  <Card key={match.id} className="bg-black/30 border-gray-700 hover:border-orange-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">🏏</div>
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
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {match.home_odds && (
                            <Button 
                              variant="outline" 
                              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                              onClick={() => handleBetClick(match)}
                            >
                              {match.home_team.split(' ')[0]} {match.home_odds}
                            </Button>
                          )}
                          {match.draw_odds && (
                            <Button 
                              variant="outline" 
                              className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
                              onClick={() => handleBetClick(match)}
                            >
                              Draw {match.draw_odds}
                            </Button>
                          )}
                          {match.away_odds && (
                            <Button 
                              variant="outline" 
                              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                              onClick={() => handleBetClick(match)}
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
                  No upcoming matches available
                </div>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Match Results</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading results...</div>
              ) : filterMatchesByStatus('results').length > 0 ? (
                filterMatchesByStatus('results').map((match) => (
                  <Card key={match.id} className="bg-black/30 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">🏏</div>
                          <div>
                            <h3 className="text-white font-medium">
                              {match.home_team} vs {match.away_team}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Calendar className="h-4 w-4" />
                              {new Date(match.match_date).toLocaleDateString()}
                              <Badge variant="secondary">Finished</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No completed matches available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-around">
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-orange-500">
            <Trophy className="h-5 w-5" />
            <span className="text-xs">Sports</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400">
            <div className="h-5 w-5 rounded-full bg-gray-600"></div>
            <span className="text-xs">Casino</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400">
            <div className="h-5 w-5 flex items-center justify-center bg-orange-500 rounded text-black font-bold text-xs">
              FX
            </div>
            <span className="text-xs">Sportsbook</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-gray-400" onClick={user ? () => setProfileModalOpen(true) : handleLogin}>
            <User className="h-5 w-5" />
            <span className="text-xs">Sign In</span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <WalletModal 
        open={walletModalOpen} 
        onOpenChange={setWalletModalOpen}
        userBalance={userBalance}
        onBalanceUpdate={fetchUserBalance}
      />
      <ProfileModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen}
      />
      <BettingModal
        open={bettingModalOpen}
        onOpenChange={setBettingModalOpen}
        match={selectedMatch}
        userBalance={userBalance}
        onBetPlaced={fetchUserBalance}
      />
    </div>
  );
};

export default ClientSite;
