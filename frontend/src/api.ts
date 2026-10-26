const API_BASE = "http://localhost:1234/api";
const SHORT_BASE = "http://localhost:1234/url";

export type User = {
  _id: string;
  name?: string;
  email: string;
  role: "NORMAL" | "ADMIN" | string;
};

export type UrlItem = {
  _id: string;
  shortId: string;
  redirectURL: string;
  visitedHistory: { timestamp: number }[];
  createdBy?: string;
};

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }
  return data as T;
}

export const api = {
  me: () => request<{ user: User }>("/me"),
  signup: (body: { name: string; email: string; password: string }) =>
    request<{ message: string }>("/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ message: string; user: User }>("/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () => request<{ message: string }>("/logout", { method: "POST" }),
  createUrl: (url: string) =>
    request<{ id: string; shortUrl: string; redirectURL: string }>("/url", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),
  listUrls: () => request<{ urls: UrlItem[] }>("/urls"),
  analytics: (shortId: string) =>
    request<{ totalclicks: number; analytics: { timestamp: number }[] }>(
      `/url/analytics/${shortId}`
    ),
  adminUsers: () =>
    request<{ users: { _id: string; name: string; email: string; role: string }[] }>(
      "/admin/users"
    ),
};

export function shortLink(shortId: string) {
  return `${SHORT_BASE}/${shortId}`;
}
