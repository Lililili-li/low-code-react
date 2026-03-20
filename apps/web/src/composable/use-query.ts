import { useLocation } from "react-router";

const parseSearchString = <T>(search: string) => {
  if (!search) return null;

  const normalizedSearch = search.startsWith('?') ? search.slice(1) : search;
  if (!normalizedSearch) return null;

  const query: Record<string, string> = {};

  // 兼容 redirect=/design?applicationId=1&pageId=xxx 这类未编码回跳地址
  if (normalizedSearch.startsWith('redirect=')) {
    query.redirect = normalizedSearch.slice('redirect='.length);
    return query as T;
  }

  normalizedSearch.split('&').forEach((param) => {
    if (!param) return;

    const separatorIndex = param.indexOf('=');
    if (separatorIndex === -1) {
      query[param] = '';
      return;
    }

    const key = param.slice(0, separatorIndex);
    const value = param.slice(separatorIndex + 1);
    query[key] = value;
  });

  return query as T;
};

export const parseQuery = <T>(queryString?: string) => {
  if (!queryString) {
    const location = useLocation();
    return parseSearchString<T>(location.search);
  }

  const search = queryString.includes('?') ? queryString.split('?').slice(1).join('?') : queryString;
  return parseSearchString<T>(search);
};
