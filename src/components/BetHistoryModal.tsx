
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { History, Calendar, TrendingUp, TrendingDown } from "lucide-react";

interface Bet {
  id: string;
  amount: number;
  bet_type: string;
  odds: number;
  potential_win: number;
  status: string;
  placed_at: string;
  result?: string;
  matches?: {
    home_team: string;
    away_team: string;
    sport: string;
  };
}

interface BetHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BetHistoryModal = ({ open, onOpenChange }: BetHistoryModalProps) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchBetHistory();
    }
  }, [open, user]);

  const fetchBetHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_bets')
        .select(`
          *,
          matches:match_id(home_team, away_team, sport)
        `)
        .eq('user_id', user.id)
        .order('placed_at', { ascending: false });

      if (error) throw error;
      setBets(data || []);
    } catch (error) {
      console.error('Error fetching bet history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-500';
      case 'lost':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <TrendingUp className="h-4 w-4" />;
      case 'lost':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalWinnings = bets
    .filter(bet => bet.status === 'won')
    .reduce((sum, bet) => sum + bet.potential_win, 0);
  const totalLosses = bets
    .filter(bet => bet.status === 'lost')
    .reduce((sum, bet) => sum + bet.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-gray-700 max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <History className="h-5 w-5" />
            Bet History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-slate-800 border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  ₹{totalBetAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Bets</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  ₹{totalWinnings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Winnings</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-gray-600">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  ₹{totalLosses.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Losses</div>
              </CardContent>
            </Card>
          </div>

          {/* Bet History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Recent Bets</h3>
            
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading bets...</div>
            ) : bets.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bets.map((bet) => (
                  <Card key={bet.id} className="bg-slate-800 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(bet.status)} text-white`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(bet.status)}
                              <span className="capitalize">{bet.status}</span>
                            </div>
                          </Badge>
                          {bet.matches && (
                            <span className="text-white font-medium text-sm">
                              {bet.matches.home_team} vs {bet.matches.away_team}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">₹{bet.amount}</div>
                          <div className="text-xs text-gray-400">
                            Odds: {bet.odds}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(bet.placed_at).toLocaleDateString()} at{' '}
                            {new Date(bet.placed_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="capitalize">{bet.bet_type}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-300">
                            Potential Win: ₹{bet.potential_win}
                          </div>
                          {bet.result && (
                            <div className="text-orange-400">
                              Result: {bet.result}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Bets Yet</p>
                <p className="text-sm">Start betting to see your history here</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetHistoryModal;
