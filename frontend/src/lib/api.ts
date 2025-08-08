const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json" } });
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    if (path.startsWith("/admin") && typeof window !== "undefined") window.location.href = "/secret-admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T>(path: string, body: any, options?: { admin?: boolean; token?: string }): Promise<T> {
  const headers: any = { "Content-Type": "application/json" };
  if (options?.admin) {
    const tok = localStorage.getItem("admin_token");
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
  } else if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    if (options?.admin) {
      localStorage.removeItem("admin_token");
      if (typeof window !== "undefined") window.location.href = "/secret-admin/login";
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiGetAuth<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiAuthPost<T>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    if (typeof window !== "undefined") window.location.href = "/secret-admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiAuthed<T>(method: string, path: string, body: any, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    if (typeof window !== "undefined") window.location.href = "/secret-admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
