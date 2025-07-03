
import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, List, Download, Trophy } from "lucide-react";

interface SportCategory {
  id: string;
  category_key: string;
  category_name: string;
  is_active: boolean;
  api_source_id: string;
}

const SportCategories = () => {
  const { apiId } = useParams();
  const [searchParams] = useSearchParams();
  const apiName = searchParams.get('name') || 'Unknown API';
  
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (apiId) {
      fetchCategories();
    }
  }, [apiId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('sport_categories')
        .select('*')
        .eq('api_source_id', apiId)
        .order('category_name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sport categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFromAPI = async () => {
    if (!apiId) return;
    
    setFetching(true);
    try {
      // Get API details
      const { data: apiData, error: apiError } = await supabase
        .from('game_apis')
        .select('*')
        .eq('id', apiId)
        .single();

      if (apiError) throw apiError;

      // Fetch categories from The Odds API
      const testUrl = apiData.api_url.includes('the-odds-api.com') 
        ? `${apiData.api_url}${apiData.api_url.includes('?') ? '&' : '?'}apiKey=${apiData.api_key}`
        : apiData.api_url;

      const response = await fetch(testUrl);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const sportsData = await response.json();
      console.log('Fetched sports data:', sportsData);

      // Transform and insert categories
      const categoriesToInsert = Array.isArray(sportsData) ? sportsData.map((sport: any) => ({
        api_source_id: apiId,
        category_key: sport.key || sport.sport_key || sport.id,
        category_name: sport.title || sport.name || sport.key,
        is_active: false
      })) : [];

      if (categoriesToInsert.length > 0) {
        // Use upsert to avoid duplicates
        const { error: insertError } = await supabase
          .from('sport_categories')
          .upsert(categoriesToInsert, { 
            onConflict: 'api_source_id,category_key',
            ignoreDuplicates: true 
          });

        if (insertError) throw insertError;

        toast({
          title: "Categories Fetched",
          description: `Successfully fetched ${categoriesToInsert.length} sport categories`,
        });

        fetchCategories();
      } else {
        toast({
          title: "No Categories Found",
          description: "No sport categories were found from the API",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching from API:', error);
      toast({
        title: "Fetch Failed",
        description: `Failed to fetch categories from API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const toggleCategoryStatus = async (categoryId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('sport_categories')
        .update({ is_active: isActive })
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Category ${isActive ? 'activated' : 'deactivated'} successfully`,
      });

      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/game-api">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to APIs
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-foreground">Sport Categories for {apiName}</h2>
          <p className="text-muted-foreground">Manage which sport categories are active</p>
        </div>
        <Button onClick={fetchFromAPI} disabled={fetching}>
          <Download className="h-4 w-4 mr-2" />
          {fetching ? "Fetching..." : "Fetch from API"}
        </Button>
      </div>

      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <List className="h-5 w-5" />
            Sport Categories ({categories.length})
          </CardTitle>
          <CardDescription>
            Activate categories to show them in the game manager and client site
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        {category.category_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{category.category_key}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={(checked) => toggleCategoryStatus(category.id, checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Categories Found</p>
              <p className="text-sm">Click "Fetch from API" to load sport categories from {apiName}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SportCategories;
