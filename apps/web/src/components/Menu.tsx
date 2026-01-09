import * as React from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

interface MenuProps {
  items: MenuItem[];
  defaultOpenKeys?: string[];
  className?: string;
  activeKey?: string;
  onSelect?: (key: string) => void;
}

export function Menu({ items, defaultOpenKeys = [], className, activeKey, onSelect }: MenuProps) {
  const location = useLocation();
  const [openKeys, setOpenKeys] = React.useState<string[]>(defaultOpenKeys);

  // 查找包含当前路径的父级菜单 key
  const findActiveParentKeys = React.useCallback(
    (menuItems: MenuItem[], parentKeys: string[] = []): string[] => {
      for (const item of menuItems) {
        if (item.path === location.pathname) {
          return parentKeys;
        }
        if (item.children) {
          const found = findActiveParentKeys(item.children, [...parentKeys, item.key]);
          if (found.length > 0) {
            return found;
          }
        }
      }
      return [];
    },
    [location.pathname],
  );

  // 路由变化时自动展开包含选中项的父级菜单
  React.useEffect(() => {
    const activeParentKeys = findActiveParentKeys(items);
    if (activeParentKeys.length > 0) {
      setOpenKeys((prev) => {
        const newKeys = new Set([...prev, ...activeParentKeys]);
        return Array.from(newKeys);
      });
    }
  }, [location.pathname, items, findActiveParentKeys]);

  const toggle = (key: string) => {
    setOpenKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const isActive = (item: MenuItem): boolean => {
    if (item.path && location.pathname === item.path) return true;
    if (item.children) return item.children.some(isActive);
    if (activeKey === item.key) return true;
    return false;
  };

  const renderItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const open = openKeys.includes(item.key);
    const active = isActive(item);

    const content = (
      <div
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer select-none transition-colors',
          depth > 0 && 'pl-8',
          hasChildren
            ? active
              ? 'text-[#3c7eff] font-medium hover:bg-[#e8e9eb] hover:text-[#3c7eff] dark:hover:bg-[#333333]'
              : 'text-muted-foreground hover:bg-[#e8e9eb] hover:text-foreground dark:hover:bg-[#333333]'
            : active
              ? 'bg-[#e8e9eb] text-[#3c7eff] font-medium hover:bg-[#dfe0e3] hover:text-[#3c7eff] dark:bg-[#2a2a2a] dark:hover:bg-[#333333]'
              : 'text-muted-foreground hover:bg-[#e8e9eb] hover:text-foreground dark:hover:bg-[#333333]',
        )}
        onClick={() => {
          if (hasChildren) {
            toggle(item.key);
          } else if (onSelect && activeKey) {
            onSelect(item.key);
          }
        }}
      >
        {item.icon && (
          <span className="shrink-0 flex justify-center items-center">{item.icon}</span>
        )}
        <span className="flex-1 truncate">{item.label}</span>
        {hasChildren && (
          <ChevronDown
            className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')}
          />
        )}
      </div>
    );

    return (
      <li key={item.key}>
        {item.path && !hasChildren ? <Link to={item.path}>{content}</Link> : <span>{content}</span>}
        {hasChildren && open && (
          <ul className="mt-1 space-y-1">
            {item.children!.map((child) => renderItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className={cn('w-full min-w-[220px] p-3', className)}>
      <ul className="space-y-1">{items.map((item) => renderItem(item))}</ul>
    </nav>
  );
}
