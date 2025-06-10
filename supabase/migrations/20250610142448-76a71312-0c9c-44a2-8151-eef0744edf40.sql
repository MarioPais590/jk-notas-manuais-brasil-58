
-- Criar bucket para attachments de notas (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'note-attachments',
  'note-attachments', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg'];

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Public can view note attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload note attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own note attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own note attachments" ON storage.objects;

-- Política para permitir SELECT públicos (visualização das imagens)
CREATE POLICY "Public can view note attachments" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'note-attachments');

-- Política para permitir INSERT para usuários autenticados
CREATE POLICY "Authenticated users can upload note attachments" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'note-attachments' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir UPDATE para usuários autenticados (seus próprios arquivos)
CREATE POLICY "Users can update their own note attachments" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'note-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
  bucket_id = 'note-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir DELETE para usuários autenticados (seus próprios arquivos)
CREATE POLICY "Users can delete their own note attachments" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'note-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
