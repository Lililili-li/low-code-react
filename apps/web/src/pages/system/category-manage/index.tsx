import { Card } from '@/components/Card';
import ConfirmDialog from '@/components/ConfirmDialog';
import Empty from '@/components/Empty';
import Pagination from '@/components/Pagination';
import { Button } from '@repo/ui/components/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Spinner } from '@repo/ui/components/spinner';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from '@repo/ui/components/table';
import { CircleX, Edit, FolderPlus, Search, Trash2 } from 'lucide-react';
import SaveSysCategory from './components/SaveSysCategory';
import { useState } from 'react';
import { useRequest } from 'ahooks';
import commonApi from '@/api/common';
import dayjs from 'dayjs';

const CategoryManage = () => {
  const [queryParams, setQueryParams] = useState({
    page: 1,
    size: 10,
    name: '',
    module_name: '',
  });

  const {
    data: categories,
    loading,
    runAsync: getCategories,
  } = useRequest(() => {
    return commonApi.getCategories(queryParams);
  });


  const handleDeleteCategory = (id: number) => {};
  return (
    <div className="category-manage flex flex-col h-full">
      <div className="flex justify-between items-center h-[50px] px-3 bg-white dark:bg-[#18181b] border-b">
        <div className="flex items-center gap-2">
          <InputGroup className="w-[240px] h-[32px] group">
            <InputGroupInput
              placeholder="分类名称"
              className="w-[240px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                }
              }}
              value={queryParams.name}
              onChange={(e) => {
                setQueryParams({ ...queryParams, name: e.target.value });
              }}
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
          <InputGroup className="w-[240px] h-[32px] group">
            <InputGroupInput
              placeholder="模块名称"
              className="w-[240px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                }
              }}
              value={queryParams.module_name}
              onChange={(e) => {
                setQueryParams({ ...queryParams, module_name: e.target.value });
              }}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            {queryParams.module_name && (
              <InputGroupButton asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-[50%] size-5 mr-1 opacity-0 group-focus-within:opacity-100 transition-opacity"
                  onClick={() => setQueryParams({ ...queryParams, module_name: '' })}
                >
                  <CircleX className="size-4" />
                </Button>
              </InputGroupButton>
            )}
          </InputGroup>
        </div>
        <SaveSysCategory
          getCategories={getCategories}
          renderTrigger={
            <Button variant="default" size="sm">
              <FolderPlus />
              添加分类
            </Button>
          }
        ></SaveSysCategory>
      </div>
      <Card className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>分类名称</TableHead>
                <TableHead>分类值</TableHead>
                <TableHead className="w-[300px]">描述</TableHead>
                <TableHead>模块名称</TableHead>
                <TableHead>模块ID</TableHead>
                <TableHead>是否启用</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && categories?.total! > 0 && (
                <>
                  {categories?.list?.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.id}</TableCell>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.value}</TableCell>
                      <TableCell>{project.description}</TableCell>
                      <TableCell>{project.module_name}</TableCell>
                      <TableCell>{project.module_id}</TableCell>
                      <TableCell>{project.is_active ? '是' : '否'}</TableCell>
                      <TableCell>{dayjs(project.created_at).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                      <TableCell>{dayjs(project.updated_at).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                      <TableCell className="flex gap-4">
                        <SaveSysCategory
                          getCategories={getCategories}
                          type="update"
                          id={project.id}
                          renderTrigger={
                            <Button variant="link" size="sm" className="p-0 gap-1.5">
                              <Edit className='size-4'/>
                              编辑
                            </Button>
                          }
                        ></SaveSysCategory>

                        <ConfirmDialog
                          trigger={
                            <Button variant="link" size="sm" className="text-red-500 p-0 gap-1.5">
                              <Trash2 className='size-4'/>
                              删除
                            </Button>
                          }
                          title="温馨提示!"
                          description="是否确定要删除该分类？"
                          onConfirm={() => handleDeleteCategory(project.id)}
                        ></ConfirmDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
          {loading && (
            <div className="flex items-center justify-center w-full mt-4">
              <Spinner className="text-primary size-6" />
              <span className="ml-2">加载中...</span>
            </div>
          )}
          {!loading && categories?.total! === 0 && (
            <div className="flex items-center justify-center w-full">
              <Empty
                renderContent={
                  <SaveSysCategory
                    getCategories={getCategories}
                    renderTrigger={
                      <Button variant="default" size="sm">
                        <FolderPlus />
                        创建分类
                      </Button>
                    }
                  ></SaveSysCategory>
                }
              />
            </div>
          )}
          <Pagination
            currentPage={queryParams.page}
            pageSize={queryParams.size}
            total={categories?.total || 0}
            onPageChange={(page) => setQueryParams({ ...queryParams, page })}
            onSizeChange={(size) => setQueryParams({ ...queryParams, size })}
            className="mt-4 justify-end"
            showSizeChanger
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default CategoryManage;
