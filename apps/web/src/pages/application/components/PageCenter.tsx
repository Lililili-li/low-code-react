import { Menu } from '@/components/Menu';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { PlusCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import SavePage, { SavePageRef } from './SavePage';

interface PageCenterProps {
  renderTrigger: React.ReactNode;
  type?: 'create' | 'update';
  onCreateSuccess: () => void;
  application_id: number;
}

const menuItems = [
  {
    key: 'all',
    label: '全部',
  },
  {
    key: 'application',
    label: '当前应用',
  },
  {
    key: 'template',
    label: '社区模板',
  },
  {
    key: 'my-template',
    label: '我的模板',
  },
];

const pages = [
  {
    name: '财报数据大屏',
    id: 1,
    cover: 'http://heartmm.xyz/static/cover.png',
  },
];

const PageCenter = ({ renderTrigger, type = 'create', onCreateSuccess, application_id }: PageCenterProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('all');
  const savePageRef = useRef<SavePageRef>(null);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>{renderTrigger}</TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>{type === 'create' ? '添加页面' : '修改信息'}</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[1200px] p-4 h-[calc(100vh-120px)] flex flex-col dark:bg-[#121212] bg-[#f8f9fa]">
        <DialogHeader>
          <DialogTitle>添加页面</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 border-t">
          <div className="sidebar border-r">
            <Menu
              items={menuItems}
              className="p-0"
              activeKey={currentMenu}
              onSelect={(value) => setCurrentMenu(value)}
            ></Menu>
          </div>
          <div className="content grid grid-cols-3 gap-4 p-4">
            <div
              className="hover:translate-y-[-4px] transition-all flex flex-col items-center justify-center gap-2 h-[200px] bg-white dark:bg-[#1d1d1d] p-4 py-3 rounded-xl cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
              onClick={() => {
                savePageRef.current?.openDialog('create');
              }}
            >
              <PlusCircle className="text-primary" size={32} />
              <div className="title text-sm dark:text-gray-300 text-gray-600">新建空白页面</div>
            </div>
            {pages.map((item) => (
              <div
                key={item.id}
                className="bg-white hover:translate-y-[-4px] overflow-hidden transition-all hover:[&>.footer]:opacity-90 flex flex-col items-center gap-2 h-[200px] dark:bg-[#1d1d1d] relative p-3 px-2 rounded-xl cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
              >
                <div className="title text-sm dark:text-gray-300 text-gray-600">{item.name}</div>
                <img src={item.cover} alt="" className="w-full h-full flex-1 min-h-0 rounded-lg" />
                <div className="footer bg-white dark:bg-[#1d1d1d] py-2 w-full flex justify-center rounded-tl-xl rounded-tr-xl gap-4 absolute bottom-0 left-1/2 -translate-x-1/2 opacity-0 transition-all">
                  <Button size="sm" variant="outline">
                    预览
                  </Button>
                  <Button size="sm">使用</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
      <SavePage
        ref={savePageRef}
        onCreateSuccess={() => {
          onCreateSuccess();
          setOpenDialog(false);
        }}
        application_id={application_id}
      />
    </Dialog>
  );
};

export default PageCenter;
