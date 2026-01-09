import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import Empty from '@/components/Empty';

export interface TreeTableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  width?: string | number;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TreeTableDataNode<T = any> {
  key: string;
  [key: string]: any;
  children?: TreeTableDataNode<T>[];
  isLeaf?: boolean;
}

export interface TreeTableProps<T = any> {
  columns: TreeTableColumn<T>[];
  dataSource: TreeTableDataNode<T>[];
  defaultExpandedKeys?: string[];
  onExpand?: (expanded: boolean, record: TreeTableDataNode<T>) => void;
  loadData?: (record: TreeTableDataNode<T>) => Promise<void>;
  className?: string;
  rowClassName?: string | ((record: TreeTableDataNode<T>, index: number) => string);
}

export const TreeTable = <T extends Record<string, any>>({
  columns,
  dataSource,
  defaultExpandedKeys = [],
  onExpand,
  loadData,
  className,
  rowClassName,
}: TreeTableProps<T>) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(defaultExpandedKeys));
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

  const handleExpand = async (record: TreeTableDataNode<T>) => {
    const key = record.key;
    const isExpanded = expandedKeys.has(key);
    const newExpandedKeys = new Set(expandedKeys);

    if (isExpanded) {
      newExpandedKeys.delete(key);
      setExpandedKeys(newExpandedKeys);
      onExpand?.(false, record);
    } else {
      if (loadData && !record.children) {
        setLoadingKeys(new Set(loadingKeys).add(key));
        try {
          await loadData(record);
        } finally {
          setLoadingKeys((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }
      }
      newExpandedKeys.add(key);
      setExpandedKeys(newExpandedKeys);
      onExpand?.(true, record);
    }
  };

  const renderRows = (data: TreeTableDataNode<T>[], level: number = 0): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];

    data.forEach((record, index) => {
      const isExpanded = expandedKeys.has(record.key);
      const isLoading = loadingKeys.has(record.key);
      const hasChildren = record.children && record.children.length > 0;
      const canExpand = !record.isLeaf && (hasChildren || loadData);

      const rowClass =
        typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName;

      rows.push(
        <tr
          key={record.key}
          className={cn('border-b border-border hover:bg-muted/50 transition-colors', rowClass)}
        >
          {columns.map((column, colIndex) => {
            const value = column.dataIndex ? record[column.dataIndex] : record;
            const content = column.render
              ? column.render(value, record as unknown as T, index)
              : value;

            return (
              <td
                key={column.key}
                className={cn('px-4 py-3 text-sm', colIndex === 0 && 'font-medium')}
                style={{
                  width: column.width,
                  paddingLeft: colIndex === 0 ? `${level * 24 + 16}px` : undefined,
                }}
              >
                {colIndex === 0 && (
                  <div className="flex items-center gap-2">
                    {canExpand ? (
                      <button
                        onClick={() => handleExpand(record)}
                        className="inline-flex items-center justify-center w-4 h-4 hover:bg-accent rounded transition-colors"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <span className="w-4" />
                    )}
                    <span>{content}</span>
                  </div>
                )}
                {colIndex !== 0 && content}
              </td>
            );
          })}
        </tr>,
      );

      if (isExpanded && hasChildren) {
        rows.push(...renderRows(record.children!, level + 1));
      }
    });

    return rows;
  };

  return (
    <div className={cn('w-full ', className)}>
      <table className="w-full border-collapse">
        <thead className="bg-muted">
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
      </table>
      <ScrollArea className="h-[calc(100vh-150px)] w-full">
        <table className="w-full border-collapse">
          <tbody>{renderRows(dataSource)}</tbody>
        </table>
        {dataSource.length === 0 && <Empty description="暂无数据" />}
      </ScrollArea>
    </div>
  );
};
