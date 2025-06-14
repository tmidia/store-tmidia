
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, new_password } = await req.json()

    console.log('Atualizando senha para usuário:', user_id)

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Validar se o user_id foi fornecido
    if (!user_id) {
      console.error('User ID não fornecido')
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!new_password || new_password.length < 6) {
      console.error('Senha inválida:', new_password?.length || 0, 'caracteres')
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Tentando atualizar senha via Admin API para usuário:', user_id)

    // Update user password directly by user ID using admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { 
        password: new_password,
        email_confirm: true // Força confirmação do email para evitar problemas
      }
    )

    if (error) {
      console.error('Erro ao atualizar senha via Admin API:', error)
      return new Response(
        JSON.stringify({ error: `Failed to update password: ${error.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Senha atualizada com sucesso para usuário:', user_id)
    console.log('Dados do usuário após atualização:', data.user?.email)

    return new Response(
      JSON.stringify({ 
        message: 'Password updated successfully',
        user_id: data.user?.id,
        email: data.user?.email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na função edge update-user-password:', error)
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
