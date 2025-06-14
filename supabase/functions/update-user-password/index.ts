
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

    console.log('=== ATUALIZAÇÃO DE SENHA ===')
    console.log('User ID:', user_id)
    console.log('Nova senha fornecida:', !!new_password)

    if (!user_id || !new_password) {
      return new Response(
        JSON.stringify({ 
          error: 'Parâmetros obrigatórios ausentes',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (new_password.length < 6) {
      return new Response(
        JSON.stringify({ 
          error: 'Senha deve ter pelo menos 6 caracteres',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Criar cliente admin
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

    console.log('🔄 Atualizando senha via Admin API...')

    // Atualizar senha usando Admin API
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { 
        password: new_password
      }
    )

    if (updateError) {
      console.error('❌ Erro na atualização:', updateError)
      return new Response(
        JSON.stringify({ 
          error: `Falha na atualização: ${updateError.message}`,
          success: false,
          details: updateError
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Senha atualizada com sucesso!')
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Senha atualizada com sucesso',
        user_id: updateData.user?.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('💥 Erro crítico:', error)
    return new Response(
      JSON.stringify({ 
        error: `Erro interno: ${error.message}`,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
