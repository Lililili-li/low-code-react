import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion';
import MonacoEditor from '@repo/ui/components/monaco-editor';
import { ReactCodePropsSchema } from './schema';
import { Label } from '@repo/ui/components/label';
import { Button } from '@repo/ui/components/button';
import { Edit } from 'lucide-react';

export interface CodeProps {
  schema: ReactCodePropsSchema;
  updateSchema?: (updates: Partial<ReactCodePropsSchema>) => void;
}

const Props = ({ schema, updateSchema }: CodeProps) => {
  const { props } = schema;
  return (
    <div className="props-panel flex flex-col gap-2 px-2 mt-4">
      <div className='flex items-center gap-2'>
        <Label className='shrink-0 w-[25%]'>
          源代码
        </Label>
        <Button size='sm' className='flex-1'>
          <Edit />
          编辑代码
        </Button>
      </div>
    </div>
  );
};

export default Props;
