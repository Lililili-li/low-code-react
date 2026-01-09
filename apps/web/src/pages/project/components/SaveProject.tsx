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
import projectApi from '@/api/project';
import { toast } from 'sonner';
import React, { useEffect, useState } from 'react';
import Select from '@/components/Select';
import commonApi from '@/api/common';

const SaveProject = ({
  getProjects,
  renderTrigger,
  type = 'create',
  id,
}: {
  getProjects: () => void;
  type?: 'create' | 'update';
  id?: number;
  renderTrigger: React.ReactNode;
}) => {
  const { data: industries } = useRequest(() => commonApi.getCategoryByModuleId('industry'));

  const [openDialog, setOpenDialog] = useState(false);

  const createOrUpdate = () => {
    return type === 'create'
      ? projectApi.createProject(form.getValues())
      : projectApi.updateProject(form.getValues(), id!);
  };

  const { loading, run: onSubmit } = useRequest(() => createOrUpdate(), {
    manual: true,
    onSuccess: () => {
      toast.success('创建成功');
      setOpenDialog(false);
      getProjects();
    },
  });

  const FormSchema = z.object({
    name: z.string().min(1, {
      message: '项目名称不能为空',
    }),
    description: z.string(),
    industry_id: z.string().min(1, {
      message: '行业不能为空',
    }),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      description: '',
      industry_id: '',
    },
  });

  const { runAsync: getProjectById } = useRequest(() => projectApi.getProjectById(id!), {
    manual: true,
    onSuccess: (data) => {
      form.reset({
        name: data.name,
        description: data.description,
        industry_id: data.industry_id.toString(),
      });
    },
  });

  useEffect(() => {
    if (type === 'update' && openDialog) {
      getProjectById();
    }
  }, [openDialog]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{renderTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{`${type === 'create' ? '创建' : '编辑'}`}项目</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      项目名称<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="请输入项目名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industry_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      项目行业<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        options={
                          industries?.map((item) => ({
                            value: item.id.toString(),
                            label: item.name,
                          }))!
                        }
                        placeholder="请选择行业"
                        className="w-full"
                      />
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
                    <FormLabel>项目描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="项目描述" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export default SaveProject;
