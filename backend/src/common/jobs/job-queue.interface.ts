export interface JobOptions {
  delay?: number;
  attempts?: number;
  priority?: number;
  removeOnComplete?: boolean;
}

export interface IJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  opts?: JobOptions;
}

export interface IJobQueue {
  add<T>(jobName: string, data: T, options?: JobOptions): Promise<IJob<T>>;
  process<T>(jobName: string, handler: (job: IJob<T>) => Promise<void>): void;
}
