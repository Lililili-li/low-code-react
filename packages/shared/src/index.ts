
import mitt from 'mitt';

export const eventBus = mitt();

export const isString = (value: any) => typeof value === 'string' || value instanceof String

export const isNumber = (value: any) => typeof value === 'number' || value instanceof Number

export const isObject = (value: any) => value !== null && typeof value === 'object' && !Array.isArray(value)

export const isBoolean = (value: any) => typeof value === 'boolean' || value instanceof Boolean

export const isArray = (value: any) => Array.isArray(value)

export const isFunction = (value: any) => typeof value === 'function'


export const byteToMB = (byte: number) => byte / 1024 / 1024

// 导出定时任务相关工具
export {
  ScheduleTask,
  TaskManager,
  createScheduleTask,
  scheduleTask,
  delayTask,
  type ScheduleTaskOptions
} from './schedule-task';

// 导出函数字符串处理工具
export {
  SafeFunctionParser,
  stringToFunction,
  executeFunctionString,
  simpleStringToFunction,
  validateFunctionSyntax,
  extractFunctionParams,
  smartParseFunction,
  type FunctionParseOptions,
  type FunctionExecutionResult
} from './handleFun';

