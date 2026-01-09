import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from '@repo/ui/components/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '@repo/ui/components/spinner';
import { useRequest } from 'ahooks';
import commonApi from '@/api/common';
import { toast } from 'sonner';
import React, { useEffect, useState } from 'react';
import { Switch } from '@repo/ui/components/switch';

const SaveSysCategory = ({
  getCategories,
  renderTrigger,
  type = 'create',
  id,
}: {
  getCategories: () => void;
  type?: 'create' | 'update';
  id?: number;
  renderTrigger: React.ReactNode;
}) => {
  const [openDialog, setOpenDialog] = useState(false);

  const createOrUpdate = () => {
    return type === 'create'
      ? commonApi.createCategory(form.getValues())
      : commonApi.updateCategory(form.getValues(), id!.toString());
  };

  const { loading, run: onSubmit } = useRequest(() => createOrUpdate(), {
    manual: true,
    onSuccess: () => {
      toast.success(type === 'create' ? '创建成功' : '更新成功');
      setOpenDialog(false);
      getCategories();
      form.reset()
    },
  });

  const FormSchema = z.object({
    name: z.string().min(1, {
      message: '分类名称不能为空',
    }),
    value: z.string().min(1, {
      message: '分类值不能为空',
    }),
    module_name: z.string().min(1, {
      message: '模块名称不能为空',
    }),
    module_id: z.string().min(1, {
      message: '模块ID不能为空',
    }),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
    sort: z.number().optional(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      value: '',
      module_name: '',
      module_id: '',
      description: '',
      is_active: true,
      sort: 0,
    },
  });

  const { runAsync: getCategoryById } = useRequest(() => commonApi.getCategoryById(id!), {
    manual: true,
    onSuccess: (data) => {
      form.reset({
        name: data.name,
        value: data.value,
        description: data.description,
        module_name: data.module_name,
        module_id: data.module_id.toString(),
        is_active: data.is_active,
        sort: data.sort,
      });
    },
  });

  useEffect(() => {
    if (type === 'update' && openDialog) {
      getCategoryById();
    }
  }, [openDialog]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{renderTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{`${type === 'create' ? '创建' : '编辑'}`}分类</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      分类名称<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="请输入分类名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      分类值<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="请输入分类值" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="module_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      模块名称<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="请输入模块名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="module_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      模块ID<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="请输入模块ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分类描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="分类描述" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center">
                <FormField
                  control={form.control}
                  name="sort"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>排序</FormLabel>
                      <FormControl>
                        <Input
                          className="w-[200px]"
                          type="number"
                          placeholder="排序"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>是否启用</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" size="sm">
                  取消
                </Button>
              </DialogClose>
              <Button type="submit" size="sm">
                {loading && <Spinner />}
                保存
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSysCategory;
