declare module 'redis-promise' {
  export interface RedisClient {
    on(arg0: string, arg1: (err: any) => void): unknown;
    connect(): Promise<void>;
    disconnect(): void;
    setex(key: string, seconds: number, value: string): Promise<'OK'>;
    get(key: string): Promise<string | null>;
  }

  export function createClient(options: any): RedisClient;
}
