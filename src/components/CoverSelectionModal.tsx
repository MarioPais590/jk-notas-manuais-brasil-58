
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Palette } from 'lucide-react';
import CoverTemplateSelector from './CoverTemplateSelector';
import { CoverTemplate } from '@/constants/coverTemplates';

interface CoverSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTemplateSelect: (template: CoverTemplate) => void;
}

const CoverSelectionModal: React.FC<CoverSelectionModalProps> = ({
  isOpen,
  onClose,
  onDeviceUpload,
  onTemplateSelect,
}) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleDeviceUploadClick = () => {
    const input = document.getElementById('cover-selection-upload') as HTMLInputElement;
    input?.click();
    onClose();
  };

  const handleTemplateSelect = (template: CoverTemplate) => {
    onTemplateSelect(template);
    setShowTemplateSelector(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md" aria-describedby="cover-selection-description">
          <DialogHeader>
            <DialogTitle>Adicionar Capa</DialogTitle>
            <DialogDescription id="cover-selection-description">
              Escolha como adicionar uma capa à sua nota
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2"
              onClick={handleDeviceUploadClick}
            >
              <Upload className="h-6 w-6" />
              <span>Escolher do Dispositivo</span>
              <span className="text-xs text-muted-foreground">PNG, JPG, WebP</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2"
              onClick={() => setShowTemplateSelector(true)}
            >
              <Palette className="h-6 w-6" />
              <span>Escolher um Modelo</span>
              <span className="text-xs text-muted-foreground">10 modelos disponíveis</span>
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={onDeviceUpload}
        className="hidden"
        id="cover-selection-upload"
      />

      <CoverTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </>
  );
};

export default CoverSelectionModal;
