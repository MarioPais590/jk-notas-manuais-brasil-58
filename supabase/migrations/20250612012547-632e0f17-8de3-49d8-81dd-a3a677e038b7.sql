
-- Primeiro, vamos verificar e corrigir a função de auditoria
-- que está causando o erro ao fixar notas

-- Corrigir a função create_note_audit_log para usar o tipo correto
CREATE OR REPLACE FUNCTION public.create_note_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.note_audit_log (note_id, user_id, event_type, new_values)
    VALUES (NEW.id, NEW.user_id, 'created'::audit_event_type, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detectar tipo específico de atualização
    IF OLD.is_pinned != NEW.is_pinned THEN
      INSERT INTO public.note_audit_log (note_id, user_id, event_type, old_values, new_values)
      VALUES (NEW.id, NEW.user_id, 
              CASE WHEN NEW.is_pinned THEN 'pinned'::audit_event_type ELSE 'unpinned'::audit_event_type END,
              to_jsonb(OLD), to_jsonb(NEW));
    ELSIF OLD.color != NEW.color THEN
      INSERT INTO public.note_audit_log (note_id, user_id, event_type, old_values, new_values)
      VALUES (NEW.id, NEW.user_id, 'color_changed'::audit_event_type, to_jsonb(OLD), to_jsonb(NEW));
    ELSE
      INSERT INTO public.note_audit_log (note_id, user_id, event_type, old_values, new_values)
      VALUES (NEW.id, NEW.user_id, 'updated'::audit_event_type, to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Inserir o log de auditoria ANTES da exclusão da nota
    INSERT INTO public.note_audit_log (note_id, user_id, event_type, old_values)
    VALUES (OLD.id, OLD.user_id, 'deleted'::audit_event_type, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Criar o trigger para a tabela notes se não existir
DROP TRIGGER IF EXISTS notes_audit_trigger ON public.notes;
CREATE TRIGGER notes_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.create_note_audit_log();

-- Adicionar políticas RLS para a tabela notes se não existirem
DO $$
BEGIN
  -- Verificar se as políticas já existem antes de criar
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Users can view their own notes') THEN
    CREATE POLICY "Users can view their own notes" ON public.notes
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Users can create their own notes') THEN
    CREATE POLICY "Users can create their own notes" ON public.notes
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Users can update their own notes') THEN
    CREATE POLICY "Users can update their own notes" ON public.notes
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Users can delete their own notes') THEN
    CREATE POLICY "Users can delete their own notes" ON public.notes
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ativar RLS na tabela notes se não estiver ativo
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
