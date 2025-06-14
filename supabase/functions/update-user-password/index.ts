
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

    console.log('=== INÍCIO DA ATUALIZAÇÃO DE SENHA ===')
    console.log('User ID:', user_id)
    console.log('Senha fornecida:', new_password ? 'SIM' : 'NÃO')
    console.log('Tamanho da senha:', new_password?.length || 0)

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

    // Validações básicas
    if (!user_id) {
      console.error('❌ User ID não fornecido')
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!new_password || new_password.length < 6) {
      console.error('❌ Senha inválida - tamanho:', new_password?.length || 0)
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se o usuário existe
    console.log('🔍 Verificando se usuário existe...')
    const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user_id)
    
    if (getUserError) {
      console.error('❌ Erro ao buscar usuário:', getUserError)
      return new Response(
        JSON.stringify({ error: `User lookup failed: ${getUserError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!existingUser.user) {
      console.error('❌ Usuário não encontrado')
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Usuário encontrado:', existingUser.user.email)
    console.log('📧 Email do usuário:', existingUser.user.email)
    console.log('🆔 ID do usuário:', existingUser.user.id)

    // Primeiro, invalidar todas as sessões do usuário
    console.log('🔄 Invalidando sessões existentes...')
    try {
      await supabaseAdmin.auth.admin.signOut(user_id, 'global')
      console.log('✅ Sessões invalidadas com sucesso')
    } catch (signOutError) {
      console.log('⚠️ Aviso: Não foi possível invalidar sessões:', signOutError)
      // Continuar mesmo se não conseguir invalidar sessões
    }

    // Aguardar um pouco para garantir que as sessões foram invalidadas
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Atualizar a senha
    console.log('🔐 Atualizando senha...')
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { 
        password: new_password
      }
    )

    if (updateError) {
      console.error('❌ Erro ao atualizar senha:', updateError)
      console.error('Detalhes do erro:', JSON.stringify(updateError, null, 2))
      return new Response(
        JSON.stringify({ 
          error: `Failed to update password: ${updateError.message}`,
          details: updateError
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Senha atualizada com sucesso!')
    console.log('📊 Dados retornados:', updateData?.user?.email)

    // Verificar se realmente foi atualizado
    console.log('🔍 Verificando atualização...')
    const { data: verifyUser, error: verifyError } = await supabaseAdmin.auth.admin.getUserById(user_id)
    
    if (verifyError) {
      console.error('⚠️ Erro ao verificar atualização:', verifyError)
    } else {
      console.log('✅ Verificação bem-sucedida:', verifyUser?.user?.email)
      console.log('📅 Última atualização:', verifyUser?.user?.updated_at)
    }

    console.log('=== FIM DA ATUALIZAÇÃO DE SENHA ===')

    return new Response(
      JSON.stringify({ 
        message: 'Password updated successfully',
        user_id: updateData?.user?.id,
        email: updateData?.user?.email,
        updated_at: updateData?.user?.updated_at
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 ERRO CRÍTICO na função edge:', error)
    console.error('Stack trace:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: `Internal server error: ${error.message}`,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
