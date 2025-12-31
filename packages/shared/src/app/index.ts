export const getLanguage = () => {
  const storage = localStorage.getItem('app-storage')
  return storage ? JSON.parse(storage)?.language : 'zh-CN'
}

export const getTheme = () => {
  const storage = localStorage.getItem('app-storage')
  return storage ? JSON.parse(storage)?.theme : 'light'
}


