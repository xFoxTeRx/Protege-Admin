// Cliente HTTP hacia el Gateway .NET. Inyecta X-Tenant automáticamente.
export const API_BASE_URL: string = "https://vjxkpprx-5000.brs.devtunnels.ms";

const TENANT_KEY = "tenantId";
const SLUG_KEY = "tenantSlug";

export const session = {
  getTenantId: () => (typeof window === "undefined" ? null : localStorage.getItem(TENANT_KEY)),
  getSlug: () => (typeof window === "undefined" ? null : localStorage.getItem(SLUG_KEY)),
  set: (tenantId: string, slug: string) => {
    localStorage.setItem(TENANT_KEY, tenantId);
    localStorage.setItem(SLUG_KEY, slug);
  },
  clear: () => {
    localStorage.removeItem(TENANT_KEY);
    localStorage.removeItem(SLUG_KEY);
  },
};

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const tenant = session.getTenantId();
  if (tenant) headers.set("X-Tenant", tenant);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);
  return (text ? JSON.parse(text) : null) as T;
}

export type Camara = { id: string | number; numeroCanalDVR: number; nombreUbicacion: string };
export type Alerta = {
  id: string | number;
  camaraId?: string | number;
  fecha?: string;
  fechaHora?: string;
  descripcion?: string;
  [k: string]: unknown;
};

/**
 * Valida el slug del tenant contra el Gateway y devuelve su TenantId.
 */
export async function resolveTenant(slug: string): Promise<string> {
  const data = await api<{ id?: string; tenantId?: string }>(
    `/api/Tenants/${encodeURIComponent(slug)}`,
  );
  const id = data?.tenantId ?? data?.id;
  if (!id) throw new Error("Tenant no encontrado");
  return String(id);
}