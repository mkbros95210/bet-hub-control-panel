
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, Calendar } from "lucide-react";

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

interface BettingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match | null;
  userBalance: number;
  onBetPlaced: () => void;
}

const BettingModal = ({ open, onOpenChange, match, userBalance, onBetPlaced }: BettingModalProps) => {
  const [selectedBet, setSelectedBet] = useState<{type: string, odds: number, team: string} | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBetSelection = (type: string, odds: number, team: string) => {
    setSelectedBet({ type, odds, team });
  };

  const calculatePotentialWin = () => {
    if (!selectedBet || !amount) return 0;
    return parseFloat(amount) * selectedBet.odds;
  };

  const placeBet = async () => {
    if (!user || !match || !selectedBet) return;

    const betAmount = parseFloat(amount);
    if (!betAmount || betAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }

    if (betAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to place this bet",
        variant: "destructive",
      });
      return;
    }

    if (betAmount < 10) {
      toast({
        title: "Minimum Bet",
        description: "Minimum bet amount is ₹10",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const potentialWin = calculatePotentialWin();
      
      // Create bet record
      const { error: betError } = await supabase
        .from('user_bets')
        .insert({
          user_id: user.id,
          match_id: match.id,
          bet_type: selectedBet.type,
          amount: betAmount,
          odds: selectedBet.odds,
          potential_win: potentialWin,
          status: 'pending'
        });

      if (betError) throw betError;

      // Deduct amount from user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          wallet_balance: userBalance - betAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          type: 'bet_placed',
          amount: -betAmount,
          status: 'completed',
          reference_id: `BET_${Date.now()}`
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Bet Placed Successfully!",
        description: `Your bet of ₹${betAmount} has been placed`,
      });

      setAmount("");
      setSelectedBet(null);
      onBetPlaced();
      onOpenChange(false);
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Bet Failed",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!match) return null;

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'cricket': return '🏏';
      case 'football': return '⚽';
      case 'tennis': return '🎾';
      case 'basketball': return '🏀';
      default: return '🏆';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5" />
            Place Bet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Information */}
          <Card className="bg-slate-800 border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{getSportIcon(match.sport)}</div>
                <div>
                  <h3 className="font-medium text-white">
                    {match.home_team} vs {match.away_team}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(match.match_date).toLocaleDateString()} at{' '}
                    {new Date(match.match_date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {match.status === 'live' && (
                      <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Betting Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Select Your Bet:</h4>
            
            <div className="grid gap-2">
              {match.home_odds && (
                <Button
                  variant={selectedBet?.type === 'home' ? "default" : "outline"}
                  onClick={() => handleBetSelection('home', match.home_odds!, match.home_team)}
                  className={`justify-between p-4 h-auto ${
                    selectedBet?.type === 'home' 
                      ? 'bg-orange-500 border-orange-500' 
                      : 'border-gray-600 hover:border-orange-500'
                  }`}
                >
                  <span className="text-left">
                    <div className="font-medium">{match.home_team}</div>
                    <div className="text-sm opacity-70">Home Win</div>
                  </span>
                  <div className="text-lg font-bold">{match.home_odds}</div>
                </Button>
              )}

              {match.draw_odds && (
                <Button
                  variant={selectedBet?.type === 'draw' ? "default" : "outline"}
                  onClick={() => handleBetSelection('draw', match.draw_odds!, 'Draw')}
                  className={`justify-between p-4 h-auto ${
                    selectedBet?.type === 'draw' 
                      ? 'bg-orange-500 border-orange-500' 
                      : 'border-gray-600 hover:border-orange-500'
                  }`}
                >
                  <span className="text-left">
                    <div className="font-medium">Draw</div>
                    <div className="text-sm opacity-70">Match Draw</div>
                  </span>
                  <div className="text-lg font-bold">{match.draw_odds}</div>
                </Button>
              )}

              {match.away_odds && (
                <Button
                  variant={selectedBet?.type === 'away' ? "default" : "outline"}
                  onClick={() => handleBetSelection('away', match.away_odds!, match.away_team)}
                  className={`justify-between p-4 h-auto ${
                    selectedBet?.type === 'away' 
                      ? 'bg-orange-500 border-orange-500' 
                      : 'border-gray-600 hover:border-orange-500'
                  }`}
                >
                  <span className="text-left">
                    <div className="font-medium">{match.away_team}</div>
                    <div className="text-sm opacity-70">Away Win</div>
                  </span>
                  <div className="text-lg font-bold">{match.away_odds}</div>
                </Button>
              )}
            </div>
          </div>

          {/* Bet Amount */}
          {selectedBet && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Bet Amount</Label>
                <Input
                  type="number"
                  placeholder="Minimum ₹10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-800 border-gray-600 text-white"
                />
                <p className="text-sm text-gray-400">
                  Available Balance: ₹{userBalance.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 500].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset.toString())}
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  >
                    ₹{preset}
                  </Button>
                ))}
              </div>

              {/* Bet Summary */}
              <Card className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-green-500/30">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Selected:</span>
                      <span className="text-white font-medium">{selectedBet.team}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Odds:</span>
                      <span className="text-white">{selectedBet.odds}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Bet Amount:</span>
                      <span className="text-white">₹{amount || "0"}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-300">Potential Win:</span>
                      <span className="text-green-400">₹{calculatePotentialWin().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={placeBet}
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {loading ? "Placing Bet..." : "Place Bet"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BettingModal;
