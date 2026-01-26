'use client';

import * as React from 'react';
import { CirclePlus, Plus, X } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { ScrollArea, ScrollBar } from './scroll-area';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export interface TabItem {
  id: string;
  label: string;
  closable?: boolean;
}

export interface ScrollableTabsProps {
  tabs: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onAddTab?: () => void;
  showAddButton?: boolean;
  className?: string;
}

function ScrollableTabs({
  tabs,
  activeTab,
  onTabChange,
  onTabClose,
  onAddTab,
  showAddButton = true,
  className,
}: ScrollableTabsProps) {
  const handleTabClick = (tabId: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-close-button]')) {
      return;
    }
    onTabChange?.(tabId);
  };

  return (
    <div className={cn('flex h-9 items-center border-b border-[#3c3c3c] max-w-full', className)}>
      <ScrollArea className="flex-1 w-full overflow-auto">
        <div className="inline-flex h-9 items-center bg-muted text-muted-foreground rounded-tl-lg rounded-tr-lg p-1">
          {tabs.map((item) => (
            <div
              key={item.id}
              onClick={(e) => handleTabClick(item.id, e)}
              className={cn(
                'group relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer select-none',
                activeTab === item.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-foreground/60 hover:bg-background/50 hover:text-foreground',
              )}
            >
              <span>{item.label}</span>
              {item.closable !== false && (
                <button
                  data-close-button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose?.(item.id);
                  }}
                  className="ml-0.5 flex size-4 items-center justify-center rounded-sm hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          ))}
          {tabs.length === 0 && (
            <button
              data-close-button
              onClick={() => onAddTab?.()}
              className="ml-0.5 text-sm shrink-0 px-2 py-1 gap-1 flex items-center justify-center rounded-sm hover:bg-muted-foreground/20 transition-colors"
            >
              <span>添加动作</span>
              <CirclePlus className="size-3 shrink-0" />
            </button>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {showAddButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onAddTab?.()}
              className="flex h-full w-9 shrink-0 items-center justify-center border-l border-[#3c3c3c] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Plus className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <span>添加动作</span>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export { ScrollableTabs };
