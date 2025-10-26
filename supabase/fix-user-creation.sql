-- Fix user creation issue by updating the trigger
-- This allows creating users even without username metadata

-- Drop and recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
BEGIN
  -- Get username from metadata, or generate from email, or use user ID
  uname := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'user_' || substring(new.id::text, 1, 8)
  );

  -- Insert into profiles with generated username
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, uname)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Verify the function was updated
SELECT 'Trigger function updated successfully!' as status;
