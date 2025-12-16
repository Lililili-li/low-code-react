import { useState, useCallback } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover';
import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { Pipette } from 'lucide-react';

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  disabled?: boolean;
  className?: string;
  showInput?: boolean;
  presetColors?: string[];
}

const defaultPresetColors = [
  '#000000',
  '#ffffff',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#96ceb4',
  '#ffeaa7',
  '#dfe6e9',
  '#a29bfe',
  '#fd79a8',
];

const ColorPicker = ({
  value = '#000000',
  onChange,
  disabled = false,
  className,
  showInput = true,
  presetColors = defaultPresetColors,
}: ColorPickerProps) => {
  const [open, setOpen] = useState(false);

  const handleChange = useCallback(
    (color: string) => {
      onChange?.(color);
    },
    [onChange],
  );

  const handlePresetClick = useCallback(
    (color: string) => {
      onChange?.(color);
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start gap-2 font-normal',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          <div
            className="size-5 rounded-sm border border-border shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="flex-1 text-left truncate">{value}</span>
          <Pipette className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex flex-col gap-3">
          <HexColorPicker color={value} onChange={handleChange} />
          {showInput && (
            <div className="flex items-center gap-2 w-[200px]">
              <div
                className="size-8 rounded-md border border-border shrink-0"
                style={{ backgroundColor: value }}
              />
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground text-sm">#</span>
                <HexColorInput
                  color={value}
                  onChange={handleChange}
                  prefixed={false}
                  className="flex-1 w-[150px] h-8 px-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {presetColors.length > 0 && (
            <div className="grid grid-cols-6 gap-1.5 w-[200px]">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'size-6 rounded-sm border border-border cursor-pointer transition-transform hover:scale-110',
                    value.toLowerCase() === color.toLowerCase() &&
                      'ring-2 ring-primary ring-offset-1',
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
