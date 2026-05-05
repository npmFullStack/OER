-- ============================================
-- COMPLETE DATABASE SETUP FOR OCC eLIBRARY
-- WITH PROGRAMS, EBOOKS, AND STUDENT RESEARCH
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- DROP EXISTING TABLES (in dependency order)
-- ============================================
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE;
DROP TABLE IF EXISTS public.ebooks CASCADE;
DROP TABLE IF EXISTS public.student_research CASCADE;
DROP TABLE IF EXISTS public.student_research_category CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- USERS TABLE
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
-- PROGRAMS TABLE
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
-- EBOOKS TABLE
-- ============================================
CREATE TABLE public.ebooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE RESTRICT,
    year_level VARCHAR(10) NOT NULL CHECK (year_level IN ('1', '2', '3', '4')),
    file_name VARCHAR(255) NOT NULL,
    file_size VARCHAR(50),
    file_url TEXT NOT NULL,
    file_storage_path TEXT NOT NULL,
    cover_url TEXT,
    cover_storage_path TEXT,
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STUDENT RESEARCH CATEGORY TABLE
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
-- STUDENT RESEARCH TABLE
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
-- USER SESSIONS TABLE
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
-- ACTIVITY LOGS TABLE
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
-- INDEXES
-- ============================================

-- Users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Sessions & Logs
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(token);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Programs
CREATE INDEX idx_programs_name ON public.programs(name);
CREATE INDEX idx_programs_acronym ON public.programs(acronym);
CREATE INDEX idx_programs_is_active ON public.programs(is_active);

-- Ebooks
CREATE INDEX idx_ebooks_title ON public.ebooks(title);
CREATE INDEX idx_ebooks_program_id ON public.ebooks(program_id);
CREATE INDEX idx_ebooks_year_level ON public.ebooks(year_level);
CREATE INDEX idx_ebooks_status ON public.ebooks(status);
CREATE INDEX idx_ebooks_created_at ON public.ebooks(created_at);
CREATE INDEX idx_ebooks_downloads ON public.ebooks(downloads);
CREATE INDEX idx_ebooks_views ON public.ebooks(views);

-- Student Research
CREATE INDEX idx_student_research_title ON public.student_research(title);
CREATE INDEX idx_student_research_category_id ON public.student_research(category_id);
CREATE INDEX idx_student_research_year ON public.student_research(year);
CREATE INDEX idx_student_research_status ON public.student_research(status);
CREATE INDEX idx_student_research_created_at ON public.student_research(created_at);
CREATE INDEX idx_student_research_views ON public.student_research(views);
CREATE INDEX idx_student_research_downloads ON public.student_research(downloads);

-- Student Research Category
CREATE INDEX idx_student_research_category_name ON public.student_research_category(name);
CREATE INDEX idx_student_research_category_is_active ON public.student_research_category(is_active);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
    BEFORE UPDATE ON public.programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebooks_updated_at
    BEFORE UPDATE ON public.ebooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_research_updated_at
    BEFORE UPDATE ON public.student_research
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_research_category_updated_at
    BEFORE UPDATE ON public.student_research_category
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PASSWORD HASHING AND VERIFICATION
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

CREATE OR REPLACE FUNCTION hash_password_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.password_hash IS NOT NULL
       AND NEW.password_hash NOT LIKE '$2a$%'
       AND NEW.password_hash NOT LIKE '$2b$%' THEN
        NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hash_password_on_insert ON public.users;
CREATE TRIGGER hash_password_on_insert
    BEFORE INSERT OR UPDATE OF password_hash ON public.users
    FOR EACH ROW EXECUTE FUNCTION hash_password_trigger();

-- ============================================
-- EBOOK COUNTER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION increment_ebook_views(ebook_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.ebooks
    SET views = COALESCE(views, 0) + 1
    WHERE id = ebook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_ebook_downloads(ebook_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.ebooks
    SET downloads = COALESCE(downloads, 0) + 1
    WHERE id = ebook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STUDENT RESEARCH COUNTER FUNCTIONS
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
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ebook-files', 'ebook-files', true, 52428800, ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ebook-covers', 'ebook-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('research-files', 'research-files', true, 52428800, ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Public can view ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their ebook uploads" ON storage.objects;
DROP POLICY IF EXISTS "Superadmins can delete ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view research files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload research files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Superadmins can delete research files" ON storage.objects;

CREATE POLICY "Public can view ebook files"
ON storage.objects FOR SELECT
USING (bucket_id IN ('ebook-files', 'ebook-covers'));

CREATE POLICY "Public can view research files"
ON storage.objects FOR SELECT
USING (bucket_id = 'research-files');

CREATE POLICY "Authenticated users can upload ebook files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('ebook-files', 'ebook-covers'));

CREATE POLICY "Authenticated users can upload research files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'research-files');

CREATE POLICY "Users can update their ebook uploads"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('ebook-files', 'ebook-covers'));

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'research-files');

