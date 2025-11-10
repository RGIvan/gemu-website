import * as VercelKV from "@vercel/kv";

export const kv =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? VercelKV
    : {
        store: new Map<string, any>(),
        async get(key: string) {
          return this.store.get(key);
        },
        async set(key: string, value: any) {
          this.store.set(key, value);
        },
      };
