import { cloneDeep } from "lodash-es";

interface FlatNode {
  key: string;
  value: any;
  parentKeys: string[];
  fullPath: string;
}

export const flattenObject = (obj: Record<string, any>, parentKeys: string[] = []): FlatNode[] => {
  const result: FlatNode[] = [];
  
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const currentPath = [...parentKeys, key];
    const fullPath = currentPath.join('.');
    
    result.push({
      key,
      value,
      parentKeys: [...parentKeys],
      fullPath
    });
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result.push(...flattenObject(value, currentPath));
    }
  });
  
  return result;
};

export const searchVariable = (state: Record<string, any>, key: string) => {
  const flatArray = flattenObject(state);
  const keyMap = new Map<string, FlatNode>();
  
  flatArray.forEach((node) => {
    keyMap.set(node.key, node);
  });
  
  const targetNode = keyMap.get(key);
  
  if (targetNode) {
    return 'state.' + targetNode.fullPath;
  }
  return ''
}

export const getVariableKey = (key: string) => {
  const keyArray = key.split('.')
  if (keyArray.length > 1) {
    return keyArray[keyArray.length - 1]
  }
  return key
}

export const getVariableValue = (key: string, state: Record<string, any>) => {
  let stateClone = cloneDeep(state)
  const keyArray = key.split('.')
  let value = stateClone
  for (let i = 1; i < keyArray.length; i++) {
    value = value[keyArray[i]]
  }
  return value
}