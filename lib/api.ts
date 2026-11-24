// Backend (NestJS) bilan ishlash uchun yagona joy: tokenlar, xatolar, fetch wrapper va endpointlar.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

/* ------------------------------------------------------------------ */
/* Types (backend entity / DTO'lariga mos)                             */
/* ------------------------------------------------------------------ */

export type Role = "USER" | "ADMIN" | "EDITOR";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: number;
  image: string; // backend to'liq URL qaytaradi (APP_URL/uploads/product/...)
  name: string;
  price: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user?: { id: number; name: string };
}

export interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  user: { id: number; name: string; email: string };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

/** ADMIN va EDITOR admin panelga kira oladi, USER esa faqat o'z profiliga. */
export const isStaff = (role?: Role | null) => role === "ADMIN" || role === "EDITOR";

/** Login'dan keyin foydalanuvchi qaysi sahifaga tushishi kerak. */
export const homeFor = (user: Pick<User, "role">) => (isStaff(user.role) ? "/admin" : "/profile");

/* ------------------------------------------------------------------ */
/* Token storage                                                       */
/* ------------------------------------------------------------------ */

const ACCESS_KEY = "nextadmin.accessToken";
const REFRESH_KEY = "nextadmin.refreshToken";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export const getAccessToken = () => read(ACCESS_KEY);
export const getRefreshToken = () => read(REFRESH_KEY);

export function setTokens(accessToken: string, refreshToken: string) {
  try {
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  } catch {
    /* storage mavjud emas — e'tiborsiz */
  }
}

export function clearTokens() {
  try {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* Fetch wrapper                                                       */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function toApiError(res: Response) {
  let message = `So'rov bajarilmadi (${res.status})`;
  try {
    const data = await res.json();
    if (Array.isArray(data?.message)) message = data.message.join(", ");
    else if (typeof data?.message === "string") message = data.message;
  } catch {
    /* JSON emas — standart xabar */
  }
  return new ApiError(res.status, message);
}

/** Foydalanuvchiga ko'rsatiladigan xabar: backend xabari yoki tarmoq xatosi uchun tushunarli matn. */
export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "Serverga ulanib bo'lmadi. Backend ishlayotganini tekshiring.";
}

// Refresh token har safar almashadi, shuning uchun bir vaqtda faqat bitta refresh so'rovi yuboriladi.
let refreshing: Promise<boolean> | null = null;

function refreshTokens(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  json?: unknown;
  form?: FormData;
  auth?: boolean;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", json, form, auth = true } = options;

  let sentToken: string | null = null;

  const send = () => {
    const headers: Record<string, string> = {};
    let body: BodyInit | undefined;
    if (form) {
      body = form; // Content-Type'ni brauzer o'zi qo'yadi (multipart boundary)
    } else if (json !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(json);
    }
    sentToken = getAccessToken();
    if (auth && sentToken) headers.Authorization = `Bearer ${sentToken}`;
    return fetch(`${API_URL}${path}`, { method, headers, body });
  };

  let res = await send();

  // Access token eskirgan bo'lsa — refresh qilib, so'rovni bir marta qayta yuboramiz.
  if (res.status === 401 && auth && getRefreshToken()) {
    // Boshqa so'rov tokenni allaqachon yangilab bo'lgan bo'lsa, qayta refresh qilmaymiz.
    const current = getAccessToken();
    const alreadyRefreshed = current !== null && current !== sentToken;
    if (alreadyRefreshed || (await refreshTokens())) {
      res = await send();
    } else {
      clearTokens();
      window.dispatchEvent(new Event("auth:expired"));
    }
  }

  if (!res.ok) throw await toApiError(res);

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

export const authApi = {
  login: (email: string, password: string) =>
    api<{ id: number; accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      json: { email, password },
      auth: false,
    }),
  register: (payload: RegisterPayload) =>
    api<User>("/auth/register", { method: "POST", json: payload, auth: false }),
  signout: () => api("/auth/signout", { method: "POST" }),
  // Login javobida role yo'q, shuning uchun role profildan olinadi.
  profile: () => api<User>("/user/profile"),
};

export const menuApi = {
  list: () => api<Menu[]>("/menu"),
  create: (form: FormData) => api<Menu>("/menu", { method: "POST", form }),
  update: (id: number, form: FormData) => api<Menu>(`/menu/${id}`, { method: "PATCH", form }),
  remove: (id: number) => api<{ message: string }>(`/menu/${id}`, { method: "DELETE" }),
};

export const commentApi = {
  list: () => api<CommentItem[]>("/comment"),
  remove: (id: number) => api<{ message: string }>(`/comment/${id}`, { method: "DELETE" }),
};

export const userApi = {
  // PaginationUserDto: skip @IsPositive — skip=0 yuborib bo'lmaydi, shuning uchun 0 bo'lsa umuman yubormaymiz.
  list: (skip: number, limit: number) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (skip > 0) params.set("skip", String(skip));
    return api<User[]>(`/user?${params.toString()}`);
  },
  update: (id: number, payload: Partial<Pick<User, "name" | "email" | "phone">>) =>
    api<User>(`/user/${id}`, { method: "PATCH", json: payload }),
  updateRole: (id: number, role: Role) =>
    api<User>(`/user/${id}/role`, { method: "PATCH", json: { role } }),
  remove: (id: number) => api<{ message: string }>(`/user/${id}`, { method: "DELETE" }),
};
