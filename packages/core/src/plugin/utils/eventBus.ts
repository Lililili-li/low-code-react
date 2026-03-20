type EventHandler = (...args: any[]) => void;

export interface EventBus {
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, handler: EventHandler) => void;
  off: (event: string, handler: EventHandler) => void;
  once: (event: string, handler: EventHandler) => void;
}

export function createEventBus(): EventBus {
  const events: Map<string, EventHandler[]> = new Map();

  return {
    emit(event: string, ...args: any[]) {
      const handlers = events.get(event);
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(...args);
          } catch (error) {
            console.error(`Error in event handler for ${event}:`, error);
          }
        });
      }
    },

    on(event: string, handler: EventHandler) {
      if (!events.has(event)) {
        events.set(event, []);
      }
      events.get(event)!.push(handler);
    },

    off(event: string, handler: EventHandler) {
      const handlers = events.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    },

    once(event: string, handler: EventHandler) {
      const onceHandler = (...args: any[]) => {
        handler(...args);
        this.off(event, onceHandler);
      };
      this.on(event, onceHandler);
    },
  };
}
