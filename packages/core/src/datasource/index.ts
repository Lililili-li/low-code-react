import { request } from "@repo/shared/request";
import { DatasourceSchema, DataType } from "@repo/core/types";
import { getVariableValue } from "../variable";

type MethodType = keyof typeof request

const validateParams = (params?: { key: string, value: string, dataType: string }[]) => {
  if (!params) return false;
  if (params.length === 0) return false;
  if (params.some(item => !item.key)) return false; // 只要有一个key为空就返回格式不正确
  return true;
}


const parseQueryParams = (params: DatasourceSchema['params'], state: Record<string, any>) => {
  if (!validateParams(params)) return {}
  const queryParams = params?.reduce((acc, param) => {
    if (param.dataType === DataType.Normal) {
      acc[param.key] = param.value;
    } else {
      acc[param.key] = getVariableValue(param.value, state) as unknown as string || ''
    }
    return acc;
  }, {} as Record<string, string>) || {};
  return queryParams;
}

const parseBodyParams = (bodyParams: DatasourceSchema['bodyParams'], state: Record<string, any>) => {
  const { type = '' } = bodyParams || {};
  let result: any = null
  switch (type) {
    case 'form-data':
      if (!validateParams(bodyParams?.params?.['form-data'])) return;
      result = new FormData();
      bodyParams?.params?.['form-data']?.forEach((param) => {
        if (param.dataType === DataType.Normal) {
          result.append(param.key, param.value);
        } else {
          result.append(param.key, getVariableValue(param.value, state) as unknown as string || '');
        }
      });
      break;
    case 'x-www-form-urlencoded':
      if (!validateParams(bodyParams?.params?.['x-www-form-urlencoded'])) return;
      result = new FormData();
      bodyParams?.params?.['x-www-form-urlencoded']?.forEach((param) => {
        if (param.dataType === DataType.Normal) {
          result.append(param.key, param.value);
        } else {
          result.append(param.key, getVariableValue(param.value, state) as unknown as string || '');
        }
      });
      break;
    case 'none':
      result = {};
      break;
    case 'json':
      try {
        result = JSON.parse(bodyParams?.params?.['json'] || '{}');
      } catch (error) {
        result = {};
      }
      break;
    default:
      break;
  }
  return result || {};
}


const paramsContentTypeMap = {
  'form-data': 'multipart/form-data',
  'x-www-form-urlencoded': 'application/x-www-form-urlencoded',
  'json': 'application/json',
  'none': 'application/json',
}


export const testInterface = (params: DatasourceSchema, state: Record<string, any>) => {

  const { method, url } = params;
  return new Promise((resolve, reject) => {
    const queryParams = parseQueryParams(params.params, state);
    const bodyParams = params.requestType === 'http' ? parseBodyParams(params.bodyParams, state) : { [params.sqlParams?.key || '']: params.sqlParams?.value || '' };
    const headerParams = parseQueryParams(params.headerParams, state);
    if (method.toLowerCase() === 'post') {
      request[method.toLowerCase() as MethodType](url, bodyParams, {
        params: queryParams,
        headers: { ...headerParams, 'Content-Type': paramsContentTypeMap[params.bodyParams?.type as keyof typeof paramsContentTypeMap] }
      }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    } else {
      request[method.toLowerCase() as MethodType](url, {
        params: queryParams,
        headers: headerParams
      }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    }
  })
}
