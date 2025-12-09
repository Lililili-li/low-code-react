import { useLocation } from "react-router";

export const useQuery = () => {
  const location = useLocation();
  if (!location.search) return null
  const searchParams = location.search?.split('?')[1].split('&');
  const query: Record<string, string> = {}
  searchParams.forEach(param => {
    const [key, value] = param.split('=');
    query[key] = value;
  })
  return query;
}