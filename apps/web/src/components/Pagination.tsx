/**
 *  封装思路
 *  总页数 > 7时 如下
    当前页 为总页数-3时 只显示左侧省略号 省略号下拉选择为 1页到当前页-2
    当前页 为1-4时 只显示右侧省略号 省略号下拉为当前页数+2 到总页数-1
    当前页 为4-总页数-3时 显示两侧省略号 右侧省略号下拉为总页数-当前页数 - 2 + 当前页数 左侧省略号下拉为 当前页数-2 + 1

    总页数<=7时 只显示数量
 */

import { Button } from '@repo/ui/components/button';
import {
  Pagination as ShaPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@repo/ui/components/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Toggle } from '@repo/ui/components/toggle';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FC, useCallback } from 'react';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';

interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  onSizeChange?: (size: number) => void;
  onPageChange?: (page: number) => void;
}

const MoreSelect = ({
  totalPageList,
  handlePageChange,
}: {
  totalPageList: number[];
  handlePageChange: (page: number) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-[32px]">
          <PaginationEllipsis className="cursor-pointer" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[60px]" style={{ minWidth: 'auto' }}>
        <ScrollArea className="max-h-[200px]">
          {totalPageList.map((page) => (
            <DropdownMenuItem
              key={page}
              onClick={() => handlePageChange(page)}
              className="cursor-pointer"
            >
              {page}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const PageItem = ({
  totalPageList,
  handlePageChange,
  currentPage,
}: {
  totalPageList: number[];
  handlePageChange: (page: number) => void;
  totalPage: number;
  currentPage: number;
}) => {
  return (
    <>
      {totalPageList.map((page) => (
        <Toggle
          variant="default"
          size="sm"
          className={`text-[16px] `}
          pressed={page === currentPage}
          key={page}
          onClick={() => handlePageChange(page)}
        >
          <span className={`${page === currentPage ? 'text-primary' : ''}`}>{page}</span>
        </Toggle>
      ))}
    </>
  );
};

const Pagination: FC<PaginationProps> = (props) => {
  const {
    currentPage = 1,
    pageSize = 10,
    total = 0,
    showSizeChanger = false,
    showQuickJumper = false,
    onSizeChange,
    onPageChange,
    ...rest
  } = props;

  const totalPage = Math.ceil(total / pageSize) || 1;
  const totalPageList = Array.from({ length: totalPage }, (_, index) => index + 1);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage) return;
      onPageChange?.(page);
    },
    [onPageChange],
  );
  return (
    <ShaPagination className={rest.className} {...rest}>
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft style={{ width: '20px', height: '20px' }} />
          </Button>
        </PaginationItem>
        <PaginationItem>
          <div className="flex gap-2 items-center">
            {totalPage <= 7 && (
              <PageItem
                totalPageList={totalPageList}
                handlePageChange={handlePageChange}
                totalPage={totalPage}
                currentPage={currentPage}
              />
            )}
            {totalPage > 7 &&
              (currentPage >= totalPage - 3 ? (
                <>
                  <PageItem
                    totalPageList={totalPageList.filter((page) => page === 1)}
                    handlePageChange={handlePageChange}
                    totalPage={totalPage}
                    currentPage={currentPage}
                  />
                  <MoreSelect
                    totalPageList={totalPageList.filter(
                      (page) => page <= totalPageList.length - 5 && page > 1,
                    )}
                    handlePageChange={handlePageChange}
                  />
                  <PageItem
                    totalPageList={totalPageList.filter((page) => page >= totalPage - 4)}
                    handlePageChange={handlePageChange}
                    totalPage={totalPage}
                    currentPage={currentPage}
                  />
                </>
              ) : currentPage <= 4 && currentPage >= 1 ? (
                <>
                  <PageItem
                    totalPageList={totalPageList.filter((page) => page <= 5)}
                    handlePageChange={handlePageChange}
                    totalPage={totalPage}
                    currentPage={currentPage}
                  />
                  <MoreSelect
                    totalPageList={totalPageList.filter(
                      (page) => page <= totalPageList.length - 1 && page >= 4 + 2,
                    )}
                    handlePageChange={handlePageChange}
                  />
                  <PageItem
                    totalPageList={totalPageList.filter((page) => page === totalPageList.length)}
                    handlePageChange={handlePageChange}
                    totalPage={totalPage}
                    currentPage={currentPage}
                  />
                </>
              ) : (
                <>
                  <PageItem
                    totalPageList={totalPageList.filter((page) => page === 1)}
                    handlePageChange={handlePageChange}
                    totalPage={totalPage}
                    currentPage={currentPage}
                  />
                  <MoreSelect
                    totalPageList={totalPageList.filter(
                      (page) => page <= currentPage - 2 && page > 1,
                    )}
                    handlePageChange={handlePageChange}
                  />
                  <PageItem
                    totalPageList={totalPageList.filter(
                      (page) =>
                        page === currentPage - 1 ||
                        page === currentPage + 1 ||
                        page === currentPage,
                    )}
                    handlePageChange={handlePageChange}
                    totalPage={totalPage}
                    currentPage={currentPage}
                  />
                  <MoreSelect
                    totalPageList={totalPageList.filter(
                      (page) => page <= totalPageList.length - 1 && page >= currentPage + 2,
                    )}
                    handlePageChange={handlePageChange}
                  />
                  <PageItem
                    totalPageList={totalPageList.filter((page) => page === totalPageList.length)}
                    handlePageChange={handlePageChange}
                    totalPage={totalPage}
                    currentPage={currentPage}
                  />
                </>
              ))}
          </div>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPage}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight style={{ width: '20px', height: '20px' }} />
          </Button>
        </PaginationItem>
        {showSizeChanger && (
          <PaginationItem>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onSizeChange?.(Number(value))}
            >
              <SelectTrigger
                className="w-[100px] h-[36px] group justify-between"
                style={{ height: 32 }}
                allowClear={false}
              >
                <div className="flex items-center gap-2 justify-between flex-1 relative">
                  <SelectValue placeholder="每页10条" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={'10'}>每页10条</SelectItem>
                  <SelectItem value={'20'}>每页20条</SelectItem>
                  <SelectItem value={'50'}>每页50条</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </PaginationItem>
        )}
      </PaginationContent>
    </ShaPagination>
  );
};

export default Pagination;
