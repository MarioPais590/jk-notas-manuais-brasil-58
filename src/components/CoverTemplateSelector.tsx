
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { COVER_TEMPLATES, CoverTemplate } from '@/constants/coverTemplates';
import ImageWithFallback from './ImageWithFallback';

interface CoverTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CoverTemplate) => void;
}

const CoverTemplateSelector: React.FC<CoverTemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const handleTemplateSelect = (template: CoverTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]" aria-describedby="template-selector-description">
        <DialogHeader>
          <DialogTitle>Escolher Modelo de Capa</DialogTitle>
          <DialogDescription id="template-selector-description">
            Selecione um modelo de capa para sua nota
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-full max-h-[50vh]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {COVER_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="group cursor-pointer"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="relative overflow-hidden rounded-lg border-2 border-transparent group-hover:border-primary transition-all duration-200">
                  <div className="aspect-[17/7] bg-muted">
                    <ImageWithFallback
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      fallbackText={template.name}
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button size="sm" variant="secondary">
                        Selecionar
                      </Button>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-center mt-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  {template.name}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoverTemplateSelector;
