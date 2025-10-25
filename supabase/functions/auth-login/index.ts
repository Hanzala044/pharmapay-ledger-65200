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
    const { username, password } = await req.json()

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Server-side username to email mapping
    const emailMap: { [key: string]: string } = {
      'mohd_hanif': 'owner@pharmapay.local',
      'manager': 'manager@pharmapay.local'
    }

    const email = emailMap[username.toLowerCase()]
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Invalid username or password' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid username or password' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    return new Response(
      JSON.stringify({ 
        session: data.session,
        user: data.user 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in auth-login:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred during authentication' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
