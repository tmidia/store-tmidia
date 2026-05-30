


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."module_permission" AS ENUM (
    'dashboard',
    'pdv',
    'produtos',
    'estoque',
    'fornecedores',
    'categorias',
    'financeiro',
    'relatorios',
    'configuracoes',
    'usuarios'
);


ALTER TYPE "public"."module_permission" OWNER TO "postgres";


CREATE TYPE "public"."payment_method_type" AS ENUM (
    'dinheiro',
    'cartao_credito',
    'cartao_debito',
    'pix',
    'transferencia',
    'cheque',
    'crediario',
    'misto'
);


ALTER TYPE "public"."payment_method_type" OWNER TO "postgres";


CREATE TYPE "public"."sale_status" AS ENUM (
    'aberta',
    'finalizada',
    'cancelada',
    'estornada'
);


ALTER TYPE "public"."sale_status" OWNER TO "postgres";


CREATE TYPE "public"."session_status" AS ENUM (
    'aberta',
    'fechada'
);


ALTER TYPE "public"."session_status" OWNER TO "postgres";


CREATE TYPE "public"."transaction_type" AS ENUM (
    'venda',
    'sangria',
    'suprimento',
    'despesa',
    'receita_avulsa',
    'estorno'
);


ALTER TYPE "public"."transaction_type" OWNER TO "postgres";


CREATE TYPE "public"."user_type" AS ENUM (
    'superadmin',
    'gerente',
    'vendedor',
    'caixa'
);


ALTER TYPE "public"."user_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO profiles (id, full_name, username, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'vendedor')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("user_id" "uuid", "required_role" "public"."user_type") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = $1
      AND (
        ur.role = $2
        OR ur.role = 'superadmin'
        OR (ur.role = 'gerente'  AND $2 IN ('gerente','vendedor','caixa'))
        OR (ur.role = 'vendedor' AND $2 IN ('vendedor','caixa'))
      )
  )
$_$;


ALTER FUNCTION "public"."has_role"("user_id" "uuid", "required_role" "public"."user_type") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."restore_stock_on_cancel"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.status = 'cancelada' AND OLD.status != 'cancelada' THEN
    IF NEW.variation_id IS NOT NULL THEN
      UPDATE product_variations
      SET stock_quantity = stock_quantity + NEW.quantity
      WHERE id = NEW.variation_id;
    ELSE
      UPDATE products
      SET stock_quantity = stock_quantity + NEW.quantity
      WHERE id = NEW.product_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."restore_stock_on_cancel"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_stock_on_sale"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.variation_id IS NOT NULL THEN
    UPDATE product_variations
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.variation_id;
  ELSE
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_stock_on_sale"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accounts_payable" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supplier_id" "uuid",
    "supplier_name" "text" NOT NULL,
    "category_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "paid_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "remaining_amount" numeric(10,2) GENERATED ALWAYS AS (("amount" - "paid_amount")) STORED,
    "due_date" "date" NOT NULL,
    "payment_date" "date",
    "description" "text" NOT NULL,
    "status" "text" DEFAULT 'pendente'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "accounts_payable_status_check" CHECK (("status" = ANY (ARRAY['pendente'::"text", 'pago_parcial'::"text", 'pago'::"text", 'vencido'::"text", 'cancelado'::"text"])))
);


ALTER TABLE "public"."accounts_payable" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."accounts_receivable" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid",
    "customer_name" "text" NOT NULL,
    "customer_document" "text",
    "customer_phone" "text",
    "sale_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "paid_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "remaining_amount" numeric(10,2) GENERATED ALWAYS AS (("amount" - "paid_amount")) STORED,
    "due_date" "date" NOT NULL,
    "payment_date" "date",
    "description" "text" NOT NULL,
    "status" "text" DEFAULT 'pendente'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "accounts_receivable_status_check" CHECK (("status" = ANY (ARRAY['pendente'::"text", 'pago_parcial'::"text", 'pago'::"text", 'vencido'::"text", 'cancelado'::"text"])))
);


