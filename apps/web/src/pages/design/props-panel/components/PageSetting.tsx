import CodeMirror from '@/components/CodeMirror';
import { PageSchema } from '@repo/core/types';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@repo/ui/components/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { HelpCircle, Settings } from 'lucide-react';

const PageSetting = ({ pageSchema, setPageSchema }: { pageSchema: PageSchema; setPageSchema: any }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" className="w-full">
          <Settings className="size-4" />
          <span>更多配置</span>
        </Button>
      </SheetTrigger>
      <SheetContent style={{ maxWidth: '450px' }} className="dark:bg-[#18181b] gap-0">
        <SheetHeader>
          <SheetTitle>更多配置</SheetTitle>
        </SheetHeader>
        <div className="setting-content h-full p-4 pt-0 flex flex-col gap-4">
          <div className="host">
            <Label>
              <span>请求地址</span>
            </Label>
            <Input placeholder="请输入页面请求地址" className="mt-4" />
          </div>
          <div className="host">
            <Label className="mb-4">
              <span>全局请求头</span>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>用法示例：</span>
                  <pre className="my-2">
                    {JSON.stringify(
                      {
                        'Content-Type': 'application/json',
                      },
                      null,
                      2,
                    )}
                  </pre>
                </TooltipContent>
              </Tooltip>
            </Label>
            <CodeMirror value={pageSchema.globalHeaders} onChange={(value) => setPageSchema({ ...pageSchema, globalHeaders: value })} language="javascript" />
          </div>
          <div className="host">
            <Label className="mb-4">
              <span>全局CSS样式</span>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  <span>用法示例：</span>
                  <pre className="my-2">{`body { \n color: #fff; \n}`}</pre>
                </TooltipContent>
              </Tooltip>
            </Label>
            <CodeMirror value={pageSchema.globalCss} onChange={(value) => setPageSchema({ ...pageSchema, globalCss: value })} language="css" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">保存配置</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PageSetting;
