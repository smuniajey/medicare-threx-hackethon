import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if admin already exists
    const { data: existingAdminRole } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (existingAdminRole && existingAdminRole.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Admin account already exists. Demo accounts have already been created.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create admin user
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@medicare.demo',
      password: 'admin123',
      email_confirm: true,
    })

    if (adminError) {
      throw new Error(`Failed to create admin: ${adminError.message}`)
    }

    // Create admin profile
    const { error: adminProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: adminData.user.id,
        full_name: 'System Admin',
      })

    if (adminProfileError) {
      throw new Error(`Failed to create admin profile: ${adminProfileError.message}`)
    }

    // Assign admin role
    const { error: adminRoleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: adminData.user.id,
        role: 'admin',
      })

    if (adminRoleError) {
      throw new Error(`Failed to assign admin role: ${adminRoleError.message}`)
    }

    // Create doctor user
    const { data: doctorData, error: doctorError } = await supabaseAdmin.auth.admin.createUser({
      email: 'doctor1@medicare.demo',
      password: 'doctor123',
      email_confirm: true,
    })

    if (doctorError) {
      throw new Error(`Failed to create doctor: ${doctorError.message}`)
    }

    // Create doctor profile
    const { error: doctorProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: doctorData.user.id,
        full_name: 'Dr. Demo Doctor',
      })

    if (doctorProfileError) {
      throw new Error(`Failed to create doctor profile: ${doctorProfileError.message}`)
    }

    // Assign doctor role
    const { error: doctorRoleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: doctorData.user.id,
        role: 'doctor',
      })

    if (doctorRoleError) {
      throw new Error(`Failed to assign doctor role: ${doctorRoleError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo accounts created successfully',
        accounts: [
          { email: 'admin@medicare.demo', password: 'admin123', role: 'admin' },
          { email: 'doctor1@medicare.demo', password: 'doctor123', role: 'doctor' },
        ],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return new Response(
      JSON.stringify({ success: false, message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
