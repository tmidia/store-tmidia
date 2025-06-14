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
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
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
      is_current_user_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
