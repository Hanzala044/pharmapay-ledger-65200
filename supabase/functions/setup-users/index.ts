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
    // Create admin client with service role key for user management
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

    console.log('Starting user setup...')

    // Create owner account
    const { data: ownerData, error: ownerError } = await supabaseAdmin.auth.admin.createUser({
      email: 'owner@pharmapay.local',
      password: 'hamza',
      email_confirm: true,
      user_metadata: {
        username: 'mohd_hanif'
      }
    })

    if (ownerError) {
      console.error('Owner creation error:', ownerError)
      // If user already exists, try to get it
      if (ownerError.message.includes('already registered')) {
        const { data: existingOwner } = await supabaseAdmin.auth.admin.listUsers()
        const owner = existingOwner.users.find(u => u.email === 'owner@pharmapay.local')
        if (owner) {
          console.log('Owner already exists, assigning role...')
          await supabaseAdmin.from('user_roles').upsert({
            user_id: owner.id,
            role: 'owner'
          })
        }
      }
    } else if (ownerData.user) {
      console.log('Owner created successfully')
      // Assign owner role
      await supabaseAdmin.from('user_roles').insert({
        user_id: ownerData.user.id,
        role: 'owner'
      })
      console.log('Owner role assigned')
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

    if (managerError) {
      console.error('Manager creation error:', managerError)
      // If user already exists, try to get it
      if (managerError.message.includes('already registered')) {
        const { data: existingManager } = await supabaseAdmin.auth.admin.listUsers()
        const manager = existingManager.users.find(u => u.email === 'manager@pharmapay.local')
        if (manager) {
          console.log('Manager already exists, assigning role...')
          await supabaseAdmin.from('user_roles').upsert({
            user_id: manager.id,
            role: 'manager'
          })
        }
      }
    } else if (managerData.user) {
      console.log('Manager created successfully')
      // Assign manager role
      await supabaseAdmin.from('user_roles').insert({
        user_id: managerData.user.id,
        role: 'manager'
      })
      console.log('Manager role assigned')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Users setup completed successfully',
        owner: ownerData?.user ? 'created' : 'existing',
        manager: managerData?.user ? 'created' : 'existing'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in setup-users:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
