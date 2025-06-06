
import React from 'react';
import { Palette } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { NOTE_COLORS } from '@/constants/noteColors';

interface ColorPickerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onColorSelect: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  isOpen,
  onOpenChange,
  onColorSelect,
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <DropdownMenuItem 
          onSelect={(e) => e.preventDefault()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenChange(!isOpen);
          }}
        >
          <Palette className="h-4 w-4 mr-2" />
          Cor
        </DropdownMenuItem>
      </PopoverTrigger>
      <PopoverContent 
        className="w-48 p-3" 
        align="end"
        side="right"
        sideOffset={5}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          // Só fecha se clicar realmente fora, não em elementos relacionados
          const target = e.target as Element;
          if (!target.closest('[data-radix-popper-content-wrapper]')) {
            onOpenChange(false);
          }
        }}
        onEscapeKeyDown={() => onOpenChange(false)}
        onPointerDownOutside={(e) => {
          const target = e.target as Element;
          if (!target.closest('[data-radix-popper-content-wrapper]')) {
            onOpenChange(false);
          }
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          {NOTE_COLORS.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ backgroundColor: color }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onColorSelect(color);
                onOpenChange(false);
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
