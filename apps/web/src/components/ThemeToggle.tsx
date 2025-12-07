import { Check, Moon, Sun } from "lucide-react";

import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useTheme } from "@/composable/use-theme";
import { useTranslation } from "react-i18next";

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, changeTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8">
          {theme === 'light' && <Sun style={{ width: 20, height: 20 }} />}
          {theme === 'dark' && <Moon style={{ width: 20, height: 20 }} />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeTheme("light")}>
          <div className="flex justify-between items-center w-full cursor-pointer">
            <span>{t("theme.light")}</span>
            {theme === 'light' && <Check />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme("dark")}>
          <div className="flex justify-between items-center w-full cursor-pointer">
            <span>{t("theme.dark")}</span>
            {theme === 'dark' && <Check />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
