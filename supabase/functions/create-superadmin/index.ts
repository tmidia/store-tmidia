import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifySuperAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { error: "Unauthorized - missing token", status: 401 };
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !user) {
    return { error: "Invalid or expired token", status: 401 };
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: roleCheck } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "superadmin")
    .single();

  if (!roleCheck) {
    return { error: "Forbidden - superadmin role required", status: 403 };
  }

  return { user, supabaseAdmin };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authResult = await verifySuperAdmin(req);
    if ("error" in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { supabaseAdmin } = authResult;
    const { email, password, full_name, username } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email e senha são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (password.length < 8 || password.length > 128) {
      return new Response(JSON.stringify({ error: "Senha deve ter entre 8 e 128 caracteres" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
      });
      if (updateError) {
        return new Response(JSON.stringify({ error: "Falha ao atualizar usuário" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
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
        return new Response(JSON.stringify({ error: "Falha ao criar usuário" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = userData.user.id;
    }

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

    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "superadmin" });

    const modules = ["dashboard", "pdv", "produtos", "estoque", "fornecedores", "categorias", "financeiro", "relatorios", "configuracoes", "usuarios"];
    await supabaseAdmin.from("user_permissions").delete().eq("user_id", userId);
    const permissions = modules.map((m) => ({ user_id: userId, module: m }));
    await supabaseAdmin.from("user_permissions").upsert(permissions);

    return new Response(
      JSON.stringify({ success: true, user_id: userId, message: "Superadmin configurado com sucesso!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
