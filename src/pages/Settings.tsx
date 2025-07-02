
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon, Save, Globe, DollarSign, Shield } from "lucide-react";

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;
      
      const settingsMap = (data || []).reduce((acc: Record<string, any>, setting: SystemSetting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update all modified settings
      await Promise.all([
        updateSetting('site_name', settings.site_name),
        updateSetting('maintenance_mode', settings.maintenance_mode),
        updateSetting('enable_deposits', settings.enable_deposits),
        updateSetting('enable_withdrawals', settings.enable_withdrawals),
        updateSetting('min_bet_amount', settings.min_bet_amount),
        updateSetting('max_bet_amount', settings.max_bet_amount)
      ]);

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">System Settings</h2>
          <p className="text-muted-foreground">Configure your betting platform settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic website configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Website Name</Label>
              <Input
                id="site_name"
                value={settings.site_name || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                placeholder="Enter website name"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable to take the site offline for maintenance
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode || false}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenance_mode: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5" />
              Feature Controls
            </CardTitle>
            <CardDescription>Enable or disable platform features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Deposits</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to deposit money
                </p>
              </div>
              <Switch
                checked={settings.enable_deposits || false}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_deposits: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Withdrawals</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to withdraw money
                </p>
              </div>
              <Switch
                checked={settings.enable_withdrawals || false}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enable_withdrawals: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Betting Limits */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5" />
              Betting Limits
            </CardTitle>
            <CardDescription>Set minimum and maximum bet amounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min_bet">Minimum Bet Amount (₹)</Label>
              <Input
                id="min_bet"
                type="number"
                value={settings.min_bet_amount || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, min_bet_amount: Number(e.target.value) }))}
                placeholder="Enter minimum bet amount"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_bet">Maximum Bet Amount (₹)</Label>
              <Input
                id="max_bet"
                type="number"
                value={settings.max_bet_amount || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, max_bet_amount: Number(e.target.value) }))}
                placeholder="Enter maximum bet amount"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <SettingsIcon className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current system information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-500">Online</div>
                <div className="text-sm text-muted-foreground">System Status</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">v1.0.0</div>
                <div className="text-sm text-muted-foreground">Version</div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
