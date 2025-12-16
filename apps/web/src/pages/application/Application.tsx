import { Card, CardContent, CardTitle } from '@/components/Card';
import { Button } from '@repo/ui/components/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import SaveApplication from './SaveApplication';
import { CircleX, FileInput, FolderPlus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@/composable/use-query';
import Pagination from '@/components/Pagination';
import Viewer from 'react-viewer';
import ApplicationCard from './components/ApplicationCard';
import { useRequest } from 'ahooks';
import applicationApi, { ApplicationProps } from '@/api/application';
import projectApi from '@/api/project';
import Empty from '@/components/Empty';
import { Spinner } from '@repo/ui/components/spinner';
import Select from '@/components/Select';
import { useSystemStore } from '@/store/modules/system';

export const APP_STATUS = {
  1: '开发中',
  2: '测试中',
  3: '已发布',
};

const Application = () => {
  const industries = useSystemStore((state) => state.industries);
  const [visible, setVisible] = useState(false);
  const [currentApp, setCurrentApp] = useState<ApplicationProps>({} as ApplicationProps);
  const previewImage = (data: any) => {
    setVisible(true);
    setCurrentApp(data);
  };
  const query = useQuery();

  const [searchName, setSearchName] = useState('');
  const [queryParams, setQueryParams] = useState({
    page: 1,
    size: 10,
    name: '',
    project_id: query?.id || '',
    status: '',
    industry_id: '',
  });

  const {
    loading,
    data: applications,
    runAsync: getApplications,
  } = useRequest(
    () =>
      applicationApi.getApplications({
        ...queryParams,
        status: queryParams.status ? Number(queryParams.status) : undefined,
        project_id: queryParams.project_id ? Number(queryParams.project_id) : undefined,
        industry_id: queryParams.industry_id ? Number(queryParams.industry_id) : undefined,
      }),
    {
      refreshDeps: [queryParams],
    },
  );

  const { data: projectList } = useRequest(() => projectApi.getProjectsByUser());

  const projectOptions = useMemo(() => {
    return (projectList ?? []).map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }, [projectList]);

  return (
    <div className="application-container h-full flex-col flex gap-4">
      <Card>
        <CardTitle>
          <div className="flex justify-between items-center">
            <div className="filter-wrap flex items-center gap-2">
              <InputGroup className="w-[240px] h-[32px] group">
                <InputGroupInput
                  placeholder="请输入应用名称"
                  className="w-[240px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setQueryParams({ ...queryParams, name: searchName });
                    }
                  }}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                {searchName && (
                  <InputGroupButton asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-[50%] size-4 mr-1 opacity-0 group-focus-within:opacity-100 transition-opacity"
                      onClick={() => {
                        setSearchName('');
                        setQueryParams({ ...queryParams, name: '' });
                      }}
                    >
                      <CircleX className="size-4 text-muted-foreground" />
                    </Button>
                  </InputGroupButton>
                )}
              </InputGroup>
              {!query && (
                <Select
                  value={queryParams.project_id}
                  onChange={(value) => setQueryParams({ ...queryParams, project_id: value })}
                  placeholder="请选择项目"
                  options={projectOptions}
                  className="w-[240px]"
                  allowClear={!!queryParams.project_id}
                />
              )}
              {!query && (
                <Select
                  value={queryParams.industry_id}
                  onChange={(value) => setQueryParams({ ...queryParams, industry_id: value })}
                  placeholder="请选择行业"
                  options={industries.map((item) => ({
                    label: item.name,
                    value: item.id.toString(),
                  }))}
                  className="w-[240px]"
                  allowClear={!!queryParams.industry_id}
                />
              )}
              <Select
                value={queryParams.status}
                onChange={(value) => setQueryParams({ ...queryParams, status: value })}
                placeholder="请选择开发状态"
                options={[
                  {
                    label: APP_STATUS[1],
                    value: '1',
                  },
                  {
                    label: APP_STATUS[2],
                    value: '2',
                  },
                  {
                    label: APP_STATUS[3],
                    value: '3',
                  },
                ]}
                allowClear={!!queryParams.status}
                className="w-[240px]"
              />
            </div>
            <div className="operation flex gap-2 items-center">
              <SaveApplication
                getApplications={getApplications}
                projectOptions={projectOptions}
                renderTrigger={
                  <Button variant="default" size="sm">
                    <FolderPlus />
                    添加应用
                  </Button>
                }
              ></SaveApplication>
              <Button variant="outline" size="sm">
                <FileInput />
                导入应用
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 />
                回收站
              </Button>
            </div>
          </div>
        </CardTitle>
      </Card>
      <Card className="flex-1">
        <CardContent className="mt-0">
          {!loading && applications?.total && (
            <div className="applications grid grid-cols-3 gap-4">
              {applications?.list.map((item) => {
                return (
                  <ApplicationCard
                    data={item}
                    onPreview={() => previewImage(item)}
                    getApplications={getApplications}
                    key={item.id}
                    projectOptions={projectOptions}
                  />
                );
              })}
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center w-full mt-4">
              <Spinner className="text-primary size-6" />
              <span className="ml-2">加载中...</span>
            </div>
          )}
          {applications?.total === 0 && !loading && (
            <Empty renderContent={<div>赶紧去添加一个应用吧</div>} description="暂无数据" />
          )}
          <Pagination
            currentPage={queryParams.page}
            pageSize={queryParams.size}
            total={applications?.total!}
            showSizeChanger
            className="mb-3 mt-4 justify-end"
          />
        </CardContent>
      </Card>
      <Viewer
        visible={visible}
        onClose={() => setVisible(false)}
        images={[{ src: currentApp.cover, alt: '' }]}
      />
    </div>
  );
};

export default Application;
