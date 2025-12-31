import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { Command } from 'lucide-react';
import LeftMouseIcon from '../assets/left-mouse.svg';

interface HotKeyDialogProps {
  children: React.ReactNode;
}

const HotKeyData = [
  {
    function: '展示 / 隐藏组件',
    macHotKey: (
      <div className="flex items-center">
        <Command size={16} /> + P
      </div>
    ),
    windowsHotKey: 'Ctrl + P',
  },
  {
    function: '移动组件',
    macHotKey: (
      <div className="flex items-center gap-2">
        <span>↑</span>
        <span>→</span>
        <span>↓</span>
        <span>←</span>
      </div>
    ),
    windowsHotKey: (
      <div className="flex items-center gap-2">
        <span>↑</span>
        <span>→</span>
        <span>↓</span>
        <span>←</span>
      </div>
    ),
  },
  {
    function: '删除组件',
    macHotKey: 'Backspace',
    windowsHotKey: 'Backspace',
  },
  {
    function: '复制组件',
    macHotKey: (
      <div className="flex items-center">
        <Command size={16} /> + C
      </div>
    ),
    windowsHotKey: 'Ctrl + C',
  },
  {
    function: '粘贴组件',
    macHotKey: (
      <div className="flex items-center">
        <Command size={16} /> + V
      </div>
    ),
    windowsHotKey: 'Ctrl + V',
  },
  {
    function: '剪切组件',
    macHotKey: (
      <div className="flex items-center">
        <Command size={16} /> + X
      </div>
    ),
    windowsHotKey: 'Ctrl + X',
  },
  {
    function: '多选组件',
    macHotKey: (
      <div className="flex items-center">
        Shift + <img src={LeftMouseIcon} alt="" className="size-6" />
      </div>
    ),
    windowsHotKey: (
      <div className="flex items-center">
        Shift + <img src={LeftMouseIcon} alt="" className="size-6" />
      </div>
    ),
  },
  {
    function: '创建分组 / 解除分组',
    macHotKey: (
      <div className="flex items-center">
        <Command size={16} /> + G
      </div>
    ),
    windowsHotKey: 'Ctrl + G',
  },
  {
    function: '移动画布',
    macHotKey: (
      <div className="flex items-center">
        Space + <img src={LeftMouseIcon} alt="" className="size-6" />
      </div>
    ),
    windowsHotKey: (
      <div className="flex items-center">
        Space + <img src={LeftMouseIcon} alt="" className="size-6" />
      </div>
    ),
  },
  {
    function: '放大/缩小画布',
    macHotKey: (
      <div className="flex items-center">
        <Command size={16} /> + 鼠标滚轮
      </div>
    ),
    windowsHotKey: 'Ctrl + 鼠标滚轮',
  },
  {
    function: '锁定 / 解锁画布',
    macHotKey: (
      <div className="flex items-center">
        <Command size={16} /> + L
      </div>
    ),
    windowsHotKey: 'Ctrl + L',
  },
  {
    function: '撤销',
    macHotKey: (
      <div className="flex items-center">
        <Command size={16} /> + Z
      </div>
    ),
    windowsHotKey: 'Ctrl + Z',
  },
  {
    function: '恢复',
    macHotKey: (
      <div className="flex items-center">
        <Command size={16} /> + Y
      </div>
    ),
    windowsHotKey: 'Ctrl + Y',
  },
];

const HotKeyDialog: FC<HotKeyDialogProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-4">
        <DialogHeader>
          <DialogTitle>快捷键说明</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">功能</TableHead>
              <TableHead className="w-[30%]">Mac快捷键</TableHead>
              <TableHead className="w-[30%]">Windows快捷键</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {HotKeyData.map((key) => (
              <TableRow key={key.function}>
                <TableCell className="font-medium">{key.function}</TableCell>
                <TableCell className="font-medium">{key.macHotKey}</TableCell>
                <TableCell className="font-medium">{key.windowsHotKey}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default HotKeyDialog;
