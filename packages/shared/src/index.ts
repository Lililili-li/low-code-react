
import mitt from 'mitt';

export const eventBus = mitt();

export const isString = (value: any) => typeof value === 'string' || value instanceof String

export const isNumber = (value: any) => typeof value === 'number' || value instanceof Number


