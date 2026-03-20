import { ArrowLeft, LayoutDashboard, LockKeyhole, ShieldAlert } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { Button } from '@repo/ui/components/button'
import ThemeToggle from '@/components/ThemeToggle'

const Forbidden = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const fullPath = `${location.pathname}${location.search}`

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.15),transparent_28%)]" />
      <div className="absolute -left-32 top-16 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-rose-500/15 blur-3xl" />

      <div className="relative flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-sm font-medium">Access Control</div>
              <div className="text-xs text-muted-foreground">当前页面需要更高权限</div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-6 pb-10 pt-2 md:px-10">
          <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <section className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-600 dark:text-amber-400">
                <LockKeyhole className="h-4 w-4" />
                访问已被拒绝
              </div>

              <div className="bg-linear-to-r text-[5.5rem] font-black leading-none tracking-[-0.08em] text-transparent from-sky-500 via-cyan-400 to-violet-500 bg-clip-text md:text-[8rem]">
                403
              </div>

              <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
                你没有权限打开这个页面
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                这通常意味着当前账号未被授予对应资源的查看权限，或者访问链接已失效。
                你可以返回上一页重新选择内容，或回到控制台继续其他操作。
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="min-w-36"
                  onClick={() => navigate('/manage/dashboard')}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  回到控制台
                </Button>
              </div>
            </section>

            <section className="relative">
              <div className="bg-linear-to-br absolute inset-0 rounded-4xl from-white/40 via-transparent to-sky-500/10 blur-2xl dark:from-white/5" />
              <div className="relative overflow-hidden rounded-4xl border border-border/60 bg-background/75 p-6 shadow-2xl shadow-slate-950/5 backdrop-blur-xl md:p-8 dark:bg-background/60 dark:shadow-black/20">
                <div className="bg-linear-to-br absolute right-5 top-5 h-24 w-24 rounded-full border border-border/50 from-sky-500/10 to-violet-500/10 blur-sm" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Request Snapshot
                      </div>
                      <div className="mt-2 text-2xl font-semibold">
                        当前请求无法通过鉴权
                      </div>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
                      <ShieldAlert className="h-7 w-7 text-amber-500" />
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-border/60 bg-muted/40 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Path
                    </div>
                    <div className="mt-2 break-all rounded-xl bg-background/80 px-3 py-2 font-mono text-sm text-foreground shadow-sm">
                      {fullPath}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
                    <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                      1. 请确认当前账号是否拥有对应应用、页面或协作资源的访问权限。
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                      2. 如果这是分享或协作链接，可能链接角色不足，或令牌已经过期。
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                      3. 如需继续访问，请联系管理员为你开通权限后再重试。
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Forbidden