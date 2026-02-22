import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, full_name, username } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email e senha são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try to find existing user by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    let userId: string;

    if (existingUser) {
      // Update existing user's password
      userId = existingUser.id;
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
      });
      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Create new user
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username: username || email,
          full_name: full_name || "Super Admin",
        },
      });
      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = userData.user.id;
    }

    // Ensure profile exists
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      await supabaseAdmin.from("profiles").insert({
        id: userId,
        user_type: "superadmin",
        username: username || email,
        full_name: full_name || "Super Admin",
        is_active: true,
      });
    } else {
      await supabaseAdmin.from("profiles").update({
        user_type: "superadmin",
        username: username || email,
        full_name: full_name || "Super Admin",
        is_active: true,
      }).eq("id", userId);
    }

    // Insert superadmin role
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "superadmin" });

    // Grant all permissions
    const modules = ["dashboard", "pdv", "produtos", "estoque", "fornecedores", "categorias", "financeiro", "relatorios", "configuracoes", "usuarios"];
    
    // Delete existing permissions first
    await supabaseAdmin.from("user_permissions").delete().eq("user_id", userId);
    
    const permissions = modules.map((m) => ({ user_id: userId, module: m }));
    await supabaseAdmin.from("user_permissions").upsert(permissions);

    return new Response(
      JSON.stringify({ success: true, user_id: userId, message: "Superadmin configurado com sucesso!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
