import { useCallback, useState } from "react";
import { toast } from "sonner";

const useClipboard = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // copy函数用于复制文本到剪切板
  const copy = useCallback(async (text: string) => {
    if (!navigator.clipboard) {
      toast.warning('浏览器不支持剪切板')
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500); // 1.5秒后重置状态
      return true;
    } catch (error) {
      console.warn('复制失败', error);
      setIsCopied(false);
      return false;
    }
  }, []);

  return { isCopied, copy };
};

export default useClipboard;