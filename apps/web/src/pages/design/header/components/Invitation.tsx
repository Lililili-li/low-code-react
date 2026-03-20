import { useCollaborateStore, useUserStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar';
import { Button } from '@repo/ui/components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover';
import { Separator } from '@repo/ui/components/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { ChevronDown, Link2Off, UserPlus } from 'lucide-react';
import { useMemo } from 'react';

const collaborators: {
  id: string;
  name: string;
  role: string;
  permission: string;
  avatar?: string;
}[] = [
  {
    id: 'u46107686',
    name: 'lbc',
    role: '知识库管理员',
    permission: '可管理',
  },
  {
    id: 'u99887766',
    name: '哆哆嗦嗦啦啦嗦',
    role: '',
    permission: '可编辑',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  },
];

const Collaborate = () => {
  const user = useUserStore((state) => state.user);
  const isAuthor = true;
  const collaborator = useCollaborateStore((state) => state.collaborator);
  const connected = useCollaborateStore((state) => state.connected);
  const onlineUserVisibleQue = useMemo(() => {
    return collaborator.slice(0, 3);
  }, [collaborator]);

  return (
    <div className="flex items-center gap-2">
      <div className="avatars flex items-center gap-2">
        {onlineUserVisibleQue.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Avatar>
                <AvatarImage src={item.avatar || ''} alt={item.name} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.id === item.id ? '我' : item.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {collaborator.length > 3 && (
          <div className="flex gap-2 items-center text-xs">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-[50%] size-8">
                  +{collaborator.length - 3}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-3 max-w-[200px]" align="end">
                <div className="title mb-2 text-sm font-medium">参与协作者</div>
                {collaborator.slice(3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="name text-xs ">{item.name}</div>
                    <Avatar>
                      <AvatarImage src={item.avatar || ''} alt={item.name} />
                    </Avatar>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        )}
        {!connected && (
          <div className="flex gap-2 items-center text-xs">
            <span>连接失败</span>
            <Link2Off className="size-4 " />
          </div>
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            <UserPlus className="size-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={10} className="w-[460px] border p-0">
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="text-[15px] font-semibold tracking-[0.02em] text-white">团队成员</div>
          </div>

          <div className="px-4">
            {collaborators.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-start justify-between gap-4 py-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar className="mt-0.5 size-11 ring-1 ring-white/10">
                      <AvatarImage src={item.avatar} alt={item.name} />
                      <AvatarFallback className="bg-white/12 text-sm text-white">
                        {connected ? item.name.slice(0, 1) : '正在连接中...'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-medium text-white">{item.name}</div>
                      <div className="truncate text-sm text-white/40">({item.id})</div>
                      <div className="mt-1 text-sm text-white/72">
                        {item.role ? item.role : '项目协作者'}
                      </div>
                    </div>
                  </div>
                  {isAuthor ? (
                    <div>
                      <span className="text-sm text-white/72">可管理</span>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="h-auto shrink-0 gap-1 rounded-lg px-0 py-0 text-[15px] font-medium text-white/88 hover:bg-transparent hover:text-white"
                    >
                      {item.permission}
                      <ChevronDown className="size-4 text-white/60" />
                    </Button>
                  )}
                </div>
                {index < collaborators.length - 1 ? <Separator className="bg-white/6" /> : null}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Collaborate;