ALTER TABLE "public"."accounts_receivable" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text",
    "record_id" "uuid",
    "old_data" "jsonb",
    "new_data" "jsonb",
    "ip_address" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cash_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "opening_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "closing_amount" numeric(10,2),
    "expected_amount" numeric(10,2),
    "difference" numeric(10,2),
    "status" "public"."session_status" DEFAULT 'aberta'::"public"."session_status" NOT NULL,
    "notes" "text",
    "closed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cash_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "parent_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_name" "text" DEFAULT 'Minha Loja'::"text" NOT NULL,
    "cnpj" "text",
    "phone" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "logo_url" "text",
    "receipt_footer" "text" DEFAULT 'Obrigado pela preferência!'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."company_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "cpf" "text",
    "phone" "text",
    "email" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "birth_date" "date",
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."financial_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "financial_categories_type_check" CHECK (("type" = ANY (ARRAY['receita'::"text", 'despesa'::"text"])))
);


ALTER TABLE "public"."financial_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."financial_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."transaction_type" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "description" "text" NOT NULL,
    "notes" "text",
    "reference_id" "uuid",
    "reference_type" "text",
    "category_id" "uuid",
    "cash_session_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "transaction_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."financial_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "sku" "text",
    "barcode" "text",
    "variation_name" "text" NOT NULL,
    "attributes" "jsonb" DEFAULT '{}'::"jsonb",
    "cost_price" numeric(10,2),
    "sale_price" numeric(10,2),
    "stock_quantity" integer DEFAULT 0 NOT NULL,
    "minimum_stock" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_variations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "barcode" "text",
    "description" "text",
    "category_id" "uuid",
    "subcategory_id" "uuid",
    "supplier_id" "uuid",
    "unit" "text" DEFAULT 'par'::"text" NOT NULL,
    "cost_price" numeric(10,2) DEFAULT 0 NOT NULL,
    "sale_price" numeric(10,2) DEFAULT 0 NOT NULL,
    "stock_quantity" integer DEFAULT 0 NOT NULL,
    "minimum_stock" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "products_unit_check" CHECK (("unit" = ANY (ARRAY['un'::"text", 'par'::"text", 'kit'::"text", 'cx'::"text", 'kg'::"text"])))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "full_name" "text" NOT NULL,
    "user_type" "public"."user_type" DEFAULT 'vendedor'::"public"."user_type" NOT NULL,
    "cpf" "text",
    "avatar_url" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sale_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sale_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "variation_id" "uuid",
    "product_name" "text" NOT NULL,
    "variation_name" "text",
    "quantity" integer DEFAULT 1 NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "discount_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sale_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cash_session_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "customer_id" "uuid",
    "subtotal" numeric(10,2) DEFAULT 0 NOT NULL,
    "discount_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "discount_percent" numeric(5,2) DEFAULT 0 NOT NULL,
    "total_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "amount_paid" numeric(10,2) DEFAULT 0 NOT NULL,
    "change_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "payment_method" "public"."payment_method_type" DEFAULT 'dinheiro'::"public"."payment_method_type" NOT NULL,
    "payment_details" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "public"."sale_status" DEFAULT 'finalizada'::"public"."sale_status" NOT NULL,
    "notes" "text",
    "receipt_number" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sales" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."sales_receipt_number_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."sales_receipt_number_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."sales_receipt_number_seq" OWNED BY "public"."sales"."receipt_number";



CREATE TABLE IF NOT EXISTS "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "company_name" "text",
    "email" "text",
    "phone" "text",
    "cnpj" "text",
    "cpf" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "contact_person" "text",
    "supplier_type" "text",
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "suppliers_supplier_type_check" CHECK (("supplier_type" = ANY (ARRAY['fornecedor'::"text", 'prestador'::"text", 'pessoa_fisica'::"text", 'pessoa_juridica'::"text"])))
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_parameters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "show_dashboard_charts" boolean DEFAULT true NOT NULL,
    "enable_pdv" boolean DEFAULT true NOT NULL,
    "allow_manual_discount" boolean DEFAULT true NOT NULL,
    "max_discount_percent" numeric(5,2) DEFAULT 10.00 NOT NULL,
    "show_low_stock_alert" boolean DEFAULT true NOT NULL,
    "low_stock_threshold" integer DEFAULT 5 NOT NULL,
    "show_due_accounts" boolean DEFAULT true NOT NULL,
    "show_daily_report" boolean DEFAULT true NOT NULL,
    "require_customer_on_sale" boolean DEFAULT false NOT NULL,
    "print_receipt_auto" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."system_parameters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "module" "public"."module_permission" NOT NULL,
    "can_view" boolean DEFAULT false NOT NULL,
    "can_create" boolean DEFAULT false NOT NULL,
    "can_edit" boolean DEFAULT false NOT NULL,
    "can_delete" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."user_type" NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."sales" ALTER COLUMN "receipt_number" SET DEFAULT "nextval"('"public"."sales_receipt_number_seq"'::"regclass");



