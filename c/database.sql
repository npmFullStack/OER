-- ============================================
-- COMPLETE DATABASE SETUP FOR OCC eLIBRARY
-- WITH PROGRAMS AND STUDENT RESEARCH MANAGEMENT
-- UPDATED VERSION
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- DROP EXISTING TABLES (if they exist)
-- ============================================
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.student_research CASCADE;
DROP TABLE IF EXISTS public.student_research_category CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
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
-- CREATE STUDENT RESEARCH CATEGORY TABLE
-- ============================================
CREATE TABLE public.student_research_category (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- ============================================
-- CREATE STUDENT RESEARCH TABLE
-- ============================================
CREATE TABLE public.student_research (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    authors TEXT[] NOT NULL DEFAULT '{}',
    category_id UUID NOT NULL REFERENCES public.student_research_category(id) ON DELETE RESTRICT,
    year INTEGER NOT NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size VARCHAR(50),
    file_storage_path TEXT,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    cover_url TEXT,
    abstract TEXT,
    keywords TEXT[] DEFAULT '{}',
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
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
    color VARCHAR(7) DEFAULT '#3b82f6',
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
-- CREATE INDEXES
-- ============================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(token);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX idx_programs_name ON public.programs(name);
CREATE INDEX idx_programs_acronym ON public.programs(acronym);
CREATE INDEX idx_programs_is_active ON public.programs(is_active);

-- Indexes for student research
CREATE INDEX idx_student_research_title ON public.student_research(title);
CREATE INDEX idx_student_research_category_id ON public.student_research(category_id);
CREATE INDEX idx_student_research_year ON public.student_research(year);
CREATE INDEX idx_student_research_status ON public.student_research(status);
CREATE INDEX idx_student_research_created_at ON public.student_research(created_at);
CREATE INDEX idx_student_research_views ON public.student_research(views);
CREATE INDEX idx_student_research_downloads ON public.student_research(downloads);

-- Indexes for student research category
CREATE INDEX idx_student_research_category_name ON public.student_research_category(name);
CREATE INDEX idx_student_research_category_is_active ON public.student_research_category(is_active);

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
-- CREATE TRIGGERS
-- ============================================
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON public.programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_research_updated_at
    BEFORE UPDATE ON public.student_research
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_research_category_updated_at
    BEFORE UPDATE ON public.student_research_category
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
-- FUNCTIONS FOR INCREMENTING RESEARCH COUNTERS
-- ============================================

CREATE OR REPLACE FUNCTION increment_research_views(research_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.student_research
    SET views = COALESCE(views, 0) + 1
    WHERE id = research_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_research_downloads(research_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.student_research
    SET downloads = COALESCE(downloads, 0) + 1
    WHERE id = research_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEEDER: INSERT DEFAULT CATEGORIES
-- ============================================
INSERT INTO public.student_research_category (name, description, color, display_order) VALUES
('CAPSTONE', 'Capstone projects integrating multiple disciplines', '#dc2626', 1),
('BUSINESS RESEARCH', 'Research focused on business and management', '#10b981', 2),
('FEASIBILITY STUDY', 'Studies analyzing project viability', '#eab308', 3),
('ACTION RESEARCH', 'Research aimed at solving practical problems', '#3b82f6', 4),
('EXPERIMENTAL THESIS', 'Thesis involving experimental methodologies', '#8b5cf6', 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEEDER: INSERT SUPERADMIN USER
-- ============================================
DO $$
DECLARE
    hashed_pw TEXT;
BEGIN
    -- Manually hash the password using pgcrypto
    hashed_pw := crypt('password', gen_salt('bf'));
    
    IF EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@occ.edu') THEN
        -- Update existing superadmin with properly hashed password
        UPDATE public.users 
        SET 
            password_hash = hashed_pw,
            firstname = 'OCCLIB',
            lastname = 'ADMIN',
            role = 'superadmin',
            is_active = true,
            updated_at = NOW()
        WHERE email = 'admin@occ.edu';
    ELSE
        -- Insert new superadmin with properly hashed password
        INSERT INTO public.users (firstname, lastname, email, password_hash, role, is_active)
        VALUES (
            'OCCLIB',
            'ADMIN',
            'admin@occ.edu',
            hashed_pw,
            'superadmin',
            true
        );
    END IF;
END $$;

-- ============================================
-- SEEDER: INSERT DEFAULT PROGRAMS (Optional)
-- ============================================
INSERT INTO public.programs (name, acronym, color, total_books, total_ebooks, is_active) VALUES
('Computer Science', 'CS', '#3b82f6', 0, 0, true),
('Information Technology', 'IT', '#10b981', 0, 0, true),
('Business Administration', 'BA', '#f59e0b', 0, 0, true),
('Accountancy', 'ACT', '#ef4444', 0, 0, true),
('Education', 'ED', '#8b5cf6', 0, 0, true)
ON CONFLICT (acronym) DO NOTHING;

-- ============================================
-- VERIFY SEEDER (Check if everything was created correctly)
-- ============================================

DO $$
DECLARE
    user_exists BOOLEAN;
    cat_count INTEGER;
BEGIN
    -- Check users table
    SELECT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@occ.edu') INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE '✓ Superadmin user created successfully';
    ELSE
        RAISE NOTICE '✗ Superadmin user creation failed';
    END IF;
    
    -- Check categories count
    SELECT COUNT(*) INTO cat_count FROM public.student_research_category;
    RAISE NOTICE '✓ % student research categories created', cat_count;
    
    -- Test password verification (should return true)
    IF verify_password('admin@occ.edu', 'password') THEN
        RAISE NOTICE '✓ Password verification working correctly';
    ELSE
        RAISE NOTICE '✗ Password verification failed';
    END IF;
END $$;

-- ============================================
-- DISABLE RLS TEMPORARILY FOR DEVELOPMENT
-- ============================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_research DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_research_category DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETE!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Superadmin credentials:';
    RAISE NOTICE '  Email: admin@occ.edu';
    RAISE NOTICE '  Password: password';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Student Research Categories Added:';
    RAISE NOTICE '  - CAPSTONE';
    RAISE NOTICE '  - BUSINESS RESEARCH';
    RAISE NOTICE '  - FEASIBILITY STUDY';
    RAISE NOTICE '  - ACTION RESEARCH';
    RAISE NOTICE '  - EXPERIMENTAL THESIS';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Default Programs Added:';
    RAISE NOTICE '  - Computer Science (CS)';
    RAISE NOTICE '  - Information Technology (IT)';
    RAISE NOTICE '  - Business Administration (BA)';
    RAISE NOTICE '  - Accountancy (ACT)';
    RAISE NOTICE '  - Education (ED)';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create a storage bucket called "research-files" in Supabase Storage';
    RAISE NOTICE '2. Set the bucket to public or configure appropriate permissions';
    RAISE NOTICE '3. Your system is ready to use!';
    RAISE NOTICE '==========================================';
END $$;