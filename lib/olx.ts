import { apiDelete, apiGet, apiPost } from "./apiClient";

// ── Types ────────────────────────────────────────────────────────

export interface OlxStatus {
    connected: boolean;
    expiresAt?: string;
}

export interface OlxPublishResult {
    success: boolean;
    olxAdvertId: string;
    olxUrl?: string;
}

export interface OlxPublishStatus {
    published: boolean;
    olxAdvertId?: string;
    olxStatus?: "new" | "waiting" | "active" | "rejected";
}

// ── API Functions ────────────────────────────────────────────────

/** Check if the current user has connected their OLX account */
export async function getOlxStatus(): Promise<OlxStatus> {
    return apiGet<OlxStatus>("/olx/status");
}

/** Get the OLX authorization URL for OAuth flow */
export async function getOlxAuthUrl(): Promise<{ url: string }> {
    return apiGet<{ url: string }>("/olx/auth-url");
}

/** Exchange an OAuth authorization code for OLX tokens */
export async function exchangeOlxCode(code: string): Promise<void> {
    await apiPost("/olx/token", { code });
}

/** Publish a listing to OLX */
export async function publishToOlx(
    listingId: string,
    phone?: string
): Promise<OlxPublishResult> {
    return apiPost<OlxPublishResult>(
        `/olx/publish/${listingId}`,
        phone ? { phone } : undefined
    );
}

/** Get the OLX publish status for a listing */
export async function getOlxPublishStatus(
    listingId: string
): Promise<OlxPublishStatus> {
    return apiGet<OlxPublishStatus>(`/olx/publish/${listingId}/status`);
}

/** Disconnect the user's OLX account */
export async function disconnectOlx(): Promise<void> {
    await apiDelete("/olx/disconnect");
}
