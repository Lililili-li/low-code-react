import { Button } from '@repo/ui/components/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui/components/input-group';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import TabMenu from '@/components/TabMenu';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { Input } from '@repo/ui/components/input';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { Label } from '@repo/ui/components/label';
import { useRequest } from 'ahooks';
import projectApi from '@/api/project';
import dayjs from 'dayjs';

interface IndustryProps {
  queryParams: any;
  setQueryParams: any;
  getList: any;
}

const ProjectSelect = ({ queryParams, setQueryParams, getList }: IndustryProps) => {
  const [keywords, setKeywords] = useState('');
  const {
    data: projects,
    loading,
    runAsync: getProjects,
  } = useRequest((params = {page: 1, size: 99999}) => projectApi.getProjects(params), {
    onSuccess: (data) => {
      data.list = data.list.map((item) => {
        item.created_at = dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss');
        item.updated_at = dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss');
        return item;
      });
    },
  });

  const showIndustries = useMemo(() => {
    const newData = projects?.list
      .filter((project) => {
        return project.name.includes(keywords);
      })
      .map((item) => {
        return {
          label: item.name,
          value: item.id.toString(),
        };
      });
    newData?.unshift({
      label: '全部',
      value: '' as any,
    });
    return newData;
  }, [keywords, projects]);

  const [dialogOpen, setDialogOpen] = useState(false);

  const FormSchema = z.object({
    name: z.string().min(1, {
      message: '项目名称不能为空',
    }),
    description: z.string(),
    sort: z.number(),
    is_active: z.boolean(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      description: '',
      sort: 0,
      is_active: true,
    },
  });

  const onSubmit = () => {};
  return (
    <div className="category border-r w-[240px] h-full dark:bg-[#18181b] flex flex-col gap-2 bg-white">
      <div className="filter-wrap h-[50px] px-3 flex items-center gap-2">
        <InputGroup>
          <InputGroupInput
            placeholder="请输入项目名称"
            defaultValue={keywords}
            onEnterSearch={(value) => {
              setKeywords(value)
            }}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
              <PlusCircle />
            </Button>
          </TooltipTrigger>
          <TooltipContent>添加行业分类</TooltipContent>
        </Tooltip> */}
      </div>
      <ScrollArea className="flex-1 min-h-0 px-3">
        <TabMenu
          items={showIndustries || []}
          activeId={queryParams.project_id}
          onSelect={(id) => {
            const newParams = { ...queryParams, project_id: id.toString() };
            setQueryParams(newParams);
            getList(newParams);
          }}
        />
      </ScrollArea>
      {/* TODO后期放到系统设置中 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>新增行业</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="text-red-500">*</span>
                        行业名称
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="请输入行业名称" {...field} />
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
                      <FormLabel>
                        <span className="text-red-500">*</span>
                        行业描述
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="请输入行业描述" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>排序</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="排序"
                          {...field}
                          className="w-[120px]"
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
                    <FormItem>
                      <FormLabel>是否启用</FormLabel>
                      <FormControl>
                        <RadioGroup
                          className="flex items-center gap-2"
                          value={field.value ? '1' : '0'}
                          onValueChange={(value) => {
                            field.onChange(Boolean(Number(value)));
                          }}
                        >
                          <RadioGroupItem value="1" />
                          <Label>是</Label>
                          <RadioGroupItem value="0" />
                          <Label>否</Label>
                        </RadioGroup>
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
                  {/* {loading && <Spinner />} */}
                  保存
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectSelect;
