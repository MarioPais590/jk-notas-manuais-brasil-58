
import React from 'react';
import { Share2, MessageCircle, Send, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Note } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ note, isOpen, onClose }) => {
  const { toast } = useToast();

  const shareText = `*${note.title}*\n\n${note.content}\n\n---\nCriado com Notas JK por Mário Augusto`;

  const shareViaWhatsApp = () => {
    const encodedText = encodeURIComponent(shareText);
    const url = `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
    toast({
      title: "Compartilhando via WhatsApp",
      description: "Abrindo WhatsApp para compartilhar a nota.",
    });
  };

  const shareViaTelegram = () => {
    const encodedText = encodeURIComponent(shareText);
    const url = `https://t.me/share/url?text=${encodedText}`;
    window.open(url, '_blank');
    toast({
      title: "Compartilhando via Telegram",
      description: "Abrindo Telegram para compartilhar a nota.",
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Nota: ${note.title}`);
    const body = encodeURIComponent(shareText);
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.open(url);
    toast({
      title: "Compartilhando via E-mail",
      description: "Abrindo cliente de e-mail para compartilhar a nota.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "Copiado!",
        description: "Texto da nota copiado para a área de transferência.",
      });
    }).catch(() => {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Nota
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Compartilhe "{note.title}" através de:
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={shareViaWhatsApp}
              className="flex items-center gap-2 h-12"
            >
              <MessageCircle className="h-5 w-5 text-green-600" />
              WhatsApp
            </Button>

            <Button
              variant="outline"
              onClick={shareViaTelegram}
              className="flex items-center gap-2 h-12"
            >
              <Send className="h-5 w-5 text-blue-500" />
              Telegram
            </Button>

            <Button
              variant="outline"
              onClick={shareViaEmail}
              className="flex items-center gap-2 h-12"
            >
              <Mail className="h-5 w-5 text-red-500" />
              E-mail
            </Button>

            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex items-center gap-2 h-12"
            >
              <Share2 className="h-5 w-5" />
              Copiar Texto
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-2">Prévia do compartilhamento:</div>
            <div className="text-sm max-h-32 overflow-y-auto whitespace-pre-wrap">
              {shareText}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
