
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, CreditCard } from "lucide-react";

interface PaymentGateway {
  id: string;
  name: string;
  type: string;
  api_key?: string;
  secret_key?: string;
  webhook_url?: string;
  is_active: boolean;
  is_test_mode: boolean;
  created_at: string;
}

const PaymentGateways = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    api_key: "",
    secret_key: "",
    webhook_url: "",
    is_test_mode: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGateways(data || []);
    } catch (error) {
      console.error('Error fetching gateways:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment gateways",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment gateway added successfully",
      });

      setFormData({
        name: "",
        type: "",
        api_key: "",
        secret_key: "",
        webhook_url: "",
        is_test_mode: true
      });
      
      fetchGateways();
    } catch (error) {
      console.error('Error adding gateway:', error);
      toast({
        title: "Error",
        description: "Failed to add payment gateway",
        variant: "destructive",
      });
    }
  };

  const toggleGateway = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Gateway ${is_active ? 'activated' : 'deactivated'} successfully`,
      });

      fetchGateways();
    } catch (error) {
      console.error('Error updating gateway:', error);
      toast({
        title: "Error",
        description: "Failed to update gateway status",
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
          <h2 className="text-3xl font-bold text-foreground">Payment Gateways</h2>
          <p className="text-muted-foreground">Manage payment processors and configurations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Gateway */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Plus className="h-5 w-5" />
              Add Payment Gateway
            </CardTitle>
            <CardDescription>Configure a new payment processor</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Gateway Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Stripe Production"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Gateway Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gateway type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="razorpay">Razorpay</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="paytm">Paytm</SelectItem>
                    <SelectItem value="phonepe">PhonePe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  placeholder="Enter API key"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secret_key">Secret Key</Label>
                <Input
                  id="secret_key"
                  type="password"
                  placeholder="Enter secret key"
                  value={formData.secret_key}
                  onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input
                  id="webhook_url"
                  placeholder="https://yoursite.com/webhook"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="test_mode"
                  checked={formData.is_test_mode}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_test_mode: checked })}
                />
                <Label htmlFor="test_mode">Test Mode</Label>
              </div>
              
              <Button type="submit" className="w-full">
                Add Gateway
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Gateways */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5" />
              Active Gateways
            </CardTitle>
            <CardDescription>Manage existing payment processors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gateways.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No payment gateways configured</p>
              ) : (
                gateways.map((gateway) => (
                  <div key={gateway.id} className="p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{gateway.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={gateway.is_test_mode ? "secondary" : "default"}>
                          {gateway.is_test_mode ? "Test" : "Live"}
                        </Badge>
                        <Switch
                          checked={gateway.is_active}
                          onCheckedChange={(checked) => toggleGateway(gateway.id, checked)}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Type: {gateway.type.charAt(0).toUpperCase() + gateway.type.slice(1)}
                    </p>
                    {gateway.webhook_url && (
                      <p className="text-xs text-muted-foreground">
                        Webhook: {gateway.webhook_url}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Test
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentGateways;
