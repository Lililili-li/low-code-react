import {
  Select as ShaSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { cn } from '@repo/ui/lib/utils';

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
}

const Select = ({
  value,
  onChange,
  allowClear,
  options,
  className,
  placeholder,
  ...props
}: SelectProps) => {
  return (
    <ShaSelect value={value} onValueChange={(value) => onChange(value)} {...props}>
      <SelectTrigger
        className={cn('h-[32px] group justify-between', className)}
        style={{ height: 32 }}
        allowClear={allowClear}
        onClear={() => onChange('')}
        {...props}
      >
        <div className="flex items-center gap-2 justify-between flex-1 relative">
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((item) => {
            return (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </ShaSelect>
  );
};

export default Select;
