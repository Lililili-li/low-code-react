import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/components/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { Button } from '@repo/ui/components/button';
import MonacoEditor from '@repo/ui/components/monaco-editor';
import { SheetClose } from '@repo/ui/components/sheet';
import { Fullscreen } from 'lucide-react';
import { ChartPropsSchema } from '../bar-vertical/schema';

interface OptionProps {
  schema?: ChartPropsSchema;
  updateSchema?: (updates: Partial<ChartPropsSchema>) => void;
}
const OptionProps = ({ schema, updateSchema }: OptionProps) => {
  const { props } = schema || {};

  const option = props?.option || {};
  let cloneOption = JSON.parse(JSON.stringify(option));
  return (
    <>
      <div className="extend absolute top-1 right-1 z-40">
        <Sheet>
          <Tooltip>
            <SheetTrigger asChild>
              <TooltipTrigger asChild>
                <Button size="sm" variant="link" className="p-0 h-auto">
                  <Fullscreen className="size-4 text-gray-100" />
                </Button>
              </TooltipTrigger>
            </SheetTrigger>
            <TooltipContent>放大</TooltipContent>
          </Tooltip>
          <SheetContent style={{ maxWidth: '700px' }}>
            <SheetHeader>
              <SheetTitle>自定义配置</SheetTitle>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-6 px-4">
              <MonacoEditor
                value={JSON.stringify(cloneOption, null, 2)}
                onChange={(value) => {
                  cloneOption = { ...cloneOption, ...JSON.parse(value) };
                }}
                language="json"
                height={'700px'}
                wordWrap="off"
              />
            </div>
            <SheetFooter className="flex flex-row justify-end">
              <SheetClose asChild>
                <Button
                  type="submit"
                  size="sm"
                  onClick={() => {
                    updateSchema?.({
                      ...schema,
                      props: {
                        ...schema?.props,
                        option: { ...option, ...cloneOption },
                      },
                    });
                  }}
                >
                  保存
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="outline" size="sm">
                  取消
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <MonacoEditor
        value={JSON.stringify(option, null, 2)}
        onChange={(value) => {
          const customOption = JSON.parse(value);
          updateSchema?.({
            ...schema,
            props: {
              ...schema?.props,
              option: customOption,
            },
          });
        }}
        language="json"
        height={'600px'}
        wordWrap="off"
      />
    </>
  );
};

export default OptionProps;
