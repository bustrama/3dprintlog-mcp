const BASE_URL = process.env.PRINTLOG_API_URL ?? "https://api.3dprintlog.com";

export class PrintLogClient {
  private headers: Record<string, string>;

  constructor(apiKey: string) {
    this.headers = {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    const res = await fetch(url.toString(), {
      method,
      headers: this.headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      // Drain the body so the connection can be reused, but don't echo it
      // back — upstream error payloads can contain headers or tokens.
      await res.text().catch(() => undefined);
      throw new Error(`${method} ${path} → ${res.status} ${res.statusText}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  // ── Prints ────────────────────────────────────────────────────────────────

  listPrints(params?: {
    PageNumber?: number;
    PageSize?: number;
    searchText?: string;
    showOnlySuccessful?: boolean;
    showOnlyFailed?: boolean;
  }) {
    return this.request<unknown>("GET", "/api/Prints/summary", undefined, params as Record<string, string | number | boolean | undefined>);
  }

  getPrint(id: number) {
    return this.request<unknown>("GET", `/api/Prints/${id}`);
  }

  createPrint(data: unknown) {
    return this.request<unknown>("POST", "/api/Prints", data);
  }

  updatePrint(id: number, data: unknown) {
    return this.request<unknown>("PUT", `/api/Prints/${id}`, data);
  }

  deletePrint(id: number) {
    return this.request<void>("DELETE", `/api/Prints/${id}`);
  }

  // ── Filaments ─────────────────────────────────────────────────────────────

  listFilaments(params?: { PageNumber?: number; PageSize?: number; searchText?: string }) {
    return this.request<unknown>("GET", "/api/Filaments", undefined, params as Record<string, string | number | boolean | undefined>);
  }

  getFilament(id: string) {
    return this.request<unknown>("GET", `/api/Filaments/${id}`);
  }

  createFilament(data: unknown) {
    return this.request<unknown>("POST", "/api/Filaments", data);
  }

  updateFilament(id: string, data: unknown) {
    return this.request<unknown>("PUT", `/api/Filaments/${id}`, data);
  }

  deleteFilament(id: string) {
    return this.request<void>("DELETE", `/api/Filaments/${id}`);
  }

  getFilamentBrands() {
    return this.request<unknown>("GET", "/api/Filaments/brands");
  }

  getFilamentStorageLocations() {
    return this.request<unknown>("GET", "/api/Filaments/storage-locations");
  }

  // ── Printers ──────────────────────────────────────────────────────────────

  listPrinters(params?: { PageNumber?: number; PageSize?: number }) {
    return this.request<unknown>("GET", "/api/Printers/summary", undefined, params as Record<string, string | number | boolean | undefined>);
  }

  getPrinter(id: number) {
    return this.request<unknown>("GET", `/api/Printers/${id}`);
  }

  createPrinter(data: unknown) {
    return this.request<unknown>("POST", "/api/Printers", data);
  }

  updatePrinter(id: number, data: unknown) {
    return this.request<unknown>("PUT", `/api/Printers/${id}`, data);
  }

  deletePrinter(id: number) {
    return this.request<void>("DELETE", `/api/Printers/${id}`);
  }

  getPrinterFilament(id: number) {
    return this.request<unknown>("GET", `/api/Printers/${id}/filament`);
  }

  unloadPrinterFilament(id: number) {
    return this.request<unknown>("PUT", `/api/Printers/${id}/filament/unload`);
  }

  // ── Printer Maintenance ───────────────────────────────────────────────────

  listMaintenance(params?: { PageNumber?: number; PageSize?: number }) {
    return this.request<unknown>("GET", "/api/PrinterMaintenance", undefined, params as Record<string, string | number | boolean | undefined>);
  }

  getMaintenance(id: number) {
    return this.request<unknown>("GET", `/api/PrinterMaintenance/${id}`);
  }

  createMaintenance(data: unknown) {
    return this.request<unknown>("POST", "/api/PrinterMaintenance", data);
  }

  updateMaintenance(id: number, data: unknown) {
    return this.request<unknown>("PUT", `/api/PrinterMaintenance/${id}`, data);
  }

  deleteMaintenance(id: number) {
    return this.request<void>("DELETE", `/api/PrinterMaintenance/${id}`);
  }

  getMaintenanceCategories() {
    return this.request<unknown>("GET", "/api/PrinterMaintenance/categories");
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  listNotifications(params?: { PageNumber?: number; PageSize?: number }) {
    return this.request<unknown>("GET", "/api/Notifications", undefined, params as Record<string, string | number | boolean | undefined>);
  }

  getUnreadNotificationCount() {
    return this.request<unknown>("GET", "/api/Notifications/unread-count");
  }

  markAllNotificationsRead() {
    return this.request<unknown>("PUT", "/api/Notifications/read-all");
  }

  deleteAllNotifications() {
    return this.request<void>("DELETE", "/api/Notifications");
  }

  // ── Feed ──────────────────────────────────────────────────────────────────

  getFeed() {
    return this.request<unknown>("GET", "/api/Feed");
  }

  // ── Reference Data ────────────────────────────────────────────────────────

  getMaterials() {
    return this.request<unknown>("GET", "/api/Materials");
  }

  getPrinterCategories() {
    return this.request<unknown>("GET", "/api/PrinterCategories");
  }

  // ── Validate API key by making a lightweight request ──────────────────────

  async validate(): Promise<boolean> {
    try {
      await this.getUnreadNotificationCount();
      return true;
    } catch {
      return false;
    }
  }
}
