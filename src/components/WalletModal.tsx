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
import { Wallet, CreditCard, ArrowDownCircle, ArrowUpCircle, ExternalLink } from "lucide-react";

interface PaymentGateway {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  webhook_url?: string;
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
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    account_number: "",
    ifsc_code: "",
    bank_name: "",
    account_holder_name: ""
  });
  
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

  const handlePayment = async (gateway: PaymentGateway) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const amountValue = parseFloat(amount);
      
      // Create transaction record
      const { data: transactionData, error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: amountValue,
          payment_gateway_id: gateway.id,
          status: 'pending',
          reference_id: `DEP_${Date.now()}`,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Redirect to payment gateway
      if (gateway.webhook_url) {
        // Create payment URL with transaction details
        const paymentParams = new URLSearchParams({
          amount: amountValue.toString(),
          transaction_id: transactionData.id,
          user_id: user.id,
          gateway: gateway.type,
          redirect_url: window.location.origin
        });
        
        const paymentUrl = `${gateway.webhook_url}?${paymentParams.toString()}`;
        
        // Redirect to payment gateway
        window.open(paymentUrl, '_blank', 'width=800,height=600');
        
        toast({
          title: "Payment Gateway Opened",
          description: `Redirected to ${gateway.name} for payment completion`,
        });

        // For now, close the modal - in production, you'd handle the callback
        setAmount("");
        setShowPaymentGateways(false);
        onOpenChange(false);
      } else {
        toast({
          title: "Configuration Error",
          description: "Payment gateway URL not configured",
          variant: "destructive",
        });
      }
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

  const handleWithdrawal = async () => {
    if (!user) return;
    
    const amountValue = parseFloat(withdrawalAmount);
    if (!amountValue || amountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (amountValue > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount cannot exceed your current balance",
        variant: "destructive",
      });
      return;
    }

    if (amountValue < 500) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is ₹500",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create withdrawal request
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: amountValue,
          method: 'bank_transfer',
          bank_details: bankDetails,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted for review",
      });

      setWithdrawalAmount("");
      setBankDetails({
        account_number: "",
        ifsc_code: "",
        bank_name: "",
        account_holder_name: ""
      });
      setShowWithdrawal(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast({
        title: "Withdrawal Failed",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-gray-700 max-h-[90vh] overflow-auto">
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

          {!showPaymentGateways && !showWithdrawal ? (
            /* Main Menu */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => setShowPaymentGateways(true)}
                  className="bg-green-600 hover:bg-green-700 flex flex-col items-center gap-2 h-20"
                >
                  <ArrowDownCircle className="h-6 w-6" />
                  Add Money
                </Button>
                <Button 
                  onClick={() => setShowWithdrawal(true)}
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white flex flex-col items-center gap-2 h-20"
                >
                  <ArrowUpCircle className="h-6 w-6" />
                  Withdraw
                </Button>
              </div>
            </div>
          ) : showPaymentGateways && !showWithdrawal ? (
            /* Add Money Flow */
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

              {amount && parseFloat(amount) >= 100 && (
                <div className="space-y-3">
                  <h3 className="text-white font-medium">Choose Payment Method</h3>
                  {paymentGateways.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No payment gateways available</p>
                  ) : (
                    paymentGateways.map((gateway) => (
                      <Card 
                        key={gateway.id}
                        className="bg-slate-800 border-gray-600 cursor-pointer hover:border-orange-500 transition-colors"
                        onClick={() => handlePayment(gateway)}
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
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Active</Badge>
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              <Button 
                variant="outline"
                onClick={() => setShowPaymentGateways(false)}
                className="w-full border-gray-600 text-gray-300"
              >
                Back
              </Button>
            </div>
          ) : (
            /* Withdrawal Flow */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawalAmount" className="text-white">Withdrawal Amount</Label>
                <Input
                  id="withdrawalAmount"
                  type="number"
                  placeholder="Minimum ₹500"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="bg-slate-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-medium">Bank Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Account Number"
                    value={bankDetails.account_number}
                    onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value})}
                    className="bg-slate-800 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="IFSC Code"
                    value={bankDetails.ifsc_code}
                    onChange={(e) => setBankDetails({...bankDetails, ifsc_code: e.target.value})}
                    className="bg-slate-800 border-gray-600 text-white"
                  />
                </div>
                <Input
                  placeholder="Bank Name"
                  value={bankDetails.bank_name}
                  onChange={(e) => setBankDetails({...bankDetails, bank_name: e.target.value})}
                  className="bg-slate-800 border-gray-600 text-white"
                />
                <Input
                  placeholder="Account Holder Name"
                  value={bankDetails.account_holder_name}
                  onChange={(e) => setBankDetails({...bankDetails, account_holder_name: e.target.value})}
                  className="bg-slate-800 border-gray-600 text-white"
                />
              </div>

              <Button 
                onClick={handleWithdrawal}
                disabled={loading || !withdrawalAmount || !bankDetails.account_number || !bankDetails.ifsc_code}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {loading ? "Submitting..." : "Submit Withdrawal Request"}
              </Button>

              <Button 
                variant="outline"
                onClick={() => setShowWithdrawal(false)}
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