ALTER TABLE ONLY "public"."accounts_payable"
    ADD CONSTRAINT "accounts_payable_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."accounts_receivable"
    ADD CONSTRAINT "accounts_receivable_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cash_sessions"
    ADD CONSTRAINT "cash_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_settings"
    ADD CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_cpf_key" UNIQUE ("cpf");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."financial_categories"
    ADD CONSTRAINT "financial_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."financial_transactions"
    ADD CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variations"
    ADD CONSTRAINT "product_variations_barcode_key" UNIQUE ("barcode");



ALTER TABLE ONLY "public"."product_variations"
    ADD CONSTRAINT "product_variations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variations"
    ADD CONSTRAINT "product_variations_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_barcode_key" UNIQUE ("barcode");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."sale_items"
    ADD CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_parameters"
    ADD CONSTRAINT "system_parameters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_user_id_module_key" UNIQUE ("user_id", "module");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



CREATE OR REPLACE TRIGGER "on_sale_item_inserted" AFTER INSERT ON "public"."sale_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_stock_on_sale"();



ALTER TABLE ONLY "public"."accounts_payable"
    ADD CONSTRAINT "accounts_payable_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."financial_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."accounts_payable"
    ADD CONSTRAINT "accounts_payable_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."accounts_receivable"
    ADD CONSTRAINT "accounts_receivable_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."accounts_receivable"
    ADD CONSTRAINT "accounts_receivable_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."cash_sessions"
    ADD CONSTRAINT "cash_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."financial_transactions"
    ADD CONSTRAINT "financial_transactions_cash_session_id_fkey" FOREIGN KEY ("cash_session_id") REFERENCES "public"."cash_sessions"("id");



ALTER TABLE ONLY "public"."financial_transactions"
    ADD CONSTRAINT "financial_transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."financial_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."financial_transactions"
    ADD CONSTRAINT "financial_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."product_variations"
    ADD CONSTRAINT "product_variations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sale_items"
    ADD CONSTRAINT "sale_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."sale_items"
    ADD CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sale_items"
    ADD CONSTRAINT "sale_items_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "public"."product_variations"("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_cash_session_id_fkey" FOREIGN KEY ("cash_session_id") REFERENCES "public"."cash_sessions"("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_permissions"
    ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated can view roles" ON "public"."user_roles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Superadmins can manage roles" ON "public"."user_roles" TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type")) WITH CHECK ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



ALTER TABLE "public"."accounts_payable" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."accounts_receivable" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "active_users_select_cash_sessions" ON "public"."cash_sessions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_active" = true)))));



CREATE POLICY "active_users_select_categories" ON "public"."categories" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_active" = true)))));



CREATE POLICY "active_users_select_company_settings" ON "public"."company_settings" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_active" = true)))));



CREATE POLICY "active_users_select_customers" ON "public"."customers" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_active" = true)))));



CREATE POLICY "active_users_select_financial_categories" ON "public"."financial_categories" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_active" = true)))));



CREATE POLICY "active_users_select_product_variations" ON "public"."product_variations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_active" = true)))));



CREATE POLICY "active_users_select_products" ON "public"."products" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_active" = true)))));



CREATE POLICY "active_users_select_sale_items" ON "public"."sale_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_active" = true)))));



CREATE POLICY "active_users_select_sales" ON "public"."sales" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_active" = true)))));



CREATE POLICY "active_users_select_suppliers" ON "public"."suppliers" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_active" = true)))));



CREATE POLICY "active_users_select_system_parameters" ON "public"."system_parameters" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_active" = true)))));



CREATE POLICY "admin_delete_accounts_payable" ON "public"."accounts_payable" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_accounts_receivable" ON "public"."accounts_receivable" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_cash_sessions" ON "public"."cash_sessions" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_categories" ON "public"."categories" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_company_settings" ON "public"."company_settings" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_customers" ON "public"."customers" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_financial_categories" ON "public"."financial_categories" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_financial_transactions" ON "public"."financial_transactions" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_product_variations" ON "public"."product_variations" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_products" ON "public"."products" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_sale_items" ON "public"."sale_items" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_suppliers" ON "public"."suppliers" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_delete_system_parameters" ON "public"."system_parameters" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



