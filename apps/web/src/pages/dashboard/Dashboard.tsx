import { Card, CardContent, CardTitle } from '@/components/Card';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import projectLogo from './images/project-logo.png';
import { Button } from '@repo/ui/components/button';
import { ChevronRight } from 'lucide-react';
import { useRequest } from 'ahooks';
import applicationApi, { ApplicationProps } from '@/api/application';
import projectApi from '@/api/project';
import { useMemo, useState } from 'react';
import ApplicationCard from '../application/components/ApplicationCard';
import Viewer from 'react-viewer';
import { Spinner } from '@repo/ui/components/spinner';
import Empty from '@/components/Empty';
import { useNavigate } from 'react-router';

const Dashboard = () => {
  const navigate = useNavigate();

  const {
    loading,
    data: applications,
    runAsync: getApplications,
  } = useRequest(() =>
    applicationApi.getApplications({
      page: 1,
      size: 9999,
    }),
  );

  const { data: projectList } = useRequest(() => projectApi.getProjectsByUser());

  const projectOptions = useMemo(() => {
    return (projectList ?? []).map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }, [projectList]);

  const [visible, setVisible] = useState(false);
  const [currentApp, setCurrentApp] = useState<ApplicationProps>({} as ApplicationProps);
  const previewImage = (data: any) => {
    setVisible(true);
    setCurrentApp(data);
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* <div className="title mb-4 font-bold text-2xl">
        工作台
      </div> */}
      <div className="statistics grid grid-cols-4 gap-4">
        <Card className="rounded-[4px] p-4 bg-[#f9fafb] dark:bg-[#282828]">
          <CardTitle className="flex gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="logo-icon w-[30px] h-[30px] flex items-center justify-center rounded-[50%] bg-[#eef8e3] dark:bg-[#333532]">
                <img src={projectLogo} alt="" className="w-[20px]" />
              </div>
              <span>项目总数</span>
            </div>
          </CardTitle>
          <CardContent>
            <div className="total">
              共 <span className="font-weight text-4xl">100</span> 个
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[4px] p-4 bg-[#f9fafb] dark:bg-[#282828]">
          <CardTitle className="flex gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="logo-icon w-[30px] h-[30px] flex items-center justify-center rounded-[50%] bg-[#eef8e3] dark:bg-[#333532]">
                <img src={projectLogo} alt="" className="w-[20px]" />
              </div>
              <span>应用总数</span>
            </div>
          </CardTitle>
          <CardContent>
            <div className="total">
              共 <span className="font-weight text-4xl">100</span> 个
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[4px] p-4 bg-[#f9fafb] dark:bg-[#282828]">
          <CardTitle className="flex gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="logo-icon w-[30px] h-[30px] flex items-center justify-center rounded-[50%] bg-[#eef8e3] dark:bg-[#333532]">
                <img src={projectLogo} alt="" className="w-[20px]" />
              </div>
              <span>组件总数</span>
            </div>
          </CardTitle>
          <CardContent>
            <div className="total">
              共 <span className="font-weight text-4xl">100</span> 个
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[4px] p-4 bg-[#f9fafb] dark:bg-[#282828]">
          <CardTitle className="flex gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="logo-icon w-[30px] h-[30px] flex items-center justify-center rounded-[50%] bg-[#eef8e3] dark:bg-[#333532]">
                <img src={projectLogo} alt="" className="w-[20px]" />
              </div>
              <span>模板总数</span>
            </div>
          </CardTitle>
          <CardContent>
            <div className="total">
              共 <span className="font-weight text-4xl">100</span> 个
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-[4px] p-4 mt-4 flex-1 bg-[#f9fafb] dark:bg-[#282828] flex flex-col min-h-0">
        <CardTitle className="flex gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="line w-1 h-[18px] bg-primary rounded-[2px]"></div>
            <div>
              <span>我的应用</span>
              <span className="text-xs text-gray-500 ml-2">最近14天创建的应用</span>
            </div>
          </div>
          <div>
            <Button
              variant="link"
              onClick={() => {
                navigate('/manage/application');
              }}
            >
              查看更多
              <ChevronRight />
            </Button>
          </div>
        </CardTitle>
        <CardContent className="flex-1 mt-2 min-h-0">
          <div className="applications h-full">
            <ScrollArea className="h-full">
              {(!loading && Boolean(applications?.total)) && (
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
            </ScrollArea>
          </div>
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

export default Dashboard;
