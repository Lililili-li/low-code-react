import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useImperativeHandle, useState } from 'react';
import { Button } from '@repo/ui/components/button';

export interface SavePageRef {
  openDialog: () => void;
}

const SavePage = ({ref}: {ref: React.Ref<SavePageRef>}) => {
  const [pageFormVisible, setPageFormVisible] = useState(false);

  const formSchema = z.object({
    name: z.string().min(1, {
      message: '页面名称不能为空',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = () => {
    console.log(123123123);
  };

  const openDialog = () => {
    setPageFormVisible(true);
  };

  useImperativeHandle(ref, () => ({
    openDialog,
  }));

  return (
    <Dialog
      open={pageFormVisible}
      onOpenChange={(value) => {
        setPageFormVisible(value);
        if (!value) form.reset();
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>修改页面信息</DialogTitle>
              <DialogDescription>在此处修改当前页面信息，完成后点击保存。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel><span className='text-red-500'>*</span>页面名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入页面名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  取消
                </Button>
              </DialogClose>
              <Button type="submit" size="sm">
                保存
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SavePage;