CREATE POLICY "Superadmins can delete ebook files"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id IN ('ebook-files', 'ebook-covers')
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()::uuid AND role = 'superadmin'
    )
);

CREATE POLICY "Superadmins can delete research files"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'research-files'
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()::uuid AND role = 'superadmin'
    )
);

-- ============================================
-- DISABLE RLS FOR DEVELOPMENT
-- ============================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_research DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_research_category DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SEEDER: SUPERADMIN USER
-- ============================================
DO $$
DECLARE
    hashed_pw TEXT;
BEGIN
    hashed_pw := crypt('password', gen_salt('bf'));
    IF EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@occ.edu') THEN
        UPDATE public.users SET
            password_hash = hashed_pw,
            firstname = 'OCCLIB',
            lastname = 'ADMIN',
            role = 'superadmin',
            is_active = true,
            updated_at = NOW()
        WHERE email = 'admin@occ.edu';
    ELSE
        INSERT INTO public.users (firstname, lastname, email, password_hash, role, is_active)
        VALUES ('OCCLIB', 'ADMIN', 'admin@occ.edu', hashed_pw, 'superadmin', true);
    END IF;
END $$;

-- ============================================
-- SEEDER: DEFAULT STUDENT RESEARCH CATEGORIES
-- ============================================
INSERT INTO public.student_research_category (name, description, color, display_order) VALUES
('CAPSTONE',            'Capstone projects integrating multiple disciplines', '#dc2626', 1),
('BUSINESS RESEARCH',   'Research focused on business and management',        '#10b981', 2),
('FEASIBILITY STUDY',   'Studies analyzing project viability',                '#eab308', 3),
('ACTION RESEARCH',     'Research aimed at solving practical problems',       '#3b82f6', 4),
('EXPERIMENTAL THESIS', 'Thesis involving experimental methodologies',        '#8b5cf6', 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFY SETUP
-- ============================================
DO $$
DECLARE
    user_exists     BOOLEAN;
    cat_count       INTEGER;
    ebook_bucket    BOOLEAN;
    cover_bucket    BOOLEAN;
    research_bucket BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@occ.edu') INTO user_exists;
    IF user_exists THEN RAISE NOTICE '✓ Superadmin user created successfully';
    ELSE RAISE NOTICE '✗ Superadmin user creation failed'; END IF;

    IF verify_password('admin@occ.edu', 'password') THEN RAISE NOTICE '✓ Password verification working correctly';
    ELSE RAISE NOTICE '✗ Password verification failed'; END IF;

    SELECT COUNT(*) INTO cat_count FROM public.student_research_category;
    RAISE NOTICE '✓ % student research categories created', cat_count;

    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ebook-files')    INTO ebook_bucket;
    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ebook-covers')   INTO cover_bucket;
    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'research-files') INTO research_bucket;

    IF ebook_bucket    THEN RAISE NOTICE '✓ Bucket "ebook-files" ready';    ELSE RAISE NOTICE '✗ Bucket "ebook-files" failed';    END IF;
    IF cover_bucket    THEN RAISE NOTICE '✓ Bucket "ebook-covers" ready';   ELSE RAISE NOTICE '✗ Bucket "ebook-covers" failed';   END IF;
    IF research_bucket THEN RAISE NOTICE '✓ Bucket "research-files" ready'; ELSE RAISE NOTICE '✗ Bucket "research-files" failed'; END IF;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETE!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Superadmin credentials:';
    RAISE NOTICE '  Email:    admin@occ.edu';
    RAISE NOTICE '  Password: password';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - users';
    RAISE NOTICE '  - programs';
    RAISE NOTICE '  - ebooks';
    RAISE NOTICE '  - student_research_category';
    RAISE NOTICE '  - student_research';
    RAISE NOTICE '  - user_sessions';
    RAISE NOTICE '  - activity_logs';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Storage buckets:';
    RAISE NOTICE '  - ebook-files    (PDF, 50MB)';
    RAISE NOTICE '  - ebook-covers   (images, 5MB)';
    RAISE NOTICE '  - research-files (PDF, 50MB)';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Student Research Categories:';
    RAISE NOTICE '  - CAPSTONE';
    RAISE NOTICE '  - BUSINESS RESEARCH';
    RAISE NOTICE '  - FEASIBILITY STUDY';
    RAISE NOTICE '  - ACTION RESEARCH';
    RAISE NOTICE '  - EXPERIMENTAL THESIS';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Your system is ready to use!';
    RAISE NOTICE '==========================================';
END $$;