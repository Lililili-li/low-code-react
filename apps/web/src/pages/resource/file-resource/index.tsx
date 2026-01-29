import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@repo/ui/components/button';
import { CircleX, Edit, FolderPlus, Link, Search, Trash2 } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from '@repo/ui/components/input-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import Pagination from '@/components/Pagination';
import { useRequest } from 'ahooks';
import { Spinner } from '@repo/ui/components/spinner';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Empty from '@/components/Empty';
import Category from './components/Category';
import SaveFileResource from './components/SaveFileResource';
import resourceApi from '@/api/resource';
import Select from '@/components/Select';
import { byteToMB } from '@repo/shared/index';
import commonApi from '@/api/common';
import dayjs from 'dayjs';

const formatOptions = ['png', 'jpg', 'jpeg', 'svg', 'mp3', 'mp4'];

const MediaContainer = ({ category_id, url }: { category_id: string; url: string }) => {
  return <>
    {
      category_id === 'image' && <img src={url} alt="" className="size-10 object-cover" />
    }
    {
      category_id === 'video' && <video src={url} className="size-10 object-cover" />
    }
    {
      category_id === 'audio' && <audio src={url} className="size-10 object-cover" />
    }
  </>;
};

const Projects = () => {
  const { data: categories } = useRequest(() => commonApi.getCategoryByModuleId('file-resource'), {
    refreshDeps: [],
  });

  const [queryParams, setQueryParams] = useState({
    page: 1,
    size: 10,
    name: '',
    category_id: '',
    format: '',
  });

  const {
    data: files,
    loading: fileLoading,
    runAsync: getFileResource,
  } = useRequest((params = queryParams) => resourceApi.getFileResource(params));

  const handleDeleteProject = async (id: number) => {
    await resourceApi.deleteFileResource(id);
    toast.success('删除成功');
    getFileResource();
  };

  return (
    <div className="projects-container flex h-full">
      <Category
        queryParams={queryParams}
        setQueryParams={setQueryParams}
        getProjects={getFileResource}
        categories={categories || []}
      />
      <div className="flex flex-col h-full flex-1">
        <div className="flex justify-between items-center h-[50px] px-3 bg-white dark:bg-[#18181b] border-b">
          <div className="flex items-center gap-2">
            <InputGroup className="w-[240px] h-[32px] group">
              <InputGroupInput
                placeholder="请输入资源名称"
                className="w-[240px]"
                onEnterSearch={getFileResource}
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
              value={queryParams.format}
              onChange={(value) => setQueryParams({ ...queryParams, format: value })}
              options={formatOptions.map((item) => ({ label: item, value: item }))}
              placeholder="文件格式"
              className="w-[240px] h-[32px]"
              allowClear={true}
            />
          </div>
          <SaveFileResource
            getList={getFileResource}
            renderTrigger={
              <Button variant="default" size="sm">
                <FolderPlus />
                上传资源
              </Button>
            }
            categoryOptions={
              categories?.map((item) => ({
                label: item.name,
                value: item.value,
              })) || []
            }
          />
        </div>
        <Card className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[300px]">资源名称</TableHead>
                <TableHead>文件大小</TableHead>
                <TableHead>文件格式</TableHead>
                <TableHead className="w-[300px]">文件描述</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="w-[240px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!fileLoading && files?.total! > 0 && (
                <>
                  {files?.list?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell className="font-medium flex gap-2 items-center w-[300px]">
                        <MediaContainer category_id={item.category_id} url={item.url}/>
                        <span className="flex-1 whitespace-nowrap text-ellipsis overflow-hidden">
                          {item.name}
                        </span>
                      </TableCell>
                      <TableCell>{byteToMB(item.size).toFixed(2)}MB</TableCell>
                      <TableCell>{item.format}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0"
                            onClick={() => {
                              navigator.clipboard.writeText(item.url);
                              toast.success('复制成功');
                            }}
                          >
                            <Link />
                            复制链接
                          </Button>
                          <SaveFileResource
                            getList={getFileResource}
                            categoryOptions={
                              categories?.map((item) => ({
                                label: item.name,
                                value: item.value,
                              })) || []
                            }
                            renderTrigger={
                              <Button variant="link" size="sm">
                                <Edit />
                                编辑
                              </Button>
                            }
                            type="update"
                            id={item.id}
                          />
                          <ConfirmDialog
                            trigger={
                              <Button variant="link" size="sm" className="text-red-500 p-0">
                                <Trash2 />
                                删除
                              </Button>
                            }
                            title="温馨提示!"
                            description="是否确定要删除该资源吗？"
                            onConfirm={() => handleDeleteProject(item.id)}
                          ></ConfirmDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
          {fileLoading && (
            <div className="flex items-center justify-center w-full mt-4">
              <Spinner className="text-primary size-6" />
              <span className="ml-2">加载中...</span>
            </div>
          )}
          {!fileLoading && files?.total! === 0 && (
            <div className="flex items-center justify-center w-full">
              <Empty description="暂无数据" />
            </div>
          )}
          <Pagination
            currentPage={queryParams.page}
            pageSize={queryParams.size}
            total={files?.total || 0}
            onPageChange={(page) => setQueryParams({ ...queryParams, page })}
            onSizeChange={(size) => setQueryParams({ ...queryParams, size })}
            className="mt-4 justify-end"
            showSizeChanger
          />
        </Card>
      </div>
    </div>
  );
};

export default Projects;
