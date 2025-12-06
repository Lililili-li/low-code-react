import { useEffect, useState } from "react"

export type OS = "mac" | "windows" | "linux" | "unknown"

export function useDevice() {
  const [os, setOs] = useState<OS>("unknown")

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes("mac")) {
      setOs("mac")
    } else if (userAgent.includes("win")) {
      setOs("windows")
    } else if (userAgent.includes("linux")) {
      setOs("linux")
    } else {
      setOs("unknown")
    }
  }, [])

  return {
    os,
    isMac: os === "mac",
    isWindows: os === "windows",
    isLinux: os === "linux",
  }
}
