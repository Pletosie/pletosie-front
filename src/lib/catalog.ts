import type { Product } from "./types";
import { API } from "./api";
export async function getProducts(): Promise<Product[]> {
  try {
    const r = await fetch(`${API}/products`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) return [];
    return await r.json();
  } catch {
    return [];
  }
}
