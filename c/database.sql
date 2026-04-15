-- ============================================
-- COMPLETE DATABASE SETUP FOR OCC eLIBRARY
-- WITH EMAIL NOTIFICATIONS AND PROGRAMS
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- DROP EXISTING TABLES (if they exist)
-- ============================================
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.pending_invites CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- CREATE USERS TABLE (Updated to match component)
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
-- CREATE PROGRAMS TABLE
-- ============================================
CREATE TABLE public.programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    acronym VARCHAR(10) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color code
    total_books INTEGER DEFAULT 0,
    total_ebooks INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- ============================================
-- CREATE USER SESSIONS TABLE
-- ============================================
CREATE TABLE public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
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
-- CREATE PENDING INVITES TABLE FOR NEW ADMINS
-- ============================================
CREATE TABLE public.pending_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    temp_password TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
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
CREATE INDEX idx_pending_invites_email ON public.pending_invites(email);
CREATE INDEX idx_pending_invites_token ON public.pending_invites(token);
CREATE INDEX idx_programs_name ON public.programs(name);
CREATE INDEX idx_programs_acronym ON public.programs(acronym);
CREATE INDEX idx_programs_is_active ON public.programs(is_active);

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
-- CREATE TRIGGER FOR PROGRAMS
-- ============================================
CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON public.programs
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
-- CREATE FUNCTION TO HASH PASSWORD ON INSERT/UPDATE
-- ============================================
CREATE OR REPLACE FUNCTION hash_password_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Only hash if password_hash is provided and not already hashed
    IF NEW.password_hash IS NOT NULL AND NEW.password_hash NOT LIKE '$2a$%' AND NEW.password_hash NOT LIKE '$2b$%' THEN
        NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE TRIGGER FOR PASSWORD HASHING
-- ============================================
DROP TRIGGER IF EXISTS hash_password_on_insert ON public.users;
CREATE TRIGGER hash_password_on_insert
    BEFORE INSERT OR UPDATE OF password_hash ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION hash_password_trigger();

-- ============================================
-- FUNCTION TO CREATE USER FROM INVITE
-- ============================================
CREATE OR REPLACE FUNCTION accept_invite(
    p_token TEXT,
    p_new_password TEXT
)
RETURNS TABLE(user_id UUID, user_email TEXT) AS $$
DECLARE
    v_invite RECORD;
    v_user_id UUID;
BEGIN
    -- Get the invite
    SELECT * INTO v_invite 
    FROM public.pending_invites 
    WHERE token = p_token AND expires_at > NOW();
    
    IF v_invite IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired invite token';
    END IF;
    
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM public.users WHERE email = v_invite.email) THEN
        DELETE FROM public.pending_invites WHERE token = p_token;
        RAISE EXCEPTION 'User already exists';
    END IF;
    
    -- Create the user
    INSERT INTO public.users (firstname, lastname, email, password_hash, role, is_active)
    VALUES (
        v_invite.firstname,
        v_invite.lastname,
        v_invite.email,
        p_new_password,
        'admin',
        true
    )
    RETURNING id, email INTO v_user_id, user_email;
    
    -- Delete the invite
    DELETE FROM public.pending_invites WHERE token = p_token;
    
    -- Return the user info
    user_id := v_user_id;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION TO CREATE INVITE (by superadmin)
-- ============================================
CREATE OR REPLACE FUNCTION create_admin_invite(
    p_firstname TEXT,
    p_lastname TEXT,
    p_email TEXT,
    p_created_by UUID
)
RETURNS TABLE(invite_token TEXT, temp_password TEXT) AS $$
DECLARE
    v_token TEXT;
    v_temp_password TEXT;
BEGIN
    -- Generate random token and password
    v_token := encode(gen_random_bytes(32), 'hex');
    v_temp_password := substring(md5(random()::text) from 1 for 10);
    
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM public.users WHERE email = p_email) THEN
        RAISE EXCEPTION 'User with this email already exists';
    END IF;
    
    -- Delete any existing invite for this email
    DELETE FROM public.pending_invites WHERE email = p_email;
    
    -- Create the invite
    INSERT INTO public.pending_invites (email, firstname, lastname, temp_password, token, expires_at, created_by)
    VALUES (p_email, p_firstname, p_lastname, v_temp_password, v_token, NOW() + INTERVAL '7 days', p_created_by)
    RETURNING token, temp_password INTO v_token, v_temp_password;
    
    invite_token := v_token;
    temp_password := v_temp_password;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEEDER: INSERT SUPERADMIN USER
-- ============================================
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
            'password',
            'superadmin',
            true
        );
    END IF;
END $$;



-- ============================================
-- VERIFY SEEDER
-- ============================================
SELECT id, firstname, lastname, email, role, is_active, created_at 
FROM public.users 
WHERE email = 'admin@occ.edu';

SELECT id, name, acronym, color, total_books, total_ebooks, is_active 
FROM public.programs 
ORDER BY created_at;

-- ============================================
-- DISABLE RLS TEMPORARILY FOR DEVELOPMENT
-- ============================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs DISABLE ROW LEVEL SECURITY;

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
END $$;