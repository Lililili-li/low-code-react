'use client';

import * as React from 'react';
import { ChevronRightIcon, FileIcon, FolderIcon } from 'lucide-react';

import { cn } from '@repo/ui/lib/utils';

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  [key: string]: any;
}

interface TreeContextValue {
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}

const TreeContext = React.createContext<TreeContextValue | null>(null);

function useTreeContext() {
  const context = React.useContext(TreeContext);
  if (!context) {
    throw new Error('Tree components must be used within a Tree');
  }
  return context;
}

interface TreeProps {
  data: TreeNode[];
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelect?: (id: string) => void;
  defaultExpandedIds?: string[];
  className?: string;
}

function Tree({
  data,
  selectedId: controlledSelectedId,
  defaultSelectedId = null,
  onSelect,
  defaultExpandedIds = [],
  className,
}: TreeProps) {

  const [internalSelectedId, setInternalSelectedId] = React.useState<string | null>(
    defaultSelectedId,
  );
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set(defaultExpandedIds));

  const isControlled = controlledSelectedId !== undefined;
  const selectedId = isControlled ? controlledSelectedId : internalSelectedId;

  const handleSelect = React.useCallback(
    (id: string) => {
      if (!isControlled) {
        setInternalSelectedId(id);
      }
      onSelect?.(id);
    },
    [isControlled, onSelect],
  );

  const handleToggleExpand = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const contextValue = React.useMemo<TreeContextValue>(
    () => ({
      selectedId,
      onSelect: handleSelect,
      expandedIds,
      onToggleExpand: handleToggleExpand,
    }),
    [selectedId, handleSelect, expandedIds, handleToggleExpand],
  );

  return (
    <TreeContext.Provider value={contextValue}>
      <div data-slot="tree" className={cn('text-sm', className)} role="tree">
        <TreeNodeList nodes={data} level={0} />
      </div>
    </TreeContext.Provider>
  );
}

interface TreeNodeListProps {
  nodes: TreeNode[];
  level: number;
}

function TreeNodeList({ nodes, level }: TreeNodeListProps) {
  return (
    <div data-slot="tree-node-list" role="group">
      {nodes.map((node) => (
        <TreeItem key={node.id} node={node} level={level} />
      ))}
    </div>
  );
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
}

function TreeItem({ node, level }: TreeItemProps) {
  const { selectedId, onSelect, expandedIds, onToggleExpand } = useTreeContext();

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const handleClick = () => {
    if (hasChildren) {
      onToggleExpand(node.id);
    } else {
      onSelect(node.id);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (hasChildren) {
        onToggleExpand(node.id);
      } else {
        onSelect(node.id);
      }
    }
    if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
      e.preventDefault();
      onToggleExpand(node.id);
    }
    if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
      e.preventDefault();
      onToggleExpand(node.id);
    }
  };

  // const defaultIcon = <FolderIcon className="size-4 shrink-0 text-muted-foreground" />;
  const defaultIcon = hasChildren ? (
    <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
  ) : (
    <FileIcon className="size-4 shrink-0 text-muted-foreground" />
  )

  return (
    <div data-slot="tree-item">
      <div
        role="treeitem"
        tabIndex={0}
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer outline-none transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          !hasChildren && isSelected && 'bg-accent text-accent-foreground font-bold',
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={handleToggle}
            className="p-0.5 -ml-1 rounded hover:bg-muted"
            tabIndex={-1}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRightIcon
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                isExpanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span className="w-5" />
        )}
        {node.icon ?? defaultIcon}
        <span className="truncate">{node.name}</span>
      </div>
      {hasChildren && isExpanded && <TreeNodeList nodes={node.children!} level={level + 1} />}
    </div>
  );
}

export { Tree, type TreeProps };
