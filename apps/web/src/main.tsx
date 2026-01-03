import { createRoot } from "react-dom/client";
import { enableMapSet } from "immer";
import "@repo/ui/globals.css";
import "./style.css";
import router from "@/router";
import { RouterProvider } from "react-router";
import '@/locales'
import { Toaster } from "@repo/ui/components/sonner";
import { useTheme } from "./composable/use-theme";
import 'animate.css';

// 启用 Immer 的 MapSet 插件以支持 Map 和 Set
enableMapSet();

const App = () => {
  const { theme } = useTheme()
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" theme={theme} toastOptions={{
        style: {
          padding: "10px 16px",
        },
      }} />
    </>
  )
};

createRoot(document.getElementById("app")!).render(<App />);