CREATE POLICY "admin_select_audit_logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'superadmin'::"public"."user_type"));



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cash_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."financial_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."financial_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "manager_insert_accounts_payable" ON "public"."accounts_payable" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_insert_accounts_receivable" ON "public"."accounts_receivable" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_insert_categories" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_insert_company_settings" ON "public"."company_settings" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_insert_customers" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_insert_financial_categories" ON "public"."financial_categories" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_insert_financial_transactions" ON "public"."financial_transactions" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_insert_product_variations" ON "public"."product_variations" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_insert_products" ON "public"."products" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_insert_suppliers" ON "public"."suppliers" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_insert_system_parameters" ON "public"."system_parameters" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_select_accounts_payable" ON "public"."accounts_payable" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_select_accounts_receivable" ON "public"."accounts_receivable" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_select_financial_transactions" ON "public"."financial_transactions" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_accounts_payable" ON "public"."accounts_payable" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_accounts_receivable" ON "public"."accounts_receivable" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_categories" ON "public"."categories" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_company_settings" ON "public"."company_settings" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_customers" ON "public"."customers" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_financial_categories" ON "public"."financial_categories" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_financial_transactions" ON "public"."financial_transactions" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_product_variations" ON "public"."product_variations" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_products" ON "public"."products" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_sale_items" ON "public"."sale_items" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_sales" ON "public"."sales" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_suppliers" ON "public"."suppliers" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "manager_update_system_parameters" ON "public"."system_parameters" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



ALTER TABLE "public"."product_variations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_authenticated" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "profiles_update_admin" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'gerente'::"public"."user_type"));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



ALTER TABLE "public"."sale_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sales" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_parameters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "vendedor_insert_cash_sessions" ON "public"."cash_sessions" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'vendedor'::"public"."user_type"));



CREATE POLICY "vendedor_insert_sale_items" ON "public"."sale_items" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'vendedor'::"public"."user_type"));



CREATE POLICY "vendedor_insert_sales" ON "public"."sales" FOR INSERT TO "authenticated" WITH CHECK ("public"."has_role"("auth"."uid"(), 'vendedor'::"public"."user_type"));



CREATE POLICY "vendedor_update_cash_sessions" ON "public"."cash_sessions" FOR UPDATE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'vendedor'::"public"."user_type"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("user_id" "uuid", "required_role" "public"."user_type") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("user_id" "uuid", "required_role" "public"."user_type") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("user_id" "uuid", "required_role" "public"."user_type") TO "service_role";



GRANT ALL ON FUNCTION "public"."restore_stock_on_cancel"() TO "anon";
GRANT ALL ON FUNCTION "public"."restore_stock_on_cancel"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_stock_on_cancel"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_stock_on_sale"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_stock_on_sale"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_stock_on_sale"() TO "service_role";


















GRANT ALL ON TABLE "public"."accounts_payable" TO "anon";
GRANT ALL ON TABLE "public"."accounts_payable" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts_payable" TO "service_role";



GRANT ALL ON TABLE "public"."accounts_receivable" TO "anon";
GRANT ALL ON TABLE "public"."accounts_receivable" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts_receivable" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."cash_sessions" TO "anon";
GRANT ALL ON TABLE "public"."cash_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."cash_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."company_settings" TO "anon";
GRANT ALL ON TABLE "public"."company_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."company_settings" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."financial_categories" TO "anon";
GRANT ALL ON TABLE "public"."financial_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."financial_categories" TO "service_role";



GRANT ALL ON TABLE "public"."financial_transactions" TO "anon";
GRANT ALL ON TABLE "public"."financial_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."financial_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."product_variations" TO "anon";
GRANT ALL ON TABLE "public"."product_variations" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variations" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."sale_items" TO "anon";
GRANT ALL ON TABLE "public"."sale_items" TO "authenticated";
GRANT ALL ON TABLE "public"."sale_items" TO "service_role";



GRANT ALL ON TABLE "public"."sales" TO "anon";
GRANT ALL ON TABLE "public"."sales" TO "authenticated";
GRANT ALL ON TABLE "public"."sales" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sales_receipt_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sales_receipt_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sales_receipt_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."system_parameters" TO "anon";
GRANT ALL ON TABLE "public"."system_parameters" TO "authenticated";
GRANT ALL ON TABLE "public"."system_parameters" TO "service_role";



GRANT ALL ON TABLE "public"."user_permissions" TO "anon";
GRANT ALL ON TABLE "public"."user_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































