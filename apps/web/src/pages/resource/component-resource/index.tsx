import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { Button } from '@repo/ui/components/button';
import { Search, FolderPlus, CircleX, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import Select from '@/components/Select';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import Empty from '@/components/Empty';
import ComponentCard from './components/ComponentCard';
import CreateCmpDialog, { CreateCmpDialogRefProps } from './components/CreateCmpDialog';
import { useRequest } from 'ahooks';
import commonApi from '@/api/common';
import componentApi from '@/api/component';
import Pagination from '@/components/Pagination';
import { Spinner } from '@repo/ui/components/spinner';
import { useSearchParams } from 'react-router';
import EditCmpDialog from './components/EditCmpDialog';

const ComponentResource = () => {
  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 12,
    name: '',
    category_id: '',
  });

  const createComponentSource = () => {
    createCmpDialogRef.current?.onOpenDialog();
  };

  const createCmpDialogRef = useRef<CreateCmpDialogRefProps>(null);

  const { data: categories } = useRequest(() =>
    commonApi.getCategoryByModuleId('component-resource'),
  );

  const { data: components = { list: [], total: 0 }, loading, run: getComponents } = useRequest(
    () => componentApi.getComponents(queryParams),
    {
      refreshDeps: [queryParams],
    },
  );
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  if (id) {
    return <EditCmpDialog id={id} onBack={() => getComponents()}/>
  }
  // if (!id) {
  //   getComponents()
  // }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center h-[50px] px-3 bg-white dark:bg-[#18181b] border-b">
        <div className="flex items-center gap-2">
          <InputGroup className="w-[240px] h-[32px] group">
            <InputGroupInput
              placeholder="组件名称"
              className="w-[240px]"
              onEnterSearch={(value) => {
                setQueryParams({ ...queryParams, name: value });
              }}
              defaultValue={queryParams.name}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            {queryParams.name && (
              <InputGroupButton asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-[50%] size-5 mr-1 opacity-0 group-focus-within:opacity-100 transition-opacity"
                  onClick={() => setQueryParams({ ...queryParams, name: '' })}
                >
                  <CircleX className="size-4" />
                </Button>
              </InputGroupButton>
            )}
          </InputGroup>
          <Select
            placeholder="组件类型"
            value={queryParams.category_id}
            options={
              categories?.map((item) => ({
                label: item.name,
                value: item.value,
              })) || []
            }
            onChange={(value) => {
              setQueryParams({ ...queryParams, category_id: value });
            }}
            className="w-[240px] h-[32px]"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={createComponentSource}>
            <FolderPlus />
            添加组件
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                'https://datav.aliyun.com/portal/school/atlas/area_selector#&lat=33.521903996156105&lng=104.29849999999999&zoom=4',
                '_blank',
              )
            }
          >
            <Upload />
            导入组件
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0 p-3">
        <div className="grid grid-cols-4 gap-4">
          {components?.list?.length > 0 &&
            components?.list?.map((item) => {
              return (
                <ComponentCard
                  key={item.id}
                  cover={item.cover}
                  name={item.name}
                  id={item.id}
                  category_id={item.category_id}
                  onDelete={() => {}}
                  categories={
                    categories?.map((item) => ({
                      label: item.name,
                      value: item.value,
                    })) || []
                  }
                  created_at={item.created_at}
                  is_active={item.is_active}
                  code={item.code}
                />
              );
            })}
        </div>
        {!loading && components?.list?.length === 0 && <Empty description="暂无数据" />}
        {loading && (
          <div className="flex items-center justify-center w-full mt-4">
            <Spinner className="text-primary size-6" />
            <span className="ml-2">加载中...</span>
          </div>
        )}
        <div className="flex justify-end mt-4 w-full">
          <Pagination
            currentPage={queryParams.page}
            pageSize={queryParams.pageSize}
            total={components?.total}
            onSizeChange={(pageSize) => {
              setQueryParams({ ...queryParams, pageSize });
            }}
            onPageChange={(page) => {
              setQueryParams({ ...queryParams, page });
            }}
            className="justify-end"
          />
        </div>
      </ScrollArea>
      <CreateCmpDialog
        ref={createCmpDialogRef}
        categories={
          categories?.map((item) => ({
            label: item.name,
            value: item.value,
          })) || []
        }
      />
    </div>
  );
};

export default ComponentResource;
