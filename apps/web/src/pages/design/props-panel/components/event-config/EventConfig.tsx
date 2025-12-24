import MonacoEditor from '@repo/ui/components/monaco-editor';
import Select from '@/components/Select';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Label } from '@repo/ui/components/label';
import { CirclePlus, Save, Search, SquarePen, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import Empty from '@/components/Empty';
import { ScrollableTabs } from '@repo/ui/components/scrollable-tabs';
import { toast } from 'sonner';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@repo/ui/components/input-group';
import ChangeVariable from './ChangeVariable';
import NavToPage from './NavToPage';
import NavToLink from './NavToLink';
import FetchAPI from './FetchAPI';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion';

const actionType = [
  {
    label: '修改变量',
    type: '1',
  },
  {
    label: '跳转当前应用页面',
    type: '2',
  },
  {
    label: '跳转链接',
    type: '3',
  },
  {
    label: '请求接口',
    type: '4',
  },
];

const eventType: { type: EventType; label: string; actions?: ActionProps[] }[] = [
  {
    type: 'click',
    label: '单击事件',
  },
  {
    type: 'doubleClick',
    label: '双击事件',
  },
  {
    type: 'mouseenter',
    label: '鼠标移入事件',
  },
  {
    type: 'mouseleave',
    label: '鼠标移出事件',
  },
  {
    type: 'mounted',
    label: '页面挂载事件',
  },
  {
    type: 'unmounted',
    label: '页面卸载事件',
  },
];

const EventConfigDialog = ({
  events,
  setEvents,
  openType,
  icon,
  updateEvent,
}: {
  events: EventProps[];
  setEvents: (events: EventProps[]) => void;
  openType: 'create' | 'update';
  icon: React.ReactNode;
  updateEvent?: EventProps;
}) => {
  const cloneEvents = useRef(JSON.parse(JSON.stringify(events)) as EventProps[]); // 深拷贝的events随便改
  useEffect(() => {
    cloneEvents.current = JSON.parse(JSON.stringify(events)) as EventProps[];
  }, [events]);

  const [visible, setVisible] = useState(false);

  const [activeEvent, setActiveEvent] = useState<EventProps>({} as EventProps); // 当前选中的事件

  const handleChangeEvent = (item: EventProps) => {
    setActiveEvent(item);
  };

  const [actions, setActions] = useState<ActionProps[]>([] as ActionProps[]);
  const [activeAction, setActiveAction] = useState<ActionProps>({} as ActionProps); // 当前选中的动作

  const handleActionClose = (id: string) => {
    const newActions = actions.filter((action) => action.id !== id);
    setActions(newActions);
  };
  const handleChangeAction = (action: { label: string; type: string }) => {
    activeAction.type = action.type;
    activeAction.label = action.label;
    setActiveAction(activeAction);
    const existingAction = actions.find((a) => a.id === activeAction.id);
    if (existingAction) {
      Object.assign(existingAction, activeAction);
    }
    setActions([...actions]);
  };
  const handleAddAction = () => {
    const newAction: ActionProps = {
      id: Date.now().toString(),
      type: actionType[0].type,
      label: actionType.find((item) => item.type === '1')!.label,
    };
    setActions([...actions, newAction]);
    return newAction;
  };

  const [filterAction, setFilterAction] = useState('');

  const handleAddEvent = () => {
    const nextEvent = eventType.find((type) => !events.find((e) => e.type === type.type));
    if (events.length === eventType.length || !nextEvent) {
      toast.warning('暂无更多事件可以添加');
      return;
    }
    const newAction = handleAddAction();
    setActiveEvent(nextEvent);
    setActiveAction(newAction);
    setVisible(true);
  };

  const handleUpdateEvent = () => {
    if (updateEvent && updateEvent.actions) {
      setActiveEvent(updateEvent);
      setActions([...updateEvent.actions]);
      setActiveAction(updateEvent.actions[0] || ({} as ActionProps));
    }
    setVisible(true);
  };

  const handleSaveEvent = () => {
    activeEvent.actions = actions;
    const existingIndex = events.findIndex((e) => e.type === activeEvent.type);
    if (existingIndex !== -1) {
      const newEvents = [...events];
      newEvents[existingIndex] = activeEvent;
      setEvents(newEvents);
    } else {
      setEvents([...events, activeEvent]);
    }
  };
  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => (openType === 'create' ? handleAddEvent() : handleUpdateEvent())}
      >
        {icon}
      </Button>
      <DialogContent className="p-4 dark:bg-[#18181b] w-auto gap-4">
        <DialogHeader>
          <DialogTitle>事件配置</DialogTitle>
          <DialogDescription>通过选择事件并配置执行动作来为组件添加交互效果</DialogDescription>
        </DialogHeader>
        <div className="content w-[1200px]">
          <div className="flex">
            <div className="left border-r w-[25%] pr-4 flex flex-col shrink-0">
              <div className="event-list text-sm dark:bg-[#2c2c32] flex flex-col gap-1 p-2 rounded-[4px] border flex-1">
                <Label className="mb-2 text-gray-300">基础事件</Label>
                {eventType.map((item) => {
                  return (
                    <button
                      className={`pl-4 relative w-full text-left disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed transition-all rounded-[4px] duration-300 p-2 dark:hover:bg-[#3f3f45] hover:bg-gray-100  ${activeEvent?.type === item.type ? 'dark:bg-[#3f3f45]' : 'dark:hover:text-white'}`}
                      disabled={
                        !!events.find(
                          (event) => event.type === item.type && item.type !== activeEvent?.type,
                        )
                      }
                      key={item.type}
                      onClick={() => handleChangeEvent(item)}
                    >
                      {item.label}
                      {activeEvent?.type === item.type && (
                        <div className="line absolute top-0 left-0 h-full w-1 rounded-sm bg-primary"></div>
                      )}
                    </button>
                  );
                })}
                <Label className="my-2 text-gray-300">内置事件</Label>
                <button
                  className={`pl-4 relative w-full text-left disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed transition-all rounded-[4px] duration-300 p-2 dark:hover:bg-[#3f3f45] hover:bg-gray-100 `}
                >
                  选择完成
                  {/* {activeEvent?.type === item.type && (
                    <div className="line absolute top-0 left-0 h-full w-1 rounded-sm bg-primary"></div>
                  )} */}
                </button>
              </div>
            </div>
            <div className="right flex-1 pl-4 shrink-0 overflow-hidden">
              <ScrollableTabs
                tabs={actions || []}
                activeTab={activeAction.id}
                onTabChange={(id) => {
                  const action = actions.find((item) => item.id === id);
                  if (action) {
                    setActiveAction(action);
                  }
                }}
                onTabClose={handleActionClose}
                onAddTab={handleAddAction}
                showAddButton={true}
              />
              <>
                {actions && actions.length > 0 ? (
                  <div className="flex dark:bg-[#2c2c32] gap-1 p-2 rounded-[4px] border mt-4 h-[500px]">
                    <div className="left pr-4 border-r w-[30%] h-full flex flex-col gap-2">
                      <div className="filter-wrap">
                        <InputGroup className="h-[32px]">
                          <InputGroupInput
                            placeholder="请输入动作名称"
                            value={filterAction}
                            onChange={(e) => {
                              setFilterAction(e.target.value);
                            }}
                          />
                          <InputGroupAddon>
                            <Search />
                          </InputGroupAddon>
                        </InputGroup>
                      </div>
                      <div className="action-list text-sm">
                        {actionType.map((item) => {
                          return (
                            <button
                              className={`pl-4 relative w-full text-left disabled:opacity-50 disabled:pointer-events-none transition-all rounded-[4px] duration-300 p-2 dark:hover:bg-[#3f3f45] hover:bg-gray-100  ${activeAction?.type === item.type ? 'dark:bg-[#3f3f45]' : 'dark:hover:text-white'}`}
                              key={item.type}
                              onClick={() => handleChangeAction(item)}
                            >
                              {item.label}
                              {activeAction?.type === item.type && (
                                <div className="line absolute top-0 left-0 h-full w-1 rounded-sm bg-primary"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="right pl-4 flex-1">
                      {activeAction?.type === '1' && <ChangeVariable />}
                      {activeAction?.type === '2' && <NavToPage />}
                      {activeAction?.type === '3' && <NavToLink />}
                      {activeAction?.type === '4' && <FetchAPI />}
                    </div>
                  </div>
                ) : (
                  <Empty description="请添加执行动作" />
                )}
              </>
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-">
          <div className="operation flex gap-2">
            <DialogClose asChild>
              <Button size="sm" variant="outline">
                取消
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button size="sm" onClick={handleSaveEvent}>
                <Save />
                <span>保存</span>
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ActionProps {
  id: string;
  type: '1' | '2' | '3' | '4' | string;
  label: string;
}

type EventType = 'click' | 'doubleClick' | 'mouseenter' | 'mouseleave' | 'mounted' | 'unmounted';

interface EventProps {
  type: EventType;
  label: string;
  actions?: ActionProps[];
}
// 设置变量  使用变量  或者静态数据
const EventConfig = () => {
  const [eventList, setEventList] = useState<EventProps[]>([]);

  return (
    <div className="data-config-container flex flex-col gap-2">
      <div className="flex gap-2 justify-between">
        <Label>交互事件</Label>
        <EventConfigDialog
          events={eventList}
          setEvents={setEventList}
          openType="create"
          icon={<CirclePlus />}
        />
      </div>
      <ScrollArea className="flex-1 min-h-0">
        {eventList.length > 0 ? (
          <div className="flex flex-col gap-2">
            {eventList.map((item) => {
              return (
                <div className="item rounded-[4px] border w-full p-2 py-1 text-sm" key={item.label}>
                  <div className="info flex flex-col">
                    <div className="operation flex justify-between items-center">
                      <Label className="dark:text-gray-400">{item.label}</Label>
                      <div className="flex items-center">
                        <EventConfigDialog
                          events={eventList}
                          setEvents={setEventList}
                          openType="update"
                          icon={<SquarePen />}
                          updateEvent={item}
                        />
                        <Button size="sm" variant="ghost">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <div>{item.actions?.map((item) => item.label)?.join(',')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty description="暂未配置事件" />
        )}
      </ScrollArea>
    </div>
  );
};

export default EventConfig;
