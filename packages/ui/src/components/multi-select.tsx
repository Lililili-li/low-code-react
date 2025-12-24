'use client';

import * as React from 'react';
import { CheckIcon, ChevronDownIcon, X } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { ScrollArea } from './scroll-area';

export interface MultiSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxCount?: number;
  maxDisplay?: number;
  onMaxCountExceeded?: () => void;
}

function MultiSelect({
  options,
  value,
  defaultValue = [],
  onChange,
  placeholder = '请选择',
  className,
  disabled = false,
  maxCount,
  maxDisplay,
  onMaxCountExceeded,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  const handleSelect = (optionValue: string) => {
    let newSelected: string[];
    
    if (selected.includes(optionValue)) {
      newSelected = selected.filter((v) => v !== optionValue);
    } else {
      if (maxCount && selected.length >= maxCount) {
        onMaxCountExceeded?.();
        return;
      }
      newSelected = [...selected, optionValue];
    }
    
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = selected.filter((v) => v !== optionValue);
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected([]);
    onChange?.([]);
  };

  const getSelectedLabels = () => {
    return selected
      .map((v) => options.find((opt) => opt.value === v)?.label)
      .filter(Boolean);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-auto min-h-8 w-full justify-between hover:bg-transparent',
            !selected.length && 'text-muted-foreground',
            className
          )}
          size="sm"
        >
          <div className="flex flex-1 flex-wrap gap-1">
            {selected.length > 0 ? (
              <>
                {selected.slice(0, maxDisplay).map((value) => {
                  const option = options.find((opt) => opt.value === value);
                  return (
                    <span
                      key={value}
                      className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      {option?.label}
                      <X
                        className="size-3 cursor-pointer hover:text-foreground"
                        onClick={(e) => handleRemove(value, e)}
                      />
                    </span>
                  );
                })}
                {maxDisplay && selected.length > maxDisplay && (
                  <span className="inline-flex items-center rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    +{selected.length - maxDisplay}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {selected.length > 0 && (
              <X
                className="size-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <ScrollArea className="max-h-[300px]">
          <div className="p-1">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  className={cn(
                    'relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    option.disabled && 'pointer-events-none opacity-50',
                    isSelected && 'bg-accent/50'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-4 items-center justify-center rounded-sm border border-primary',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <CheckIcon className="size-3" />
                  </div>
                  <span className="flex-1">{option.label}</span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export { MultiSelect };
