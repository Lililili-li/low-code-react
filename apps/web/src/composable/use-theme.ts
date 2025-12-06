// import { useState } from "react"
import { useAppStore } from "@/store";
import { useLayoutEffect } from "react";

export const useTheme = () => {
  // const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { config, updateAppConfig } = useAppStore();

  const changeTheme = (theme: 'light' | 'dark') => {
    updateAppConfig({theme})
  }

  useLayoutEffect(() => {
    const body = document.body;
    if (config.theme === 'light') {
      body.removeAttribute('theme-mode');
      body.classList.remove('dark')
    } else {
      body.setAttribute('theme-mode', 'dark');
      body.classList.add('dark')
    }
  },[config.theme])

  return {
    theme: config.theme,
    changeTheme,
    isLight: config.theme === 'light',
    isDark: config.theme === 'dark',
  }
}