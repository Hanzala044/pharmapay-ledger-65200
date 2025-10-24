import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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

    // Create owner account
    const { data: ownerData, error: ownerError } = await supabaseAdmin.auth.admin.createUser({
      email: 'owner@pharmapay.local',
      password: 'hamza',
      email_confirm: true,
      user_metadata: {
        username: 'mohd_hanif'
      }
    })

    if (ownerError && !ownerError.message.includes('already registered')) {
      throw ownerError
    }

    // Create manager account
    const { data: managerData, error: managerError } = await supabaseAdmin.auth.admin.createUser({
      email: 'manager@pharmapay.local',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        username: 'manager'
      }
    })

    if (managerError && !managerError.message.includes('already registered')) {
      throw managerError
    }

    // Assign roles
    if (ownerData?.user) {
      await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: ownerData.user.id, role: 'owner' })
    }

    if (managerData?.user) {
      await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: managerData.user.id, role: 'manager' })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Users initialized successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error initializing users:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
