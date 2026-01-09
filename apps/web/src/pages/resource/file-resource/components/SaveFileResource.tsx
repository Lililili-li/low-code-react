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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '@repo/ui/components/spinner';
import { useRequest } from 'ahooks';
import { toast } from 'sonner';
import React, { useEffect, useState } from 'react';
import Select from '@/components/Select';
import FileUpload from '@/components/FileUpload';
import commonApi from '@/api/common';
import resourceApi from '@/api/resource';

const SaveFileResource = ({
  getList,
  renderTrigger,
  type = 'create',
  id,
  categoryOptions
}: {
  getList: () => void;
  type?: 'create' | 'update';
  id?: number;
  renderTrigger: React.ReactNode;
  categoryOptions: {label: string, value: string}[];
}) => {

  const [openDialog, setOpenDialog] = useState(false);

  const createOrUpdate = () => {
    const params = form.getValues();
    const format = params.file.mimetype.split('/')[1];
    const newParams = {
      name: params.name,
      category_id: params.category_id,
      size: params.file.size,
      format,
      url: params.file.url,
    };
    if (type === 'create') {
      return resourceApi.createFileResource(newParams);
    } else {
      return resourceApi.updateFileResource(newParams, id!);
    }
  };

  const { loading, run: onSubmit } = useRequest(() => createOrUpdate(), {
    manual: true,
    onSuccess: () => {
      toast.success(type === 'create' ? '创建成功' : '更新成功');
      setOpenDialog(false);
      getList();
      form.reset()
    },
  });

  const FormSchema = z.object({
    name: z.string().min(1, { message: '资源名称不能为空' }),
    category_id: z.string().min(1, { message: '资源分类不能为空' }),
    file: z.object({
      name: z.string().min(1, { message: '资源文件不能为空' }),
      url: z.string().min(1, { message: '资源文件不能为空' }),
      size: z.number().min(1, { message: '资源大小不能为空' }),
      mimetype: z.string().min(1, { message: '资源格式不能为空' }),
    }),
    size: z.number(),
    format: z.string(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      category_id: '',
      file: {
        url: '',
        name: '',
        size: 0,
        mimetype: '',
      },
      size: 0,
      format: '',
    },
  });

  const { runAsync: getFileResourceById } = useRequest(() => resourceApi.getFileResourceById(id!), {
    manual: true,
    onSuccess: (data) => {
      form.reset({
        name: data.name,
        category_id: data.category_id,
        file: {
          url: data?.url || '',
          name: data?.name+'.'+data.format || '',
          size: data?.size || 0,
          mimetype: data?.format || '',
        },
        size: data.size,
        format: data.format,
      });
    },
  });

  const handleFileChange = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await commonApi.uploadFile(formData);
    return response;
  };

  useEffect(() => {
    if (type === 'update' && openDialog) {
      getFileResourceById();
    }
  }, [openDialog]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{renderTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => onSubmit())}>
            <DialogHeader>
              <DialogTitle>上传资源</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="text-red-500">*</span>
                      <span>文件名称</span>
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
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="text-red-500">*</span>
                      <span>文件分类</span>
                    </FormLabel>
                    <Select
                      {...field}
                      options={categoryOptions}
                      placeholder="请选择行业"
                      className="w-full"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="text-red-500">*</span>
                      <span>文件上传</span>
                    </FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={(data) => {
                          const fileData = {
                            name: data.filename,
                            url: data.path,
                            size: data.size,
                            mimetype: data.mimetype,
                          };
                          field.onChange(fileData);
                        }}
                        onUpload={async (file) => {
                          return handleFileChange(file);
                        }}
                        accept=".png,.jpg,.jpeg,.svg,.mp3,.mp4"
                        description="支持图片以及视频格式"
                        disabled={type === 'update'}
                      />
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
              <Button
                type="submit"
                size="sm"
              >
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

export default SaveFileResource;
