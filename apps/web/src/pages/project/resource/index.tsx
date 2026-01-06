import { lazy, useState, Suspense } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@repo/ui/components/button';
import { CircleX, FolderPlus, Search } from 'lucide-react';
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
import SaveProject from '../components/SaveProject';
import projectApi from '@/api/project';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import { Spinner } from '@repo/ui/components/spinner';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import Empty from '@/components/Empty';
import { useNavigate } from 'react-router';
import { useQuery } from '@/composable/use-query';
import LoadingSpinner from '@/components/LoadingSpinner';
import Industry from '../components/Industry';

const Application = lazy(() => import('../../application/Application'));
const Projects = () => {
  const [queryParams, setQueryParams] = useState({
    page: 1,
    size: 10,
    name: '',
    industry_id: '',
  });

  const {
    data: projects,
    loading,
    runAsync: getProjects,
  } = useRequest((params = queryParams) => projectApi.getProjects(params), {
    onSuccess: (data) => {
      data.list = data.list.map((item) => {
        item.created_at = dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss');
        item.updated_at = dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss');
        return item;
      });
    },
  });

  const handleDeleteProject = async (id: number) => {
    await projectApi.deleteProject(id);
    toast.success('删除成功');
    getProjects();
  };

  const navigate = useNavigate();
  const query = useQuery();

  const isApplication = !!query?.id;
  if (isApplication)
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Application />
      </Suspense>
    );

  return (
    <div className="projects-container flex h-full">
      <Industry
        queryParams={queryParams}
        setQueryParams={setQueryParams}
        getProjects={getProjects}
      />
      <div className="flex flex-col h-full flex-1 gap-2">
        <div className="flex justify-between items-center h-[50px] px-3 bg-white dark:bg-[#18181b]">
          <InputGroup className="w-[240px] h-[32px] group">
            <InputGroupInput
              placeholder="请输入项目名称"
              className="w-[240px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  getProjects();
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
          <SaveProject
            getProjects={getProjects}
            renderTrigger={
              <Button variant="default" size="sm">
                <FolderPlus />
                创建项目
              </Button>
            }
          ></SaveProject>
        </div>
        <Card className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead className="w-[300px]">描述</TableHead>
                <TableHead>创建人</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && projects?.total! > 0 && (
                <>
                  {projects?.list?.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.id}</TableCell>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.description}</TableCell>
                      <TableCell>{project.created_user.user_name}</TableCell>
                      <TableCell>{project.created_at}</TableCell>
                      <TableCell>{project.updated_at}</TableCell>
                      <TableCell className="flex gap-4">
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0"
                          onClick={() => navigate(`/manage/resource/project?id=${project.id}`)}
                        >
                          进入项目
                        </Button>
                        <SaveProject
                          getProjects={getProjects}
                          type="update"
                          id={project.id}
                          renderTrigger={
                            <Button variant="link" size="sm" className="p-0">
                              编辑
                            </Button>
                          }
                        ></SaveProject>

                        <ConfirmDialog
                          trigger={
                            <Button variant="link" size="sm" className="text-red-500 p-0">
                              删除
                            </Button>
                          }
                          title="温馨提示!"
                          description="是否确定要删除该项目？"
                          onConfirm={() => handleDeleteProject(project.id)}
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
          {!loading && projects?.total! === 0 && (
            <div className="flex items-center justify-center w-full">
              <Empty
                renderContent={
                  <SaveProject
                    getProjects={getProjects}
                    renderTrigger={
                      <Button variant="default" size="sm">
                        <FolderPlus />
                        创建项目
                      </Button>
                    }
                  ></SaveProject>
                }
              />
            </div>
          )}
          <Pagination
            currentPage={queryParams.page}
            pageSize={queryParams.size}
            total={projects?.total || 0}
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
