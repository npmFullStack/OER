-- ============================================
-- COMPLETE DATABASE SETUP FOR OCC eLIBRARY
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- DROP EXISTING TABLES (if they exist)
-- ============================================
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- CREATE USERS TABLE
-- ============================================
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin', 'admin')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATE USER SESSIONS TABLE
-- ============================================
CREATE TABLE public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT,
    device_info TEXT,
    ip_address TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATE ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(token);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- ============================================
-- CREATE FUNCTION FOR UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- CREATE TRIGGER FOR USERS
-- ============================================
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CREATE PASSWORD VERIFICATION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION verify_password(user_email TEXT, user_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    SELECT password_hash INTO stored_hash
    FROM public.users
    WHERE email = user_email;
    
    IF stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN stored_hash = crypt(user_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEEDER: INSERT SUPERADMIN USER
-- ============================================
-- First, check if user exists and update/insert accordingly
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@occ.edu') THEN
        -- Update existing superadmin
        UPDATE public.users 
        SET 
            password_hash = crypt('password', gen_salt('bf')),
            firstname = 'OCCLIB',
            lastname = 'ADMIN',
            role = 'superadmin',
            is_active = true,
            updated_at = NOW()
        WHERE email = 'admin@occ.edu';
    ELSE
        -- Insert new superadmin
        INSERT INTO public.users (firstname, lastname, email, password_hash, role, is_active)
        VALUES (
            'OCCLIB',
            'ADMIN',
            'admin@occ.edu',
            crypt('password', gen_salt('bf')),
            'superadmin',
            true
        );
    END IF;
END $$;

-- ============================================
-- VERIFY SEEDER (This will show the user data)
-- ============================================
SELECT id, firstname, lastname, email, role, is_active, created_at 
FROM public.users 
WHERE email = 'admin@occ.edu';

-- Test password verification (should return true)
SELECT verify_password('admin@occ.edu', 'password') as password_valid;

-- ============================================
-- DISABLE RLS TEMPORARILY FOR DEVELOPMENT
-- ============================================
-- This allows you to test without RLS restrictions
-- You can enable RLS later after testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;

-- ============================================
-- OPTIONAL: ENABLE RLS WITH PROPER POLICIES
-- Uncomment these lines if you want to enable RLS
-- ============================================
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
-- 
-- -- Users policies
-- CREATE POLICY "Users can view their own profile"
--     ON public.users FOR SELECT
--     USING (auth.uid() = id);
-- 
-- CREATE POLICY "Users can update their own profile"
--     ON public.users FOR UPDATE
--     USING (auth.uid() = id);
-- 
-- CREATE POLICY "Superadmins can view all users"
--     ON public.users FOR SELECT
--     USING (EXISTS (
--         SELECT 1 FROM public.users 
--         WHERE id = auth.uid() AND role = 'superadmin'
--     ));
-- 
-- -- User sessions policies
-- CREATE POLICY "Users can view their own sessions"
--     ON public.user_sessions FOR SELECT
--     USING (auth.uid() = user_id);
-- 
-- CREATE POLICY "Users can insert their own sessions"
--     ON public.user_sessions FOR INSERT
--     WITH CHECK (auth.uid() = user_id);
-- 
-- -- Activity logs policies
-- CREATE POLICY "Users can view their own activity logs"
--     ON public.activity_logs FOR SELECT
--     USING (auth.uid() = user_id);
-- 
-- CREATE POLICY "Superadmins can view all activity logs"
--     ON public.activity_logs FOR SELECT
--     USING (EXISTS (
--         SELECT 1 FROM public.users 
--         WHERE id = auth.uid() AND role = 'superadmin'
--     ));

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETE!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Superadmin credentials:';
    RAISE NOTICE 'Email: admin@occ.edu';
    RAISE NOTICE 'Password: password';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'RLS is DISABLED for development';
    RAISE NOTICE 'You can enable RLS later by uncommenting';
    RAISE NOTICE 'the RLS policies section';
    RAISE NOTICE '==========================================';
END $$;