-- ============================================
-- Manual User Creation Script
-- ============================================
-- Run this in Supabase SQL Editor if edge functions are not working
-- URL: https://supabase.com/dashboard/project/atgazgkilvuznodbubxs/sql/new

-- Step 1: Create users in auth.users table
-- Note: You'll need to do this via Supabase Dashboard > Authentication > Users
-- Or use this approach with a temporary function

-- Create a temporary function to add users
CREATE OR REPLACE FUNCTION create_initial_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  owner_id UUID;
  manager_id UUID;
BEGIN
  -- Create owner user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'owner@pharmapay.local',
    crypt('hamza', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"mohd_hanif"}',
    NOW(),
    NOW(),
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO owner_id;

  -- Get owner_id if already exists
  IF owner_id IS NULL THEN
    SELECT id INTO owner_id FROM auth.users WHERE email = 'owner@pharmapay.local';
  END IF;

  -- Create manager user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'manager@pharmapay.local',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"manager"}',
    NOW(),
    NOW(),
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO manager_id;

  -- Get manager_id if already exists
  IF manager_id IS NULL THEN
    SELECT id INTO manager_id FROM auth.users WHERE email = 'manager@pharmapay.local';
  END IF;

  -- Create profiles
  INSERT INTO public.profiles (id, username)
  VALUES 
    (owner_id, 'mohd_hanif'),
    (manager_id, 'manager')
  ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;

  -- Assign roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES 
    (owner_id, 'owner'),
    (manager_id, 'manager')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'Users created successfully!';
END;
$$;

-- Execute the function
SELECT create_initial_users();

-- Clean up
DROP FUNCTION create_initial_users();

-- Verify users were created
SELECT 
  u.email,
  u.email_confirmed_at,
  p.username,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email IN ('owner@pharmapay.local', 'manager@pharmapay.local');
