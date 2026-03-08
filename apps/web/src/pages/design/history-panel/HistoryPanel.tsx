import ConfirmDialog from '@/components/ConfirmDialog';
import Empty from '@/components/Empty';
import { useHistoryStore } from '@/store';
import { Button } from '@repo/ui/components/button';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import dayjs from 'dayjs';
import { LaptopMinimalCheck, RedoDot, Trash2, UndoDot } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

const HistoryPanel = () => {
  const { undoRecords, canRedo, canUndo, undo, redo, clear } = useHistoryStore(
    useShallow((state) => ({
      undoRecords: state.undoRecords,
      canRedo: state.canRedo,
      canUndo: state.canUndo,
      undo: state.undo,
      redo: state.redo,
      clear: state.clear
    })),
  );

  return (
    <div className="history-panel p-2 flex flex-col h-full">
      <div className="description rounded-xl flex items-center text-sm justify-between gap-2">
        <div className="flex items-center gap-2 w-[90%]">
          <Button variant="outline" size="sm" className="flex-1" disabled={!canUndo()} onClick={() => undo()}>
            <UndoDot className="size-3.5" />
            <span className="text-[12px] ml-1">撤销</span>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" disabled={!canRedo()} onClick={() => redo()}>
            <span className="text-[12px] ml-1">恢复</span>
            <RedoDot className="size-3.5" />
          </Button>
        </div>
        <ConfirmDialog
          description="历史记录清空后不可在恢复！"
          trigger={
            <Button variant="outline" size="sm" className="flex-1">
              <Trash2 className="size-3.5" />
              <span className="text-[12px]">清空</span>
            </Button>
          }
          onConfirm={() => clear()}
        ></ConfirmDialog>
      </div>
      <ScrollArea className="flex-1 min-h-0 mt-2">
        <div className="list flex flex-col gap-2">
          {undoRecords?.map((item, index) => (
            <div
              className={`item text-sm flex justify-between p-3 rounded-[4px] ${index === undoRecords.length - 1 ? 'bg-[#27272a]': ''} cursor-pointer`}
              key={item.id}
            >
              <div className="flex items-center gap-2 flex-1 ">
                <LaptopMinimalCheck className="size-4 shrink-0" />
                <span className="flex-1 text-ellipsis overflow-hidden whitespace-nowrap">
                  {item.title}
                </span>
              </div>
              <div className="time">{dayjs(item.timestamp).format('HH:mm:ss')}</div>
            </div>
          ))}
          {undoRecords?.length === 0 && <Empty description="暂无可撤销记录" />}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HistoryPanel;
