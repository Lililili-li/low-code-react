import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
// import { Toast } from '@douyinfe/semi-ui';
import { toast } from 'sonner'
// 响应数据结构
interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 创建 axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const str = localStorage.getItem('app-storage')
    const language = JSON.parse(str!)?.language
    const { data } = response;
    // 根据业务 code 判断请求是否成功
    if (data.code === 0 || data.code === 200) {
      return data.data as unknown as AxiosResponse;
    }
    toast.error(language === 'en-US'?'Request failed':'请求失败')
    // 业务错误
    return Promise.reject(new Error(data.message || '请求失败'));
  },
  (error: AxiosError) => {
    // HTTP 错误处理
    const status = error.response?.status;
    const str = localStorage.getItem('app-storage')
    const language = JSON.parse(str!)?.language
    switch (status) {
      case 400:
        toast.error(language === 'en-US'?'Parameter Error':'参数错误')
        break;
      case 401:
        // 未授权，跳转登录
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.error(language === 'en-US'?'Authorization expired please login again':'授权过期 请重新登录')
        break;
      case 403:
        console.error('没有权限');
        toast.error(language === 'en-US'?'No Authority':'没有权限')
        break;
      case 404:
        console.error('资源不存在');
        toast.error(language === 'en-US'?'Resource department exists':'资源不存在')
        break;
      case 500:
        console.error('服务器错误');
        toast.error(language === 'en-US'?'Server error':'服务器错误')
        break;
      default:
        console.error(error.message || '网络错误');
        toast.error(language === 'en-US'?'Network error':'网络错误')
    }
    return Promise.reject(error);
  }
);

// 封装请求方法
export const request = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config);
  },

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config);
  },

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config);
  },

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config);
  },
};

export default instance;
