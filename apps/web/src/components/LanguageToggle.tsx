import { useTranslation } from "react-i18next";
import { useAppStore } from "@/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Check, Languages } from "lucide-react";
import { Button } from "@repo/ui/components/button";

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const { config, updateAppConfig } = useAppStore();
  const changeLanguageChange = (language: "en-US" | "zh-CN") => {
    updateAppConfig({ language: language });
    i18n.changeLanguage(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8">
          <Languages style={{ width: 20, height: 20 }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguageChange('zh-CN')}>
          <div className="flex justify-between items-center w-full cursor-pointer">
            <span>简体中文</span>
            { config.language === 'zh-CN' && <Check /> }
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguageChange('en-US')}>
          <div className="flex justify-between items-center w-full cursor-pointer">
            <span>English</span>
            { config.language === 'en-US' && <Check /> }
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
