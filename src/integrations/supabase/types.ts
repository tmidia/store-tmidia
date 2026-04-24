export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          discount_amount: number
          id: string
          product_id: string
          product_name: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
          variation_id: string | null
          variation_name: string | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          id?: string
          product_id: string
          product_name: string
          quantity?: number
          sale_id: string
          total_price: number
          unit_price: number
          variation_id?: string | null
          variation_name?: string | null
        }
        Update: {
          created_at?: string
          discount_amount?: number
          id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          sale_id?: string
          total_price?: number
          unit_price?: number
          variation_id?: string | null
          variation_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          amount_paid: number
          cash_session_id: string | null
          change_amount: number
          created_at: string
          customer_id: string | null
          discount_amount: number
          discount_percent: number
          id: string
          notes: string | null
          payment_details: Json | null
          payment_method: Database["public"]["Enums"]["payment_method_type"]
          receipt_number: number
          status: Database["public"]["Enums"]["sale_status"]
          subtotal: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          cash_session_id?: string | null
          change_amount?: number
          created_at?: string
          customer_id?: string | null
          discount_amount?: number
          discount_percent?: number
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method_type"]
          receipt_number?: number
          status?: Database["public"]["Enums"]["sale_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          cash_session_id?: string | null
          change_amount?: number
          created_at?: string
          customer_id?: string | null
          discount_amount?: number
          discount_percent?: number
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method_type"]
          receipt_number?: number
          status?: Database["public"]["Enums"]["sale_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }

      accounts_payable: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          paid_amount: number | null
          remaining_amount: number | null
          status: string
          supplier_id: string | null
          supplier_name: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          remaining_amount?: number | null
          status?: string
          supplier_id?: string | null
          supplier_name?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          remaining_amount?: number | null
          status?: string
          supplier_id?: string | null
          supplier_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount: number
          created_at: string
          customer_document: string | null
          customer_name: string | null
          customer_phone: string | null
          description: string | null
          due_date: string | null
          id: string
          paid_amount: number | null
          remaining_amount: number | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          customer_document?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          paid_amount?: number | null
          remaining_amount?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_document?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          paid_amount?: number | null
          remaining_amount?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      cash_sessions: {
        Row: {
          closed_at: string | null
          closing_amount: number | null
          created_at: string
          difference: number | null
          expected_amount: number | null
          id: string
          opening_amount: number
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          closed_at?: string | null
          closing_amount?: number | null
          created_at?: string
          difference?: number | null
          expected_amount?: number | null
          id?: string
          opening_amount?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          closed_at?: string | null
          closing_amount?: number | null
          created_at?: string
          difference?: number | null
          expected_amount?: number | null
          id?: string
          opening_amount?: number
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          cnpj: string | null
          company_name: string | null
          created_at: string
          id: string
          logo_url: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          cash_session_id: string | null
          created_at: string
          description: string | null
          id: string
          notes: string | null
          payment_method: string | null
          reference_id: string | null
          transaction_date: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          cash_session_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          transaction_date?: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          cash_session_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          created_at: string
          id: string
          make_auth_token: string | null
          make_enabled: boolean
          make_webhook_url: string | null
          n8n_auth_token: string | null
          n8n_enabled: boolean
          n8n_webhook_url: string | null
          updated_at: string
          whatsapp_daily_sales: boolean
          whatsapp_due_accounts: boolean
          whatsapp_low_stock_alert: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          make_auth_token?: string | null
          make_enabled?: boolean
          make_webhook_url?: string | null
          n8n_auth_token?: string | null
          n8n_enabled?: boolean
          n8n_webhook_url?: string | null
          updated_at?: string
          whatsapp_daily_sales?: boolean
          whatsapp_due_accounts?: boolean
          whatsapp_low_stock_alert?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          make_auth_token?: string | null
          make_enabled?: boolean
          make_webhook_url?: string | null
          n8n_auth_token?: string | null
          n8n_enabled?: boolean
          n8n_webhook_url?: string | null
          updated_at?: string
          whatsapp_daily_sales?: boolean
          whatsapp_due_accounts?: boolean
          whatsapp_low_stock_alert?: boolean
        }
        Relationships: []
      }
      product_variations: {
        Row: {
          attributes: Json | null
          cost_price: number | null
          created_at: string
          id: string
          is_active: boolean
          minimum_stock: number | null
          product_id: string
          sale_price: number | null
          sku: string | null
          stock_quantity: number | null
          updated_at: string
          variation_name: string
        }
        Insert: {
          attributes?: Json | null
          cost_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_stock?: number | null
          product_id: string
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string
          variation_name: string
        }
        Update: {
          attributes?: Json | null
          cost_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_stock?: number | null
          product_id?: string
          sale_price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string
          variation_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          code: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          minimum_stock: number | null
          name: string
          sale_price: number | null
          stock_quantity: number | null
          subcategory_id: string | null
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          code?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          minimum_stock?: number | null
          name: string
          sale_price?: number | null
          stock_quantity?: number | null
          subcategory_id?: string | null
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          code?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          minimum_stock?: number | null
          name?: string
          sale_price?: number | null
          stock_quantity?: number | null
          subcategory_id?: string | null
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          last_activity: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          last_activity?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_activity?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          username?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          company_name: string | null
          contact_person: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          supplier_type: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          contact_person?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          supplier_type?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          contact_person?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          supplier_type?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      system_parameters: {
        Row: {
          allow_manual_discount: boolean
          created_at: string
          enable_pdv: boolean
          enable_receipt_printing: boolean
          id: string
          show_daily_report: boolean
          show_dashboard_charts: boolean
          show_due_accounts: boolean
          show_low_stock_alert: boolean
          updated_at: string
        }
        Insert: {
          allow_manual_discount?: boolean
          created_at?: string
          enable_pdv?: boolean
          enable_receipt_printing?: boolean
          id?: string
          show_daily_report?: boolean
          show_dashboard_charts?: boolean
          show_due_accounts?: boolean
          show_low_stock_alert?: boolean
          updated_at?: string
        }
        Update: {
          allow_manual_discount?: boolean
          created_at?: string
          enable_pdv?: boolean
          enable_receipt_printing?: boolean
          id?: string
          show_daily_report?: boolean
          show_dashboard_charts?: boolean
          show_due_accounts?: boolean
          show_low_stock_alert?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          id: string
          module: Database["public"]["Enums"]["module_permission"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module: Database["public"]["Enums"]["module_permission"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module?: Database["public"]["Enums"]["module_permission"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_type"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["user_type"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_type"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      payment_method_type:
        | "dinheiro"
        | "cartao_credito"
        | "cartao_debito"
        | "pix"
        | "transferencia"
        | "cheque"
        | "crediario"
        | "misto"
      sale_status: "aberta" | "finalizada" | "cancelada" | "estornada"
      session_status: "aberta" | "fechada"
      transaction_type:
        | "venda"
        | "sangria"
        | "suprimento"
        | "despesa"
        | "receita_avulsa"
        | "estorno"

      module_permission:
        | "dashboard"
        | "pdv"
        | "produtos"
        | "estoque"
        | "fornecedores"
        | "categorias"
        | "financeiro"
        | "relatorios"
        | "configuracoes"
        | "usuarios"
      user_type: "superadmin" | "gerente" | "vendedor" | "caixa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      module_permission: [
        "dashboard",
        "pdv",
        "produtos",
        "estoque",
        "fornecedores",
        "categorias",
        "financeiro",
        "relatorios",
        "configuracoes",
        "usuarios",
      ],
      user_type: ["superadmin", "gerente", "vendedor", "caixa"],
    },
  },
} as const
