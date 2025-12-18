import {
  Select as ShaSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { cn } from '@repo/ui/lib/utils';
import Empty from './Empty';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  allowClear?: boolean;
  options: {
    value: string;
    label: string;
  }[];
  className?: string;
  placeholder: string;
  disabled?: boolean
}

const Select = ({
  value,
  onChange,
  allowClear,
  options,
  className,
  placeholder,
  disabled = false,
  ...props
}: SelectProps) => {
  return (
    <ShaSelect value={value} onValueChange={(value) => onChange(value)} {...props}>
      <SelectTrigger
        className={cn('h-[32px] group justify-between', className)}
        style={{ height: 32 }}
        allowClear={allowClear}
        onClear={() => onChange('')}
        disabled={disabled}
        {...props}
      >
        <div className="flex items-center gap-2 justify-between flex-1 relative">
          <SelectValue placeholder={placeholder}>
            {value ? (options.find((item) => item.value === value)?.label || value + '%') : undefined}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.length > 0 ? options.map((item) => {
            return (
              <SelectItem key={item.value} value={item.value}>
                {item.label} 
              </SelectItem>
            );
          }) : <Empty />}
        </SelectGroup>
      </SelectContent>
    </ShaSelect>
  );
};

export default Select;
