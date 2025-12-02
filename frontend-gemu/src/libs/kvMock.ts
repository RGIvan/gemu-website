import { VercelKV } from "@vercel/kv";

const isLocal = !process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN;

export const kv = isLocal
  ? {
      store: new Map<string, string>(),
      async get(key: string) {
        const data = this.store.get(key);
        if (!data) return null;
        try {
          return JSON.parse(data);
        } catch {
          return null;
        }
      },
      async set(key: string, value: any) {
        this.store.set(key, JSON.stringify(value));
      },
    }
  : new VercelKV({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
