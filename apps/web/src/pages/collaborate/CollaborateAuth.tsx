import { parseQuery } from '@/composable/use-query'
import { useUserStore } from '@/store/user'
import { parseShareToken } from '@repo/shared/token'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar'
import { LoaderCircle, Sparkles } from 'lucide-react'

const CollaborateAuth = () => {
  const query = parseQuery<{ token: string }>()
  const token = parseShareToken(query?.token || '')
  const user = useUserStore((state) => state.user)

  const displayName = user.user_name || user.account || '协作者'
  const avatarFallback = displayName.slice(0, 1).toUpperCase()
  const roleText = token?.role === 'editor' ? '可编辑权限' : '访问权限'

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_28%)]" />

      <div className="relative flex min-h-screen flex-col">
        <div className="flex justify-end px-6 pt-6">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-3 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.28)] backdrop-blur-md">
            <Avatar className="size-9 border border-white/10">
              <AvatarImage src={user.avatar || ''} alt={displayName} />
              <AvatarFallback className="bg-white/12 text-sm text-white">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="max-w-[140px] truncate text-sm font-medium text-white">
                {displayName}
              </div>
              <div className="text-xs text-slate-300">正在进入协作空间</div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-white/8 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.42)] backdrop-blur-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-sm text-sky-100">
              <Sparkles className="size-4" />
              协作权限处理中
            </div>

            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <LoaderCircle className="size-6 animate-spin text-sky-300" />
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold tracking-[0.01em] text-white">
                  正在为你接入页面协作
                </h1>
                <p className="text-sm leading-6 text-slate-300">
                  我们已经收到加入请求，正在校验身份并同步
                  {roleText}
                  。如果当前网络较慢，这个页面会短暂显示，请耐心等待，成功后会自动跳转。
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  当前状态
                </div>
                <div className="mt-2 text-sm font-medium text-slate-100">
                  正在申请协作权限
                </div>
                <div className="mt-1 text-xs leading-5 text-slate-400">
                  接口返回后会自动完成加入，无需手动刷新页面。
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  预计体验
                </div>
                <div className="mt-2 text-sm font-medium text-slate-100">
                  正常情况下仅停留数秒
                </div>
                <div className="mt-1 text-xs leading-5 text-slate-400">
                  若等待时间较长，请保持页面开启，等待系统继续处理。
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              页面会在协作关系创建成功后自动跳转
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollaborateAuth