
import React from 'react';
import { Palette } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
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
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenChange(!isOpen);
          }}
        >
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-48 p-3 z-50" 
        align="start"
        side="right"
        sideOffset={5}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="grid grid-cols-4 gap-2">
          {NOTE_COLORS.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ backgroundColor: color }}
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
