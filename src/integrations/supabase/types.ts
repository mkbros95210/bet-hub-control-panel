export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          password_hash: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          password_hash: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          password_hash?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bets: {
        Row: {
          amount: number
          bet_type: string
          id: string
          match_id: string
          odds: number
          placed_at: string
          potential_win: number
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bet_type: string
          id?: string
          match_id: string
          odds: number
          placed_at?: string
          potential_win: number
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bet_type?: string
          id?: string
          match_id?: string
          odds?: number
          placed_at?: string
          potential_win?: number
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_apis: {
        Row: {
          api_key: string | null
          api_url: string
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          api_key?: string | null
          api_url: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string | null
          api_url?: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          api_source_id: string | null
          away_odds: number | null
          away_team: string
          created_at: string
          draw_odds: number | null
          home_odds: number | null
          home_team: string
          id: string
          match_date: string
          result: string | null
          show_on_frontend: boolean | null
          sport: string
          status: string | null
        }
        Insert: {
          api_source_id?: string | null
          away_odds?: number | null
          away_team: string
          created_at?: string
          draw_odds?: number | null
          home_odds?: number | null
          home_team: string
          id?: string
          match_date: string
          result?: string | null
          show_on_frontend?: boolean | null
          sport?: string
          status?: string | null
        }
        Update: {
          api_source_id?: string | null
          away_odds?: number | null
          away_team?: string
          created_at?: string
          draw_odds?: number | null
          home_odds?: number | null
          home_team?: string
          id?: string
          match_date?: string
          result?: string | null
          show_on_frontend?: boolean | null
          sport?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_api_source_id_fkey"
            columns: ["api_source_id"]
            isOneToOne: false
            referencedRelation: "game_apis"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          api_key: string | null
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_test_mode: boolean | null
          name: string
          secret_key: string | null
          type: string
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_test_mode?: boolean | null
          name: string
          secret_key?: string | null
          type: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_test_mode?: boolean | null
          name?: string
          secret_key?: string | null
          type?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          kyc_status: string | null
          phone: string | null
          role: string | null
          updated_at: string
          wallet_balance: number | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          kyc_status?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          wallet_balance?: number | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_status?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          wallet_balance?: number | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: string | null
          reference_id: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method?: string | null
          reference_id?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string | null
          reference_id?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bets: {
        Row: {
          amount: number
          bet_type: string
          id: string
          match_id: string | null
          odds: number
          placed_at: string | null
          potential_win: number
          result: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          bet_type: string
          id?: string
          match_id?: string | null
          odds: number
          placed_at?: string | null
          potential_win: number
          result?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          bet_type?: string
          id?: string
          match_id?: string | null
          odds?: number
          placed_at?: string | null
          potential_win?: number
          result?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_gateway_id: string | null
          processed_at: string | null
          reference_id: string | null
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_gateway_id?: string | null
          processed_at?: string | null
          reference_id?: string | null
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_gateway_id?: string | null
          processed_at?: string | null
          reference_id?: string | null
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_payment_gateway_id_fkey"
            columns: ["payment_gateway_id"]
            isOneToOne: false
            referencedRelation: "payment_gateways"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          bank_details: Json | null
          id: string
          method: string
          processed_at: string | null
          requested_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          bank_details?: Json | null
          id?: string
          method?: string
          processed_at?: string | null
          requested_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bank_details?: Json | null
          id?: string
          method?: string
          processed_at?: string | null
          requested_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: { user_email: string; user_password: string; user_name?: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
