import { useDesignStore } from '@/store/modules/design';
import { ComponentSchema } from '@repo/core/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { Eye12Regular, EyeOff16Regular } from '@ricons/fluent';
import { ChevronDown, FolderClosed, FolderOpen, Lock, Unlock } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/ui/components/collapsible';
import { Button } from '@repo/ui/components/button';
import React, { useEffect } from 'react';

interface LayerItemProps {
  component: ComponentSchema;
  layerListModel: string;
  collapsibleItem?: Record<string, boolean>;
  setCollapsibleItem?: (
    newValue:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>),
  ) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const LayerItem = ({
  component,
  layerListModel,
  collapsibleItem,
  setCollapsibleItem,
  onContextMenu,
}: LayerItemProps) => {
  const selectedCmpIds = useDesignStore((state) => state.selectedCmpIds);
  const setSelectedCmpIds = useDesignStore((state) => state.setSelectedCmpIds);
  const addSelectedCmpIds = useDesignStore((state) => state.addSelectedCmpIds);
  const currentCmpId = useDesignStore((state) => state.currentCmpId);
  const setCurrentCmpId = useDesignStore((state) => state.setCurrentCmpId);
  const updateCurrentCmp = useDesignStore((state) => state.updateCurrentCmp);
  const hoverId = useDesignStore((state) => state.hoverId);
  const setHoverId = useDesignStore((state) => state.setHoverId);

  useEffect(() => {
    if (component.group && setCollapsibleItem) {
      setCollapsibleItem((prev: any) => {
        if (!prev?.[component.id]) {
          return { ...prev, [component.id]: true };
        }
        return prev;
      });
    }
  }, [component.id, component.group, setCollapsibleItem]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // 设置当前选中的组件
    if (!selectedCmpIds.includes(component.id)) {
      setCurrentCmpId(component.id);
      setSelectedCmpIds([component.id]);
    }
    
    // 调用父组件传入的处理函数
    onContextMenu?.(e);
  };

  if (component.group) {
    return (
      <div className="layer-item-group" onContextMenuCapture={handleContextMenu}>
        <Collapsible
          open={Boolean(collapsibleItem?.[component.id])}
          onOpenChange={(value) => {
            setCollapsibleItem?.((prev: any) => ({ ...prev, [component.id]: value }));
          }}
          className="flex flex-col gap-2"
        >
          <div 
            className={`flex items-center justify-between gap-4 px-2 py-1 rounded hover:bg-[#f4f4f5] hover:dark:bg-[#27272a] cursor-pointer ${component.id === currentCmpId || selectedCmpIds.includes(component.id) ? 'bg-[#f4f4f5] dark:bg-[#27272a]' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              if (e.shiftKey) {
                addSelectedCmpIds(component.id);
                setCurrentCmpId('');
              } else {
                setCurrentCmpId(component.id);
                setSelectedCmpIds([component.id]);
              }
            }}
          >
            <div className="flex gap-2 items-center text-sm">
              {Boolean(collapsibleItem?.[component.id]) ? <FolderOpen /> : <FolderClosed />}
              <span>{component.name}</span>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  setCollapsibleItem?.((prev: any) => {
                    const newState = { ...prev };
                    delete newState[component.id];
                    return newState;
                  });
                }}
              >
                <ChevronDown />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="flex flex-col gap-2 px-2">
            {component.children?.map((child) => {
              return (
                <LayerItem
                  component={child}
                  key={child.id}
                  layerListModel={layerListModel}
                  collapsibleItem={collapsibleItem}
                  setCollapsibleItem={setCollapsibleItem}
                />
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
  return (
    <div
      className={`layer-item rounded-[4px] text-left border flex hover:bg-[#f4f4f5] hover:dark:bg-[#27272a] cursor-pointer min-h-10 p-2 transition-all group justify-between ${component.id === currentCmpId || component.id === hoverId || selectedCmpIds.includes(component.id) ? 'bg-[#f4f4f5] dark:bg-[#27272a]' : ''} ${selectedCmpIds.includes(component.id) ? 'dark:border-gray-500 border-[#7b92f9]' : 'border-transparent'}`}
      onMouseEnter={() => setHoverId(component.id)}
      onMouseLeave={() => setHoverId('')}
      onClick={(e) => {
        e.preventDefault();
        if (e.shiftKey) {
          addSelectedCmpIds(component.id);
          setCurrentCmpId('');
        } else {
          setCurrentCmpId(component.id);
          setSelectedCmpIds([component.id]);
        }
      }}
      onContextMenuCapture={handleContextMenu}
    >
      <div className="layer-item-left flex items-center gap-2 w-[70%]">
        {layerListModel === 'image' && (
          <img
            src="https://vue.jeesite.com/js/visual/img/assets/bar.png"
            alt=""
            className="size-10 shrink-0 rounded-[4px] select-none border-2 border-gray-500"
          />
        )}
        <div
          className={`name select-none text-sm text-ellipsis whitespace-nowrap overflow-hidden flex-1 ${component.id === currentCmpId ? 'text-primary' : ''}`}
        >
          {component.name}
        </div>
      </div>
      <div className="layer-item-right flex items-center transition-all gap-2">
        <div
          className={`visible flex items-center opacity-${!component.visible ? '100' : '0'} group-hover:opacity-100`}
        >
          <Tooltip>
            <TooltipTrigger
              onClick={() => updateCurrentCmp({ ...component, visible: !component.visible })}
            >
              {component.visible ? (
                <Eye12Regular className="size-5" />
              ) : (
                <EyeOff16Regular className="size-5 text-primary" />
              )}
            </TooltipTrigger>
            <TooltipContent>{component.visible ? '隐藏' : '显示'}</TooltipContent>
          </Tooltip>
        </div>
        <div
          className={`lock flex items-center opacity-${component.lock ? '100' : '0'} group-hover:opacity-100`}
        >
          <Tooltip>
            <TooltipTrigger
              onClick={() => updateCurrentCmp({ ...component, lock: !component.lock })}
            >
              {component.lock ? (
                <Unlock className="size-4 text-primary" />
              ) : (
                <Lock className="size-4" />
              )}
            </TooltipTrigger>
            <TooltipContent>{component.lock ? '解锁' : '锁定'}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default LayerItem;
