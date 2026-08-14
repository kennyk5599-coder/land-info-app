import { LRUCache } from "lru-cache";

export const tileCache = new LRUCache<string, object>({
  max: 2000,
});
