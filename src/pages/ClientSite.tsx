import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Trophy, Users, Star, Wallet, User, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [bettingModalOpen, setBettingModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [userBalance, setUserBalance] = useState(0);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Create dynamic categories based on active sport categories
  const dynamicCategories = [
    { id: "all", name: "All Sports", icon: Trophy },
    ...categories.map(cat => ({
      id: cat.category_key,
      name: cat.category_name,
      icon: Trophy
    }))
  ];

  const categoriesPerSlide = 4;
  const maxSlides = Math.ceil(dynamicCategories.length / categoriesPerSlide);

  useEffect(() => {
    fetchData();
    if (user) {
      fetchUserBalance();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch matches that are visible on frontend
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('show_on_frontend', true)
        .order('match_date', { ascending: true });

      if (matchesError) throw matchesError;

      // Fetch active sport categories
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
      const isFiltered = activeCategory === "all" || match.category === activeCategory || match.sport === activeCategory;
      
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

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'cricket': return '🏏';
      case 'football': return '⚽';
      case 'tennis': return '🎾';
      case 'basketball': return '🏀';
      default: return '🏆';
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
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
                    Login
                  </Button>
                  <Button
                    onClick={handleLogin}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Hidden on mobile, visible on large screens */}
        <aside className="hidden lg:block w-64 bg-black/30 backdrop-blur-sm border-r border-orange-500/20 min-h-screen">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-500" />
              Sports
            </h3>
            <div className="space-y-2">
              {dynamicCategories.map((category) => (
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
                      : matches.filter(m => m.category === category.id || m.sport === category.id).length
                    }
                  </Badge>
                </button>
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

          {/* Sports Categories Slider - Mobile and Tablet */}
          <div className="lg:hidden mb-6">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Sports Categories</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevSlide}
                    className="p-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextSlide}
                    className="p-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: maxSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} className="grid grid-cols-2 gap-4 w-full flex-shrink-0">
                      {dynamicCategories
                        .slice(slideIndex * categoriesPerSlide, (slideIndex + 1) * categoriesPerSlide)
                        .map((category) => (
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
                              <h3 className={`font-medium text-sm ${
                                activeCategory === category.id ? 'text-white' : 'text-gray-300'
                              }`}>
                                {category.name}
                              </h3>
                              <Badge 
                                variant="secondary" 
                                className={`mt-1 text-xs ${
                                  activeCategory === category.id 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-gray-800 text-gray-400'
                                }`}
                              >
                                {category.id === "all" 
                                  ? matches.length 
                                  : matches.filter(m => m.category === category.id || m.sport === category.id).length
                                }
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sports Categories Grid - Desktop */}
          <div className="hidden lg:grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {dynamicCategories.slice(1).map((category) => (
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
                    {matches.filter(m => m.category === category.id || m.sport === category.id).length}
                  </Badge>
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
              <h2 className="text-2xl font-bold text-white mb-4">Live Matches</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading matches...</div>
              ) : filterMatchesByStatus('live').length > 0 ? (
                filterMatchesByStatus('live').map((match) => (
                  <Card key={match.id} className="bg-black/30 border-gray-700 hover:border-orange-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{getSportIcon(match.sport)}</div>
                          <div>
                            <h3 className="text-white font-medium">
                              {match.home_team} vs {match.away_team}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Calendar className="h-4 w-4" />
                              <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
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
                  No live matches available
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
                          <div className="text-2xl">{getSportIcon(match.sport)}</div>
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
