
-- Criar bucket para templates de capa
INSERT INTO storage.buckets (id, name, public)
VALUES ('templates-covers', 'templates-covers', true);

-- Criar política para permitir leitura pública dos templates
CREATE POLICY "Templates são públicos para leitura" ON storage.objects
FOR SELECT USING (bucket_id = 'templates-covers');

-- Criar política para permitir upload de templates (apenas autenticados)
CREATE POLICY "Usuários autenticados podem fazer upload de templates" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'templates-covers' AND 
  auth.uid() IS NOT NULL
);
