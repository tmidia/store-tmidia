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
      accounts_payable: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          issue_date: string | null
          paid_amount: number | null
          payment_method: string | null
          remaining_amount: number
          status: Database["public"]["Enums"]["account_status"] | null
          supplier_id: string | null
          supplier_name: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          issue_date?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          remaining_amount: number
          status?: Database["public"]["Enums"]["account_status"] | null
          supplier_id?: string | null
          supplier_name: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          issue_date?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          remaining_amount?: number
          status?: Database["public"]["Enums"]["account_status"] | null
          supplier_id?: string | null
          supplier_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount: number
          created_at: string | null
          customer_document: string | null
          customer_name: string
          customer_phone: string | null
          description: string | null
          due_date: string
          id: string
          issue_date: string | null
          paid_amount: number | null
          payment_method: string | null
          reference_id: string | null
          remaining_amount: number
          status: Database["public"]["Enums"]["account_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_document?: string | null
          customer_name: string
          customer_phone?: string | null
          description?: string | null
          due_date: string
          id?: string
          issue_date?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          reference_id?: string | null
          remaining_amount: number
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_document?: string | null
          customer_name?: string
          customer_phone?: string | null
          description?: string | null
          due_date?: string
          id?: string
          issue_date?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          reference_id?: string | null
          remaining_amount?: number
          status?: Database["public"]["Enums"]["account_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cash_sessions: {
        Row: {
          closed_at: string | null
          closing_amount: number | null
          difference: number | null
          expected_amount: number | null
          id: string
          notes: string | null
          opened_at: string | null
          opening_amount: number
          status: string | null
          user_id: string | null
        }
        Insert: {
          closed_at?: string | null
          closing_amount?: number | null
          difference?: number | null
          expected_amount?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          opening_amount?: number
          status?: string | null
          user_id?: string | null
        }
        Update: {
          closed_at?: string | null
          closing_amount?: number | null
          difference?: number | null
          expected_amount?: number | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          opening_amount?: number
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string | null
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
          company_name: string
          created_at: string | null
          id: string
          logo_url: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          cnpj?: string | null
          company_name: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          cnpj?: string | null
          company_name?: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          cash_balance: number | null
          created_at: string | null
          description: string
          id: string
          notes: string | null
          reference_id: string | null
          transaction_date: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string | null
        }
        Insert: {
          amount: number
          cash_balance?: number | null
          created_at?: string | null
          description: string
          id?: string
          notes?: string | null
          reference_id?: string | null
          transaction_date?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Update: {
          amount?: number
          cash_balance?: number | null
          created_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          reference_id?: string | null
          transaction_date?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Relationships: [
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
          created_at: string | null
          id: string
          make_auth_token: string | null
          make_enabled: boolean | null
          make_webhook_url: string | null
          n8n_auth_token: string | null
          n8n_enabled: boolean | null
          n8n_webhook_url: string | null
          updated_at: string | null
          whatsapp_daily_sales: boolean | null
          whatsapp_due_accounts: boolean | null
          whatsapp_low_stock_alert: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          make_auth_token?: string | null
          make_enabled?: boolean | null
          make_webhook_url?: string | null
          n8n_auth_token?: string | null
          n8n_enabled?: boolean | null
          n8n_webhook_url?: string | null
          updated_at?: string | null
          whatsapp_daily_sales?: boolean | null
          whatsapp_due_accounts?: boolean | null
          whatsapp_low_stock_alert?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          make_auth_token?: string | null
          make_enabled?: boolean | null
          make_webhook_url?: string | null
          n8n_auth_token?: string | null
          n8n_enabled?: boolean | null
          n8n_webhook_url?: string | null
          updated_at?: string | null
          whatsapp_daily_sales?: boolean | null
          whatsapp_due_accounts?: boolean | null
          whatsapp_low_stock_alert?: boolean | null
        }
        Relationships: []
      }
      product_variations: {
        Row: {
          attributes: Json | null
          cost_price: number
          created_at: string | null
          id: string
          is_active: boolean | null
          minimum_stock: number
          product_id: string
          sale_price: number
          sku: string
          stock_quantity: number
          updated_at: string | null
          variation_name: string
        }
        Insert: {
          attributes?: Json | null
          cost_price?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_stock?: number
          product_id: string
          sale_price?: number
          sku: string
          stock_quantity?: number
          updated_at?: string | null
          variation_name: string
        }
        Update: {
          attributes?: Json | null
          cost_price?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_stock?: number
          product_id?: string
          sale_price?: number
          sku?: string
          stock_quantity?: number
          updated_at?: string | null
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
          code: string
          cost_price: number
          created_at: string | null
          description: string | null
          id: string
          minimum_stock: number
          name: string
          sale_price: number
          stock_quantity: number
          subcategory_id: string | null
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          code: string
          cost_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          minimum_stock?: number
          name: string
          sale_price?: number
          stock_quantity?: number
          subcategory_id?: string | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          code?: string
          cost_price?: number
          created_at?: string | null
          description?: string | null
          id?: string
          minimum_stock?: number
          name?: string
          sale_price?: number
          stock_quantity?: number
          subcategory_id?: string | null
          supplier_id?: string | null
          updated_at?: string | null
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
          created_at: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_activity: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_activity?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
          username?: string
        }
        Relationships: []
      }
      sales_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          product_code: string
          product_id: string | null
          product_name: string
          quantity: number
          subcategory_id: string | null
          total_price: number
          transaction_id: string
          unit_price: number
          variation_id: string | null
          variation_name: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          product_code: string
          product_id?: string | null
          product_name: string
          quantity?: number
          subcategory_id?: string | null
          total_price?: number
          transaction_id: string
          unit_price?: number
          variation_id?: string | null
          variation_name?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          product_code?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          subcategory_id?: string | null
          total_price?: number
          transaction_id?: string
          unit_price?: number
          variation_id?: string | null
          variation_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_items_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "product_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          company_name: string | null
          contact_person: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          supplier_type: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          contact_person?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          supplier_type?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          contact_person?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          supplier_type?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      system_parameters: {
        Row: {
          allow_manual_discount: boolean | null
          created_at: string | null
          enable_pdv: boolean | null
          id: string
          show_daily_report: boolean | null
          show_dashboard_charts: boolean | null
          show_due_accounts: boolean | null
          show_low_stock_alert: boolean | null
          updated_at: string | null
        }
        Insert: {
          allow_manual_discount?: boolean | null
          created_at?: string | null
          enable_pdv?: boolean | null
          id?: string
          show_daily_report?: boolean | null
          show_dashboard_charts?: boolean | null
          show_due_accounts?: boolean | null
          show_low_stock_alert?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allow_manual_discount?: boolean | null
          created_at?: string | null
          enable_pdv?: boolean | null
          id?: string
          show_daily_report?: boolean | null
          show_dashboard_charts?: boolean | null
          show_due_accounts?: boolean | null
          show_low_stock_alert?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          module: Database["public"]["Enums"]["module_permission"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          module: Database["public"]["Enums"]["module_permission"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          module?: Database["public"]["Enums"]["module_permission"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
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
      is_current_user_superadmin: { Args: never; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
    }
    Enums: {
      account_status: "pendente" | "pago" | "vencido" | "cancelado"
      module_permission:
        | "dashboard"
        | "pdv"
        | "produtos"
        | "estoque"
        | "financeiro"
        | "relatorios"
        | "fornecedores"
        | "configuracoes"
        | "usuarios"
        | "categorias"
      system_module:
        | "produtos"
        | "categorias"
        | "fornecedores"
        | "financeiro"
        | "pdv"
        | "relatorios"
        | "usuarios"
        | "configuracoes"
      transaction_type:
        | "entrada"
        | "saida"
        | "abertura_caixa"
        | "fechamento_caixa"
        | "sangria"
        | "suprimento"
        | "venda"
        | "recebimento"
        | "pagamento"
      user_type: "superadmin" | "gerente" | "vendedor" | "estoquista"
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
      account_status: ["pendente", "pago", "vencido", "cancelado"],
      module_permission: [
        "dashboard",
        "pdv",
        "produtos",
        "estoque",
        "financeiro",
        "relatorios",
        "fornecedores",
        "configuracoes",
        "usuarios",
        "categorias",
      ],
      system_module: [
        "produtos",
        "categorias",
        "fornecedores",
        "financeiro",
        "pdv",
        "relatorios",
        "usuarios",
        "configuracoes",
      ],
      transaction_type: [
        "entrada",
        "saida",
        "abertura_caixa",
        "fechamento_caixa",
        "sangria",
        "suprimento",
        "venda",
        "recebimento",
        "pagamento",
      ],
      user_type: ["superadmin", "gerente", "vendedor", "estoquista"],
    },
  },
} as const
