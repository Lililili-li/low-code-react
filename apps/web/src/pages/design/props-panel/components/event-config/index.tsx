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
import { CirclePlus, Save, Search, SquarePen, Trash2, TriangleAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import Empty from '@/components/Empty';
import { ScrollableTabs } from '@repo/ui/components/scrollable-tabs';
import { toast } from 'sonner';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@repo/ui/components/input-group';
import ChangeVariable from './ChangeVariable';
import NavToPage from './NavToPage';
import NavToLink from './NavToLink';
import FetchAPI from './FetchAPI';
import { useDesignComponentsStore } from '@/store/design/components';
import { cloneDeep } from 'lodash-es';
import { ActionSchema, DataType, EventSchema, EventType } from '@repo/core/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';

const actionType = [
  {
    label: '修改变量',
    type: 'changeVariable',
  },
  {
    label: '跳转当前应用页面',
    type: 'navToPage',
  },
  {
    label: '跳转链接',
    type: 'navToLink',
  },
  {
    label: '请求接口',
    type: 'fetchAPI',
  },
];


const EventConfigDialog = ({
  eventType,
  events,
  openType,
  trigger,
  currentEvent,
  onSave,
}: {
  eventType: {
    common: { type: string; label: string }[];
    internal: { type: string; label: string }[];
  };
  events: EventSchema[];
  openType: 'create' | 'update';
  trigger: React.ReactNode;
  currentEvent: EventSchema;
  onSave: (event: EventSchema) => void;
}) => {
  const [visible, setVisible] = useState(false);

  const [activeEvent, setActiveEvent] = useState({} as { label: string; type: string }); // 当前选中的事件

  const [performAction, setPerformAction] = useState<ActionSchema>({
    changeVariable: `function ChangeVariable(event, state) {
  console.log('ChangeVariable called with state:', state);
}`,
    navToPage: {
      pageId: '',
      delay: 0,
      linkParams: [
        {
          key: '',
          value: '',
          dataType: DataType.Normal,
        },
      ],
    },
    navToLink: {
      linkUrl: '',
      isBlank: false,
      delay: 0,
      linkParams: [
        {
          key: '',
          value: '',
          dataType: DataType.Normal,
        },
      ],
    },
    fetchAPI: {
      datasourceId: [],
    },
  });

  const handleChangeEvent = (item: { label: string; type: string }) => {
    setActiveEvent({ label: item.label, type: item.type });
  };

  const [actionTabs, setActionTabs] = useState<EventSchema['actions']>(
    [] as EventSchema['actions'],
  );
  const [activeAction, setActiveAction] = useState<{ type: string; label: string }>(
    {} as { type: string; label: string },
  ); // 当前选中的动作

  const handleActionClose = (type: string) => {
    const newActions = actionTabs.filter((action) => action.type !== type);
    setActionTabs(newActions);
    if (type === activeAction.type) {
      setActiveAction({ type: newActions[0].type, label: newActions[0].label });
    }
  };
  const handleChangeAction = (action: { label: string; type: string }) => {
    setActiveAction({ type: action.type, label: action.label });
    const existingAction = actionTabs.find((a) => a.type === action.type);
    if (!existingAction) {
      handleAddAction(action);
    }
  };

  const handleAddAction = (action?: { label: string; type: string }) => {
    const nextAction =
      actionType.find((item) => !actionTabs.some((a) => a.type === item.type)) || actionType[0];
    const newAction: { id: string; type: string; value: ActionSchema; label: string } = {
      id: Date.now().toString(),
      type: action?.type || nextAction.type,
      value: {
        changeVariable: '',
      },
      label: action?.label || nextAction.label,
    };
    if (actionTabs.length >= actionType.length) {
      toast.warning('暂无更多动作可以添加');
      return;
    }
    setActionTabs([...actionTabs, newAction]);
    setActiveAction({ type: newAction.type, label: newAction.label });
    return newAction;
  };

  const [filterAction, setFilterAction] = useState('');

  const handleAddEvent = () => {
    const nextEventType = eventType.common.find(
      (item) => !events.find((e) => e.type === item.type),
    );
    if (!nextEventType) {
      toast.warning('暂无更多事件可以添加');
      return;
    }
    setActiveEvent({ label: nextEventType.label, type: nextEventType.type });
    const newAction = handleAddAction();
    if (newAction) {
      setActiveAction(newAction);
    }
    setVisible(true);
  };

  const handleUpdateEvent = () => {
    setActionTabs(currentEvent.actions);
    setActiveEvent({ label: currentEvent.name, type: currentEvent.type });
    setActiveAction(
      currentEvent.actions[0] || ({} as { label: string; type: string; value: ActionSchema }),
    );
    setVisible(true);
  };

  const handleSaveEvent = () => {
    const newActionTabs = cloneDeep(actionTabs);
    newActionTabs.forEach((action) => {
      action.value = performAction[action.type as keyof ActionSchema] as any;
    });
    if (currentEvent.id) {
      onSave({
        ...currentEvent,
        name: activeEvent.label,
        type: activeEvent.type as EventType,
        actions: newActionTabs,
      });
    } else {
      const newEvent = {
        id: Date.now().toString(),
        name: activeEvent.label,
        type: activeEvent.type as EventType,
        actions: newActionTabs,
        active: true,
      };
      onSave(newEvent);
    }
    setActionTabs([]);
    setVisible(false);
  };

  useEffect(() => {
    if (currentEvent) {
      const actionMap: Record<string, ActionSchema> = {};
      currentEvent?.actions?.forEach((item) => {
        actionMap[item.type] = item.value;
      });
      setPerformAction({
        ...performAction,
        ...actionMap,
      });
    }
  }, [currentEvent]);
  return (
    <Dialog
      open={visible}
      onOpenChange={() => {
        setActionTabs([]);
        setVisible(false);
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => (openType === 'create' ? handleAddEvent() : handleUpdateEvent())}
      >
        {trigger}
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
                {eventType.common.map((item) => {
                  return (
                    <button
                      className={`pl-4 relative w-full text-left disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed transition-all rounded-[4px] duration-300 p-2 dark:hover:bg-[#3f3f45] hover:bg-gray-100  ${activeEvent?.type === item.type ? 'dark:bg-[#3f3f45]' : 'dark:hover:text-white'}`}
                      disabled={
                        currentEvent.id
                          ? !!events.find(
                              (event) =>
                                event.type === item.type && item.type !== currentEvent?.type,
                            )
                          : !!events.find(
                              (event) =>
                                event.type === item.type && item.type !== activeEvent?.type,
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
                {eventType.internal && eventType.internal.length > 0 && (
                  <Label className="my-2 text-gray-300">内置事件</Label>
                )}
                {eventType.internal &&
                  eventType.internal.map((item) => {
                    return (
                      <button
                        className={`pl-4 relative w-full text-left disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed transition-all rounded-[4px] duration-300 p-2 dark:hover:bg-[#3f3f45] hover:bg-gray-100  ${activeEvent?.type === item.type ? 'dark:bg-[#3f3f45]' : 'dark:hover:text-white'}`}
                        disabled={
                          currentEvent.id
                            ? !!events.find(
                                (event) =>
                                  event.type === item.type && item.type !== currentEvent?.type,
                              )
                            : !!events.find(
                                (event) =>
                                  event.type === item.type && item.type !== activeEvent?.type,
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
              </div>
            </div>
            <div className="right flex-1 pl-4 shrink-0 overflow-hidden">
              <ScrollableTabs
                tabs={
                  actionTabs.map((item) => ({
                    id: item.type,
                    label: item.label,
                    closable: true,
                  })) || []
                }
                activeTab={activeAction.type}
                onTabChange={(id) => {
                  const action = actionTabs.find((item) => item.type === id);
                  if (action) {
                    setActiveAction(action);
                  }
                }}
                onTabClose={handleActionClose}
                onAddTab={handleAddAction}
                showAddButton={true}
              />
              <>
                {actionTabs && actionTabs.length > 0 ? (
                  <div className="flex dark:bg-[#2c2c32] gap-1 p-2 rounded-[4px] border mt-4 h-[500px]">
                    <div className="left pr-4 border-r w-[30%] h-full flex flex-col gap-2 shrink-0">
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
                      <div className="action-list text-sm flex flex-col gap-1">
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
                      {activeAction?.type === 'changeVariable' && (
                        <ChangeVariable
                          value={performAction.changeVariable || ''}
                          onValueChange={(value) =>
                            setPerformAction((prev) => ({ ...prev, changeVariable: value }))
                          }
                        />
                      )}
                      {activeAction?.type === 'navToPage' && (
                        <NavToPage
                          value={performAction.navToPage}
                          onValueChange={(value) =>
                            setPerformAction({
                              ...performAction,
                              navToPage: value,
                            })
                          }
                        />
                      )}
                      {activeAction?.type === 'navToLink' && (
                        <NavToLink
                          value={performAction.navToLink || ({} as ActionSchema['navToLink'])}
                          onValueChange={(value) =>
                            setPerformAction({
                              ...performAction,
                              navToLink: value,
                            })
                          }
                        />
                      )}
                      {activeAction?.type === 'fetchAPI' && (
                        <FetchAPI
                          value={performAction.fetchAPI?.datasourceId || []}
                          onValueChange={(value: string[]) => {
                            setPerformAction({
                              ...performAction,
                              fetchAPI: { datasourceId: value },
                            });
                          }}
                        />
                      )}
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
            <Button size="sm" onClick={handleSaveEvent}>
              <Save />
              <span>保存</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 设置变量  使用变量  或者静态数据
const EventConfig = ({ selectEvents }: { selectEvents: { type: string; label: string }[] }) => {
  const events = useDesignComponentsStore(
    (state) => state.components.find((item) => item.id === state.currentCmpId)?.events,
  );
  const addCurrentCmpEvents = useDesignComponentsStore((state) => state.addCurrentCmpEvents);
  const updateCurrentCmpEvents = useDesignComponentsStore((state) => state.updateCurrentCmpEvents);
  const removeCurrentCmpEvents = useDesignComponentsStore((state) => state.removeCurrentCmpEvents);

  const eventType = {
    common: [
      {
        type: 'click',
        label: '单击事件',
      },
      {
        type: 'doubleClick',
        label: '双击事件',
      },
      {
        type: 'mouseEnter',
        label: '鼠标移入事件',
      },
      {
        type: 'mouseLeave',
        label: '鼠标移出事件',
      },
      {
        type: 'mounted',
        label: '组件挂载事件',
      },
      {
        type: 'unmounted',
        label: '组件卸载事件',
      },
    ],
    internal: selectEvents,
  };

  return (
    <div className="data-config-container flex flex-col gap-2 px-2">
      <div className="flex gap-2 justify-between">
        <Label>交互事件</Label>
        <EventConfigDialog
          eventType={eventType}
          events={events || []}
          openType="create"
          trigger={<CirclePlus />}
          currentEvent={{} as EventSchema}
          onSave={(event) => {
            addCurrentCmpEvents(event);
          }}
        />
      </div>
      <ScrollArea className="flex-1 min-h-0">
        {events && events?.length > 0 ? (
          <div className="flex flex-col gap-2">
            {events?.map((item) => {
              return (
                <div className="item rounded-[4px] border w-full p-2 py-1 text-sm" key={item.id}>
                  <div className="info flex flex-col">
                    <div className="operation flex justify-between items-center">
                      <Label className="dark:text-gray-400 text-[16px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Checkbox
                              checked={item.active}
                              onCheckedChange={(value) => {
                                updateCurrentCmpEvents({ ...item, active: value as boolean });
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>启用事件</TooltipContent>
                        </Tooltip>
                        <span>{item.name}</span>
                      </Label>
                      <div className="flex items-center">
                        <EventConfigDialog
                          eventType={eventType}
                          events={events}
                          openType="update"
                          trigger={<SquarePen />}
                          currentEvent={item}
                          onSave={(event) => {
                            updateCurrentCmpEvents(event);
                          }}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex gap-2 items-center">
                                <TriangleAlert className="text-amber-500 size-4" />
                                删除事件
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除选中的事件吗？
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  removeCurrentCmpEvents(item.id);
                                }}
                              >
                                确定
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap text-[12px] mt-1">
                      {item.actions?.map((action) => (
                        <div
                          className="rounded-[4px] border p-1 border-primary text-primary"
                          key={action.type}
                        >
                          {action.label}
                        </div>
                      ))}
                    </div>
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
