import { request } from "@repo/shared/request";
import { DatasourceSchema, DataType } from "@repo/core/types";
import { getVariableValue } from "../variable";
import { scheduleTask, stringToFunction } from "@repo/shared/index";

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


const getInterfaceData = (params: DatasourceSchema, state: Record<string, any>) => {
  return new Promise((resolve, reject) => {
    const { method, url, timeout } = params;
    const queryParams = parseQueryParams(params.params, state)
    const arrangeQueryParams = handleParams(params, state, {...queryParams})
    const bodyParams = params.requestType === 'http' ? handleParams(params, state, parseBodyParams(params.bodyParams, state)) : { [params.sqlParams?.key || '']: params.sqlParams?.value || '' };
    const arrangeBodyParams = handleParams(params, state, {...bodyParams})
    const headerParams = parseQueryParams(params.headerParams, state);
    const timeoutValue = timeout.type === DataType.Normal ? Number(timeout.value) : getVariableValue(timeout.value as string, state);
    if (method.toLowerCase() === 'post') {
      request[method.toLowerCase() as MethodType](url, arrangeBodyParams, {
        params: arrangeQueryParams,
        headers: { ...headerParams, 'Content-Type': paramsContentTypeMap[params.bodyParams?.type as keyof typeof paramsContentTypeMap] },
        timeout: Number(timeoutValue || 60 * 1000)
      }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    } else {
      request[method.toLowerCase() as MethodType](url, {
        params: arrangeQueryParams,
        headers: headerParams,
        timeout: Number(timeoutValue || 60 * 1000)
      }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    }
  })
}

export const handleParams = (datasourceItem: DatasourceSchema, state: Record<string, any>, params: any) => {
  const functions = stringToFunction(datasourceItem.handleParams || '', { params: ['params', 'state'] })
  return functions?.(params, state)
}


export const testInterface = async (params: DatasourceSchema, state: Record<string, any>) => {
  return await getInterfaceData(params, state)
}


export const sendRequest = async (params: DatasourceSchema, state: Record<string, any>) => {
  const res = await getInterfaceData(params, state)
  const functions = stringToFunction(params.handleResult || '', { params: ['res', 'state'] })
  const { schedule, initRequest = false } = params
  const scheduleValue = schedule.type === DataType.Normal ? Number(schedule.value) : Number(getVariableValue(schedule.value as string, state))
  // 开启定时任务如果 initRequest 为 true立即执行， schedule为0只执行一次
  scheduleTask(scheduleValue, () => {
    functions?.(res, state)
  }, initRequest)
}

export const callSendRequest = async (params: DatasourceSchema, state: Record<string, any>) => {
  const res = await getInterfaceData(params, state)
  const functions = stringToFunction(params.handleResult || '', { params: ['res', 'state'] })
  await functions?.(res, state)
}