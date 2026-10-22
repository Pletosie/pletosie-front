export const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(" · ")
        : data.message || "Le service est momentanément indisponible.",
    );
  return data as T;
}
