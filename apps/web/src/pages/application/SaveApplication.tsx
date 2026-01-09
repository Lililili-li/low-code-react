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
import applicationApi from '@/api/application';

import { toast } from 'sonner';
import React, { useEffect, useState } from 'react';
import Select from '@/components/Select';
import { useQuery } from '@/composable/use-query';
import { Computer, Fullscreen } from 'lucide-react';

const statusOptions = [
  { value: '1', label: '开发中' },
  { value: '2', label: '测试中' },
  { value: '3', label: '已发布' },
];

const CreateApplication = ({
  getApplications,
  projectOptions,
  renderTrigger,
  type = 'create',
  id,
}: {
  getApplications: () => void;
  type?: 'create' | 'update';
  id?: number;
  renderTrigger: React.ReactNode;
  projectOptions: { label: string; value: string }[];
}) => {
  const query = useQuery();

  const [openDialog, setOpenDialog] = useState(false);

  const [applicationSize, setApplicationSize] = useState({
    width: 1920,
    height: 1080,
  });

  const createOrUpdate = () => {
    const values = form.getValues();
    const screen_size =
      values.screen_size === '2' ? applicationSize : { width: 1920, height: 1080 };
    const params = {
      name: values.name,
      project_id: Number(values.project_id),
      status: Number(values.status),
      ...screen_size,
      ...(values.description && { description: values.description }),
    };
    return type === 'create'
      ? applicationApi.createApplication(params)
      : applicationApi.updateApplication(params, id!);
  };

  const { loading, run: onSubmit } = useRequest(() => createOrUpdate(), {
    manual: true,
    onSuccess: () => {
      toast.success('保存成功');
      setOpenDialog(false);
      getApplications();
      form.reset();
    },
  });

  const FormSchema = z.object({
    name: z.string().min(1, {
      message: '应用名称不能为空',
    }),
    project_id: z.string().min(1, {
      message: '项目id不能为空',
    }),
    description: z.string().optional(),
    screen_size: z.string().optional(),
    status: z.string(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      description: '',
      screen_size: '1', // 1为默认2为自定义
      status: '1',
      project_id: query?.id || '',
    },
  });

  const { runAsync: getApplicationById } = useRequest(
    () => applicationApi.getApplicationById(id!),
    {
      manual: true,
      onSuccess: (data) => {
        form.reset({
          ...data,
          project_id: data.project_id.toString(),
          screen_size: data.width === 1920 && data.height === 1080 ? '1' : '2',
        });
      },
    },
  );

  useEffect(() => {
    if (type === 'update' && openDialog) {
      getApplicationById();
    }
  }, [openDialog]);
  return (
    <Dialog
      open={openDialog}
      onOpenChange={(value) => {
        setOpenDialog(value);
        form.reset();
      }}
    >
      <DialogTrigger asChild>{renderTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{`${type === 'create' ? '创建' : '编辑'}`}应用</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      应用名称<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="请输入应用名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-start gap-4">
                <FormField
                  disabled={Boolean(query?.id)}
                  control={form.control}
                  name="project_id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        应用项目<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          options={projectOptions}
                          allowClear={true}
                          className="w-full"
                          placeholder="请选择项目"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={type === 'create'}
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        开发状态<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          options={statusOptions}
                          className="w-full"
                          placeholder="请选择开发状态"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="screen_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>屏幕尺寸</FormLabel>
                    <FormControl>
                      <div className="screen-list flex gap-2">
                        <div
                          onClick={() => field.onChange('1')}
                          className={`${field.value === '1' ? 'border-primary' : ''} screen-item flex-1 flex flex-col items-center justify-center gap-2 border-2 rounded-xl py-3 cursor-pointer hover:border-primary`}
                        >
                          <Computer />
                          <span>桌面应用（默认）</span>
                          <span>1920x1080</span>
                        </div>
                        <div
                          onClick={() => field.onChange('2')}
                          className={`${field.value === '2' ? 'border-primary' : ''} screen-item flex-1 flex flex-col items-center justify-center gap-2 border-2 rounded-xl py-3 cursor-pointer hover:border-primary`}
                        >
                          <Fullscreen />
                          <span>自定义</span>
                          <div className="flex gap-2 items-center">
                            {field.value === '2' ? (
                              <>
                                <Input
                                  placeholder="宽度"
                                  type="number"
                                  className="w-[100px] h-[32px]"
                                  value={applicationSize.width}
                                  onChange={(e) =>
                                    setApplicationSize({
                                      ...applicationSize,
                                      width: Number(e.target.value),
                                    })
                                  }
                                />
                                x
                                <Input
                                  placeholder="高度"
                                  type="number"
                                  className="w-[100px] h-[32px]"
                                  value={applicationSize.height}
                                  onChange={(e) =>
                                    setApplicationSize({
                                      ...applicationSize,
                                      height: Number(e.target.value),
                                    })
                                  }
                                />
                              </>
                            ) : (
                              <span>x</span>
                            )}
                          </div>
                        </div>
                      </div>
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
                    <FormLabel>应用描述</FormLabel>
                    <FormControl>
                      <Textarea placeholder="应用描述" {...field} />
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

export default CreateApplication;
