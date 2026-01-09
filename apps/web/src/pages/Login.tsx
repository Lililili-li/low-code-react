import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@repo/ui/components/button";
import { Github, Lock, User } from "lucide-react";
import { Separator } from "@repo/ui/components/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequest } from "ahooks";
import { useEffect } from "react";
import { Spinner } from "@repo/ui/components/spinner";
import { useLocation, useNavigate } from "react-router";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@repo/ui/components/input-group"
import userApi from '@/api/user'
import { UserState, useUserStore } from "@/store/modules/user";
import { toast } from "sonner"
import { useTranslation } from "react-i18next";

const Header = () => {
  return (
    <div className="login-header flex justify-between p-4 fixed top-0 w-full">
      <h1 className="logo">
        <span className="font-bold text-2xl"> 编辑器 </span>
      </h1>
      <div className="mode-toggle">
        <ThemeToggle />
      </div>
    </div>
  );
};

const Login = () => {

  const { t } = useTranslation()
  const { setUser } = useUserStore()
  const {
    loading,
    run: onSubmit,
  } = useRequest(() => userApi.login(form.getValues()), {
    manual: true,
    onSuccess: (result) => {
      setUser(result as unknown as UserState['user'])
      toast.success(t('message.loginSuccess'))
      navigate("/manage/dashboard");
    },
  });
  const navigate = useNavigate();
  const location = useLocation()
  const FormSchema = z.object({
    account: z.string().min(2, {
      message: "用户名最少两个字符",
    }),
    password: z
      .string()
      .min(6, {
        message: "密码长度最少6位",
      })
      .max(12, {
        message: "密码长度最多12位",
      }),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      account: "",
      password: "",
    },
  });

  useEffect(() => {
    if (location.pathname === '/login' && localStorage.getItem('accessToken')) {
      navigate('/home', {
        replace: true
      })
    }
  }, [])

  return (
    <div className="login-container h-dvh flex flex-col">
      <Header />
      <div className="content flex justify-center items-center flex-1 flex-col w-1/4 mx-auto">
        <h1 className="font-bold">{t('login.welcome')}</h1>
        <p className="text-sm text-gray-500 mt-2 ">{t('login.description')}</p>
        <Button variant="outline" className="w-full mt-4">
          <Github />
          {t('login.scanCode')}
        </Button>
        <Separator className="my-8 relative">
          <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-gray-100 text-[12px] px-1 py-0.5 rounded-[2px] text-gray-500 dark:text-white dark:bg-[#333] ">
            {t('login.otherMethod')}
          </div>
        </Separator>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">{t('login.account')}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput placeholder="请输入用户名" {...field} />
                      <InputGroupAddon>
                        <InputGroupButton
                          variant="ghost"
                          aria-label="Help"
                          size="icon-xs"
                        >
                          <User />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormDescription>测试账号: admin</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">{t('login.password')}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput placeholder="请输入密码" {...field} type="password"/>
                      <InputGroupAddon>
                        <InputGroupButton
                          variant="ghost"
                          aria-label="Help"
                          size="icon-xs"
                        >
                          <Lock />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormDescription>测试密码: 123456</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {loading && <Spinner />}
              {t('login.login')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;
