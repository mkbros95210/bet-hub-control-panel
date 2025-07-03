
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Wallet, CreditCard, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface PaymentGateway {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userBalance: number;
  onBalanceUpdate: () => void;
}

const WalletModal = ({ open, onOpenChange, userBalance, onBalanceUpdate }: WalletModalProps) => {
  const [amount, setAmount] = useState("");
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPaymentGateways, setShowPaymentGateways] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPaymentGateways();
    }
  }, [open]);

  const fetchPaymentGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setPaymentGateways(data || []);
    } catch (error) {
      console.error('Error fetching payment gateways:', error);
    }
  };

  const handleAddMoney = () => {
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amountValue < 100) {
      toast({
        title: "Minimum Amount",
        description: "Minimum deposit amount is ₹100",
        variant: "destructive",
      });
      return;
    }

    setShowPaymentGateways(true);
  };

  const handlePayment = async (gatewayId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const amountValue = parseFloat(amount);
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: amountValue,
          payment_gateway_id: gatewayId,
          status: 'completed', // In real app, this would be 'pending' until payment confirmation
          reference_id: `DEP_${Date.now()}`,
          processed_at: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          wallet_balance: userBalance + amountValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Payment Successful!",
        description: `₹${amountValue} has been added to your wallet`,
      });

      setAmount("");
      setShowPaymentGateways(false);
      onBalanceUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Wallet className="h-5 w-5" />
            Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Balance */}
          <Card className="bg-gradient-to-r from-orange-600 to-red-600 border-0">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ₹{userBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {!showPaymentGateways ? (
            /* Add Money Form */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">Enter Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Minimum ₹100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-800 border-gray-600 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2000].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    onClick={() => setAmount(preset.toString())}
                    className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                  >
                    ₹{preset}
                  </Button>
                ))}
              </div>

              <Button 
                onClick={handleAddMoney}
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={!amount}
              >
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Add Money
              </Button>
            </div>
          ) : (
            /* Payment Gateway Selection */
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">Add ₹{amount}</h3>
                <p className="text-gray-400">Choose payment method</p>
              </div>

              <div className="space-y-3">
                {paymentGateways.map((gateway) => (
                  <Card 
                    key={gateway.id}
                    className="bg-slate-800 border-gray-600 cursor-pointer hover:border-orange-500 transition-colors"
                    onClick={() => handlePayment(gateway.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-6 w-6 text-orange-500" />
                          <div>
                            <h4 className="font-medium text-white">{gateway.name}</h4>
                            <p className="text-sm text-gray-400 capitalize">{gateway.type}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                variant="outline"
                onClick={() => setShowPaymentGateways(false)}
                className="w-full border-gray-600 text-gray-300"
              >
                Back
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
