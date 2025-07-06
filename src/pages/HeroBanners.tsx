
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye, Star } from "lucide-react";

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  button_text: string;
  background_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const HeroBanners = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: '',
    background_color: '#f97316',
    is_active: false
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hero banners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBanner) {
        // Update existing banner
        const { error } = await supabase
          .from('hero_banners')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingBanner.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Hero banner updated successfully",
        });
      } else {
        // Create new banner
        const { error } = await supabase
          .from('hero_banners')
          .insert({
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Hero banner created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        button_text: '',
        background_color: '#f97316',
        is_active: false
      });
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast({
        title: "Error",
        description: "Failed to save hero banner",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      button_text: banner.button_text,
      background_color: banner.background_color,
      is_active: banner.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero banner?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hero banner deleted successfully",
      });

      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: "Error",
        description: "Failed to delete hero banner",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      // If activating this banner, deactivate all others first
      if (!currentStatus) {
        await supabase
          .from('hero_banners')
          .update({ is_active: false });
      }

      const { error } = await supabase
        .from('hero_banners')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Hero banner ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchBanners();
    } catch (error) {
      console.error('Error updating banner status:', error);
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      button_text: '',
      background_color: '#f97316',
      is_active: false
    });
    setEditingBanner(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Hero Banners</h2>
          <p className="text-muted-foreground">Manage website hero banners</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Hero Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}
              </DialogTitle>
              <DialogDescription>
                Create or edit hero banner for the client website
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Go Crazy With"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="LIVE BETTING"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="button_text">Button Text</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                  placeholder="PLAY NOW"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="background_color">Background Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.background_color}
                    onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                    placeholder="#f97316"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingBanner ? 'Update' : 'Create'} Banner
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Star className="h-5 w-5" />
            Hero Banners Management
          </CardTitle>
          <CardDescription>
            Manage hero banners displayed on the client website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Button Text</TableHead>
                <TableHead>Background</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell>{banner.subtitle}</TableCell>
                  <TableCell>{banner.button_text}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: banner.background_color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {banner.background_color}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={banner.is_active ? "default" : "secondary"}>
                      {banner.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(banner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={banner.is_active ? "destructive" : "default"}
                        onClick={() => toggleStatus(banner.id, banner.is_active)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(banner.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {banners.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hero banners found. Create your first banner to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroBanners;
