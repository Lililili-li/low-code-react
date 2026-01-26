/**
 * 侧边栏分类菜单
 */

import React from 'react';

interface MenuItem {
  value: string | number;
  label: string | React.ReactNode;
}

interface TabMenuProps {
  items: MenuItem[];
  activeId?: string | number;
  onSelect?: (id: string | number) => void;
  itemClassName?: string;
}

const TabMenu: React.FC<TabMenuProps> = ({
  items,
  activeId,
  onSelect,
  itemClassName,
}) => {
  return (
    <div className={`flex flex-col text-sm`}>
      {items.map((item) => (
        <div
          key={item.value}
          className={`relative p-2 rounded-[4px] cursor-pointer flex items-center transition-colors ${activeId === item.value ? 'text-blue-500 bg-blue-500/10' : 'dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-white/5'}  ${itemClassName}`}
          onClick={() => onSelect?.(item.value)}
        >
          {activeId === item.value && (
            <div className="absolute left-0 top-1/2 w-1 h-[50%] -translate-y-1/2 bg-blue-500 rounded-r" />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default TabMenu;
