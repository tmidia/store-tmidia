
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

    console.log('=== UPDATE PASSWORD REQUEST ===')
    console.log('User ID:', user_id)
    console.log('Password provided:', !!new_password)
    console.log('Password length:', new_password?.length || 0)

    if (!user_id) {
      console.error('❌ User ID missing')
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!new_password || new_password.length < 6) {
      console.error('❌ Invalid password length:', new_password?.length || 0)
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // Get user first to verify existence
    console.log('🔍 Checking if user exists...')
    const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user_id)
    
    if (getUserError || !userData.user) {
      console.error('❌ User not found:', getUserError?.message)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ User found:', userData.user.email)

    // Sign out all sessions for this user first
    console.log('🔄 Signing out all user sessions...')
    try {
      const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(user_id, 'global')
      if (signOutError) {
        console.log('⚠️ Sign out warning:', signOutError.message)
      } else {
        console.log('✅ All sessions signed out')
      }
    } catch (signOutErr) {
      console.log('⚠️ Sign out exception:', signOutErr)
    }

    // Wait a moment for sessions to be invalidated
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update password using admin API
    console.log('🔐 Updating password via Admin API...')
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { 
        password: new_password,
        email_confirm: false // Ensure email confirmation is not required
      }
    )

    if (updateError) {
      console.error('❌ Password update failed:', updateError.message)
      console.error('Error details:', JSON.stringify(updateError, null, 2))
      return new Response(
        JSON.stringify({ 
          error: `Password update failed: ${updateError.message}`,
          details: updateError
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Password updated successfully!')
    console.log('Updated user email:', updateData.user?.email)
    console.log('Updated at:', updateData.user?.updated_at)

    // Double-check the update by fetching user again
    console.log('🔍 Verifying password update...')
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.admin.getUserById(user_id)
    
    if (verifyError) {
      console.error('⚠️ Verification failed:', verifyError.message)
    } else {
      console.log('✅ Verification successful')
      console.log('User updated_at after change:', verifyData.user?.updated_at)
    }

    console.log('=== UPDATE PASSWORD COMPLETE ===')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password updated successfully',
        user_id: updateData.user?.id,
        email: updateData.user?.email,
        updated_at: updateData.user?.updated_at
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 CRITICAL ERROR in update-user-password:', error)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: `Internal server error: ${error.message}`,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
