-- ============================================
-- EBOOKS TABLE
-- ============================================
DROP TABLE IF EXISTS public.ebooks CASCADE;

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

-- Create indexes for ebooks
CREATE INDEX idx_ebooks_title ON public.ebooks(title);
CREATE INDEX idx_ebooks_program_id ON public.ebooks(program_id);
CREATE INDEX idx_ebooks_year_level ON public.ebooks(year_level);
CREATE INDEX idx_ebooks_status ON public.ebooks(status);
CREATE INDEX idx_ebooks_created_at ON public.ebooks(created_at);
CREATE INDEX idx_ebooks_downloads ON public.ebooks(downloads);
CREATE INDEX idx_ebooks_views ON public.ebooks(views);

-- Create trigger for ebooks updated_at
CREATE TRIGGER update_ebooks_updated_at
    BEFORE UPDATE ON public.ebooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR INCREMENTING EBOOK COUNTERS
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
-- UPDATE STORAGE BUCKET FOR EBOOKS
-- ============================================

-- Create a separate bucket for ebooks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ebook-files',
    'ebook-files',
    true,  -- public bucket
    52428800,  -- 50MB file size limit
    ARRAY['application/pdf']::text[]  -- Only allow PDF files
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create a bucket for ebook covers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ebook-covers',
    'ebook-covers',
    true,  -- public bucket
    5242880,  -- 5MB file size limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- STORAGE RLS POLICIES FOR EBOOKS
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ebook files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their ebook uploads" ON storage.objects;
DROP POLICY IF EXISTS "Superadmins can delete ebook files" ON storage.objects;

-- Policy 1: Allow public to view/download ebook files
CREATE POLICY "Public can view ebook files"
ON storage.objects FOR SELECT
USING (bucket_id IN ('ebook-files', 'ebook-covers'));

-- Policy 2: Allow authenticated users to upload ebook files
CREATE POLICY "Authenticated users can upload ebook files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('ebook-files', 'ebook-covers'));

-- Policy 3: Allow users to update their own uploads
CREATE POLICY "Users can update their ebook uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('ebook-files', 'ebook-covers'));

-- Policy 4: Allow superadmins to delete ebook files
CREATE POLICY "Superadmins can delete ebook files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id IN ('ebook-files', 'ebook-covers')
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()::uuid
        AND role = 'superadmin'
    )
);

-- ============================================
-- SEEDER: INSERT DEFAULT PROGRAMS (if not exists)
-- ============================================
INSERT INTO public.programs (id, name, acronym, color, total_books, total_ebooks, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Information Technology', 'BSIT', '#ef4444', 0, 0, true),
('22222222-2222-2222-2222-222222222222', 'Financial Management', 'BSBA-FM', '#eab308', 0, 0, true),
('33333333-3333-3333-3333-333333333333', 'Marketing Management', 'BSBA-MM', '#eab308', 0, 0, true),
('44444444-4444-4444-4444-444444444444', 'Secondary Education', 'BSED', '#3b82f6', 0, 0, true),
('55555555-5555-5555-5555-555555555555', 'Elementary Education', 'BEED', '#3b82f6', 0, 0, true),
('66666666-6666-6666-6666-666666666666', 'General Education', 'GEN ED', '#10b981', 0, 0, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    acronym = EXCLUDED.acronym,
    color = EXCLUDED.color;

-- ============================================
-- DISABLE RLS FOR DEVELOPMENT
-- ============================================
ALTER TABLE public.ebooks DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFY EBOOK SETUP
-- ============================================
DO $$
DECLARE
    ebook_bucket_exists BOOLEAN;
    cover_bucket_exists BOOLEAN;
    programs_count INTEGER;
BEGIN
    -- Check ebook bucket
    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ebook-files') INTO ebook_bucket_exists;
    IF ebook_bucket_exists THEN
        RAISE NOTICE '✓ eBook storage bucket "ebook-files" exists';
    ELSE
        RAISE NOTICE '✗ eBook storage bucket creation failed';
    END IF;
    
    -- Check cover bucket
    SELECT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ebook-covers') INTO cover_bucket_exists;
    IF cover_bucket_exists THEN
        RAISE NOTICE '✓ eBook cover bucket "ebook-covers" exists';
    ELSE
        RAISE NOTICE '✗ eBook cover bucket creation failed';
    END IF;
    
    -- Check programs
    SELECT COUNT(*) INTO programs_count FROM public.programs WHERE is_active = true;
    RAISE NOTICE '✓ % active programs available', programs_count;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'EBOOK SYSTEM SETUP COMPLETE!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'eBooks table created with all indexes';
    RAISE NOTICE 'Storage buckets configured for PDFs and covers';
    RAISE NOTICE 'RLS policies applied for security';
    RAISE NOTICE '==========================================';
END $$;