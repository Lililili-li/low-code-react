import { Card, CardContent, CardTitle } from '@/components/Card';
import { Button } from '@repo/ui/components/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import CreateApplication from './CreateApplication';
import {
  AppWindow,
  CircleX,
  Copy,
  Edit,
  FileInput,
  FolderPlus,
  Search,
  Share,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@/composable/use-query';
import { Tooltip, TooltipTrigger, TooltipContent } from '@repo/ui/components/tooltip';
import ConfirmDialog from '@/components/ConfirmDialog';
import Pagination from '@/components/Pagination';
import Viewer from 'react-viewer';
import ApplicationCard from './components/ApplicationCard';

export const APP_STATUS = {
  1: '开发中',
  2: '测试中',
  3: '已发布',
};

const applications = [
  {
    id: 1,
    name: '测试应用',
    created_by: '张三',
    development: [
      {
        name: '王五',
      },
      {
        name: '李四',
      },
    ],
    title: '智游长白山',
    status: 3,
    cover: '//heartmm.xyz/static/cover.png',
  },
];

const Application = () => {
  const [visible, setVisible] = useState(false);
  const [currentApp, setCurrentApp] = useState<(typeof applications)[0]>(
    {} as (typeof applications)[0],
  );
  const previewImage = (data: (typeof applications)[0]) => {
    setVisible(true);
    setCurrentApp(data);
  };
  const query = useQuery();

  const [queryParams, setQueryParams] = useState({
    page: 1,
    size: 10,
    name: '',
    projectId: query?.id,
    status: '',
    industry: '',
  });

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
                      className="rounded-[50%] size-4 mr-1 opacity-0 group-focus-within:opacity-100 transition-opacity"
                      onClick={() => setQueryParams({ ...queryParams, name: '' })}
                    >
                      <CircleX className="size-4 text-[var(--muted-foreground)]" />
                    </Button>
                  </InputGroupButton>
                )}
              </InputGroup>
              {!query && (
                <Select>
                  <SelectTrigger
                    className="w-[240px] h-[32px] group justify-between"
                    style={{ height: 32 }}
                  >
                    <div className="flex items-center gap-2 justify-between flex-1">
                      <SelectValue placeholder="项目名称" />
                      {queryParams.projectId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-[50%] size-5 mr-1 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity"
                          onClick={() => setQueryParams({ ...queryParams, name: '' })}
                        >
                          <CircleX className="size-4" />
                        </Button>
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Fruits</SelectLabel>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="blueberry">Blueberry</SelectItem>
                      <SelectItem value="grapes">Grapes</SelectItem>
                      <SelectItem value="pineapple">Pineapple</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
              {!query && (
                <Select
                  value={queryParams.industry}
                  onValueChange={(value) => setQueryParams({ ...queryParams, industry: value })}
                >
                  <SelectTrigger
                    className="w-[240px] h-[32px] group justify-between"
                    style={{ height: 32 }}
                    allowClear={!!queryParams.industry}
                    onClear={() => setQueryParams({ ...queryParams, industry: '' })}
                  >
                    <div className="flex items-center gap-2 justify-between flex-1 relative">
                      <SelectValue placeholder="行业" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">{APP_STATUS[1]}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
              <Select
                value={queryParams.status}
                onValueChange={(value) => setQueryParams({ ...queryParams, status: value })}
              >
                <SelectTrigger
                  className="w-[240px] h-[32px] group justify-between"
                  style={{ height: 32 }}
                  allowClear={!!queryParams.status}
                  onClear={() => setQueryParams({ ...queryParams, status: '' })}
                >
                  <div className="flex items-center gap-2 justify-between flex-1 relative">
                    <SelectValue placeholder="开发状态" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">{APP_STATUS[1]}</SelectItem>
                    <SelectItem value="2">{APP_STATUS[2]}</SelectItem>
                    <SelectItem value="3">{APP_STATUS[3]}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="operation flex gap-2 items-center">
              <CreateApplication
                getProjects={() => {}}
                renderTrigger={
                  <Button variant="default" size="sm">
                    <FolderPlus />
                    创建应用
                  </Button>
                }
              ></CreateApplication>
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
      <Card>
        <CardContent className="mt-0">
          <div className="applications grid grid-cols-3 gap-4">
            {applications.map((item) => {
              return <ApplicationCard data={item} onPreview={() => previewImage(item)} />;
            })}
          </div>
          <Pagination
            currentPage={queryParams.page}
            pageSize={queryParams.size}
            total={applications.length}
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
