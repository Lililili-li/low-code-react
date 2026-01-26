import { callSendRequest } from "../datasource";
import { ActionSchema, DatasourceSchema } from "../types";
import { stringToFunction } from "@repo/shared/index";

export const parseChangeVariableAction = (action: ActionSchema['changeVariable']) => {
  const changeVariableFunc = stringToFunction(action!);

  // Create a mutable copy of state to avoid "read-only" errors

  return changeVariableFunc;
}

export const parseNavToPageAction = (action: ActionSchema['navToPage']) => {
  const { pageId, delay, linkParams } = action!;
  if (!pageId) return;
  const params = linkParams.reduce((acc, param) => {
    acc[param.key] = param.value;
    return acc;
  }, {} as Record<string, string>);

  setTimeout(() => {
    window.location.href = `${pageId}?${new URLSearchParams(params).toString()}`;
  }, delay || 0);

}
export const parseNavToLinkAction = (action: ActionSchema['navToLink']) => {
  const { linkUrl, delay, linkParams, isBlank = false } = action!;
  if (!linkUrl) return;
  const params = linkParams.reduce((acc, param) => {
    acc[param.key] = param.value;
    return acc;
  }, {} as Record<string, string>);

  setTimeout(() => {
    if (isBlank) {
      window.open(`${linkUrl}?${new URLSearchParams(params).toString()}`, '_blank');
    } else {
      window.location.href = `${linkUrl}?${new URLSearchParams(params).toString()}`;
    }
  }, delay || 0);

}


export const parseFetchApiAction = (action: ActionSchema['fetchAPI'], state: Record<string, any>, datasource: DatasourceSchema[], onStateChange: (value: Record<string, any>) => void) => {
  const { datasourceId = [] } = action!;
  if (datasourceId.length === 0) return;
  const promiseArray: Promise<any>[] = []
  const copyState = { ...state }
  
  datasource.forEach(item => {
    if (datasourceId.includes(item.id)) {
      promiseArray.push(callSendRequest(item, copyState))
    }
  })
  Promise.all(promiseArray).then(() => {
    onStateChange(copyState)
  })
}