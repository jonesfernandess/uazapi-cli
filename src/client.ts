import { getAdminToken, getBaseUrl, getToken } from "./config.js";

export interface ApiResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export class UazapiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(admin = false) {
    this.baseUrl = getBaseUrl();
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(admin ? { admintoken: getAdminToken() } : { token: getToken() }),
    };
  }

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  async get(path: string): Promise<ApiResponse> {
    const resp = await fetch(this.url(path), {
      method: "GET",
      headers: this.headers,
    });
    return this.handleResponse(resp);
  }

  async post(path: string, body?: Record<string, unknown>): Promise<ApiResponse> {
    const resp = await fetch(this.url(path), {
      method: "POST",
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse(resp);
  }

  async delete(path: string, body?: Record<string, unknown>): Promise<ApiResponse> {
    const resp = await fetch(this.url(path), {
      method: "DELETE",
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse(resp);
  }

  async put(path: string, body?: Record<string, unknown>): Promise<ApiResponse> {
    const resp = await fetch(this.url(path), {
      method: "PUT",
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse(resp);
  }

  private async handleResponse(resp: Response): Promise<ApiResponse> {
    let data: unknown;
    const text = await resp.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { ok: resp.ok, status: resp.status, data };
  }
}

/** Build a body object, excluding undefined/null values */
export function buildBody(obj: Record<string, unknown>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) body[k] = v;
  }
  return body;
}
