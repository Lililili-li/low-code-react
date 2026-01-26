/**
 * 定时任务工具类
 */
export interface ScheduleTaskOptions {
  /** 定时时间间隔（毫秒） */
  interval: number;
  /** 需要定时执行的函数 */
  callback: () => void | Promise<void>;
  /** 是否立即执行一次，默认 false */
  immediate?: boolean;
  /** 任务名称，用于标识和管理 */
  name?: string;
  /** 是否自动启动，默认 true */
  autoStart?: boolean;
}

export class ScheduleTask {
  private timer: number | null = null;
  private options: ScheduleTaskOptions;
  private isRunning = false;
  private isDestroyed = false;

  constructor(options: ScheduleTaskOptions) {
    this.options = {
      immediate: false,
      autoStart: true,
      ...options,
    };

    if (this.options.autoStart) {
      this.start();
    }
  }

  /**
   * 启动定时任务
   */
  start(): void {
    if (this.isDestroyed) {
      throw new Error('Task has been destroyed and cannot be restarted');
    }

    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    if (this.options.immediate) {
      this.executeCallback();
    }

    // 如果 interval 为 0，只执行一次
    if (this.options.interval === 0) {
      this.executeCallback();
      this.stop();
      return;
    }

    this.timer = setInterval(() => {
      this.executeCallback();
    }, this.options.interval);
  }

  /**
   * 停止定时任务
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  /**
   * 销毁定时任务，销毁后不能重新启动
   */
  destroy(): void {
    this.stop();
    this.isDestroyed = true;
  }

  /**
   * 重新设置定时间隔
   */
  setInterval(interval: number): void {
    this.options.interval = interval;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * 获取任务状态
   */
  getStatus(): {
    isRunning: boolean;
    isDestroyed: boolean;
    interval: number;
    name?: string;
  } {
    return {
      isRunning: this.isRunning,
      isDestroyed: this.isDestroyed,
      interval: this.options.interval,
      name: this.options.name,
    };
  }

  /**
   * 执行回调函数
   */
  private async executeCallback(): Promise<void> {
    try {
      await this.options.callback();
    } catch (error) {
      console.error(
        `Schedule task${this.options.name ? ` "${this.options.name}"` : ''} error:`,
        error
      );
    }
  }
}

/**
 * 创建定时任务的便捷方法
 */
export function createScheduleTask(options: ScheduleTaskOptions): ScheduleTask {
  return new ScheduleTask(options);
}

/**
 * 简单的定时执行函数，无需管理任务生命周期
 */
export function scheduleTask(
  interval: number,
  callback: () => void | Promise<void>,
  immediate = false
): ScheduleTask {
  return new ScheduleTask({
    interval,
    callback,
    immediate,
  });
}

/**
 * 延迟执行函数
 */
export function delayTask(
  delay: number,
  callback: () => void | Promise<void>
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        await callback();
      } catch (error) {
        console.error('Delay task error:', error);
      } finally {
        resolve();
      }
    }, delay);
  });
}

/**
 * 任务管理器，用于管理多个定时任务
 */
export class TaskManager {
  private tasks: Map<string, ScheduleTask> = new Map();

  /**
   * 添加任务
   */
  addTask(name: string, options: ScheduleTaskOptions): ScheduleTask {
    const task = new ScheduleTask({
      ...options,
      name,
    });
    
    this.tasks.set(name, task);
    return task;
  }

  /**
   * 获取任务
   */
  getTask(name: string): ScheduleTask | undefined {
    return this.tasks.get(name);
  }

  /**
   * 启动任务
   */
  startTask(name: string): boolean {
    const task = this.tasks.get(name);
    if (task) {
      task.start();
      return true;
    }
    return false;
  }

  /**
   * 停止任务
   */
  stopTask(name: string): boolean {
    const task = this.tasks.get(name);
    if (task) {
      task.stop();
      return true;
    }
    return false;
  }

  /**
   * 销毁任务
   */
  destroyTask(name: string): boolean {
    const task = this.tasks.get(name);
    if (task) {
      task.destroy();
      this.tasks.delete(name);
      return true;
    }
    return false;
  }

  /**
   * 启动所有任务
   */
  startAll(): void {
    this.tasks.forEach((task) => task.start());
  }

  /**
   * 停止所有任务
   */
  stopAll(): void {
    this.tasks.forEach((task) => task.stop());
  }

  /**
   * 销毁所有任务
   */
  destroyAll(): void {
    this.tasks.forEach((task) => task.destroy());
    this.tasks.clear();
  }

  /**
   * 获取所有任务状态
   */
  getAllStatus(): Record<string, ReturnType<ScheduleTask['getStatus']>> {
    const status: Record<string, ReturnType<ScheduleTask['getStatus']>> = {};
    this.tasks.forEach((task, name) => {
      status[name] = task.getStatus();
    });
    return status;
  }
}