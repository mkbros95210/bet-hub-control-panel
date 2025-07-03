
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { User, History, TrendingUp, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  wallet_balance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  reference_id: string;
}

interface Bet {
  id: string;
  bet_type: string;
  amount: number;
  odds: number;
  potential_win: number;
  status: string;
  placed_at: string;
  result: string;
  matches: {
    home_team: string;
    away_team: string;
    sport: string;
  };
}

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchProfile();
      fetchTransactions();
      fetchBets();
    }
  }, [open, user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_bets')
        .select(`
          *,
          matches:match_id(home_team, away_team, sport)
        `)
        .eq('user_id', user.id)
        .order('placed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBets(data || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > profile.wallet_balance) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    if (amount < 500) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is ₹500",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: amount,
          method: 'bank_transfer',
          bank_details: {
            account_number: bankAccount,
            ifsc_code: ifscCode
          },
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted for approval",
      });

      setWithdrawalAmount("");
      setBankAccount("");
      setIfscCode("");
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      completed: "default",
      won: "default",
      lost: "destructive",
      cancelled: "outline"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>;
  };

  if (!profile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-slate-900 border-gray-700">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-slate-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5" />
            Profile
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-black/30">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bets">Bet History</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawal">Withdrawal</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-slate-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      value={profile.email || user?.email || ""}
                      disabled
                      className="bg-slate-700 border-gray-600 text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name || ""}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      placeholder="Enter your full name"
                      className="bg-slate-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="Enter your phone number"
                      className="bg-slate-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Wallet Balance</Label>
                    <div className="text-2xl font-bold text-orange-500">
                      ₹{profile.wallet_balance?.toLocaleString() || "0"}
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bets" className="space-y-4">
            <Card className="bg-slate-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Betting History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Match</TableHead>
                      <TableHead className="text-gray-300">Bet Type</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Odds</TableHead>
                      <TableHead className="text-gray-300">Potential Win</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bets.map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell className="text-white">
                          <div>
                            <div className="font-medium">
                              {bet.matches?.home_team} vs {bet.matches?.away_team}
                            </div>
                            <div className="text-sm text-gray-400 capitalize">
                              {bet.matches?.sport}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{bet.bet_type}</TableCell>
                        <TableCell className="text-white">₹{bet.amount}</TableCell>
                        <TableCell className="text-white">{bet.odds}</TableCell>
                        <TableCell className="text-green-400">₹{bet.potential_win}</TableCell>
                        <TableCell>{getStatusBadge(bet.status)}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(bet.placed_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {bets.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No betting history found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="bg-slate-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Reference</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            {transaction.type === 'deposit' ? (
                              <ArrowDownCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowUpCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">₹{transaction.amount}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="text-gray-400">{transaction.reference_id}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No transaction history found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawal" className="space-y-4">
            <Card className="bg-slate-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5" />
                  Withdrawal Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWithdrawal} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdrawalAmount" className="text-white">
                      Withdrawal Amount (Min: ₹500)
                    </Label>
                    <Input
                      id="withdrawalAmount"
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-slate-700 border-gray-600 text-white"
                    />
                    <p className="text-sm text-gray-400">
                      Available Balance: ₹{profile.wallet_balance?.toLocaleString() || "0"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccount" className="text-white">Bank Account Number</Label>
                    <Input
                      id="bankAccount"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="Enter bank account number"
                      className="bg-slate-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifscCode" className="text-white">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      placeholder="Enter IFSC code"
                      className="bg-slate-700 border-gray-600 text-white"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !withdrawalAmount || !bankAccount || !ifscCode}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                  >
                    Submit Withdrawal Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
