
import React from 'react';
import { Download, FileText, File } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Note } from '@/types/Note';
import { useToast } from '@/hooks/use-toast';

interface DownloadModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ note, isOpen, onClose }) => {
  const { toast } = useToast();

  const downloadAsText = () => {
    const content = `${note.title}\n\n${note.content}\n\n---\nCriado em: ${new Date(note.created_at).toLocaleString('pt-BR')}\nCriado com Notas JK por Mário Augusto`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download concluído",
      description: "Arquivo de texto baixado com sucesso.",
    });
  };

  const downloadAsHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${note.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: ${note.color}; border-bottom: 2px solid ${note.color}; padding-bottom: 10px; }
        .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
        .content { white-space: pre-wrap; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.8em; }
        img { max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>${note.title}</h1>
    <div class="meta">
        Criado em: ${new Date(note.created_at).toLocaleString('pt-BR')}<br>
        ${note.updated_at.getTime() !== note.created_at.getTime() ? 
          `Última edição: ${new Date(note.updated_at).toLocaleString('pt-BR')}` : ''}
    </div>
    ${note.cover_image_url ? `<img src="${note.cover_image_url}" alt="Capa da nota" />` : ''}
    <div class="content">${note.content}</div>
    <div class="footer">
        Criado com Notas JK por Mário Augusto
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download concluído",
      description: "Arquivo HTML baixado com sucesso.",
    });
  };

  const downloadAsPDF = () => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Erro",
        description: "Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desabilitado.",
        variant: "destructive",
      });
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${note.title}</title>
    <style>
        @media print {
            body { margin: 0; padding: 20px; }
            @page { margin: 1in; }
        }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h1 { color: ${note.color}; border-bottom: 2px solid ${note.color}; padding-bottom: 10px; margin-bottom: 20px; }
        .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
        .content { white-space: pre-wrap; margin-bottom: 40px; }
        .footer { border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 0.8em; }
        img { max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>${note.title}</h1>
    <div class="meta">
        Criado em: ${new Date(note.created_at).toLocaleString('pt-BR')}<br>
        ${note.updated_at.getTime() !== note.created_at.getTime() ? 
          `Última edição: ${new Date(note.updated_at).toLocaleString('pt-BR')}` : ''}
    </div>
    ${note.cover_image_url ? `<img src="${note.cover_image_url}" alt="Capa da nota" />` : ''}
    <div class="content">${note.content}</div>
    <div class="footer">
        Criado com Notas JK por Mário Augusto
    </div>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aguardar o carregamento e então mostrar o diálogo de impressão
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        toast({
          title: "Exportando para PDF",
          description: "Use a opção 'Salvar como PDF' na janela de impressão.",
        });
      }, 500);
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Baixar Nota
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Baixe "{note.title}" em diferentes formatos:
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={downloadAsText}
              className="w-full flex items-center gap-3 h-12 justify-start"
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Arquivo de Texto (.txt)</div>
                <div className="text-xs text-muted-foreground">Formato simples, compatível com qualquer editor</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={downloadAsHTML}
              className="w-full flex items-center gap-3 h-12 justify-start"
            >
              <File className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Documento Web (.html)</div>
                <div className="text-xs text-muted-foreground">Mantém formatação e imagens</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={downloadAsPDF}
              className="w-full flex items-center gap-3 h-12 justify-start"
            >
              <FileText className="h-5 w-5 text-red-500" />
              <div className="text-left">
                <div className="font-medium">PDF</div>
                <div className="text-xs text-muted-foreground">Abre janela de impressão para salvar como PDF</div>
              </div>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
            <strong>Dica:</strong> Para o formato PDF, selecione "Salvar como PDF" como impressora na janela que será aberta.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadModal;
