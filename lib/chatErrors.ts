import { ApiError } from "./apiClient";

/**
 * Sentinel returned by `mapChatError` when no toast/alert should be shown to
 * the user — e.g. on 401 the apiClient already redirects to sign-in, and a
 * toast on top of that would be noise.
 */
export const SUPPRESS_TOAST = null;

/**
 * Maps any error thrown from a chat-related call into a Bulgarian, user-facing
 * message. Returns `SUPPRESS_TOAST` (null) when the caller should show nothing.
 */
export function mapChatError(error: unknown): string | null {
    // AbortError: client-side timeout (30s) or explicit cancel.
    if (isAbortError(error)) {
        return "Заявката отне твърде дълго. Опитай отново.";
    }

    if (error instanceof ApiError) {
        switch (error.status) {
            case 400:
                return "Съобщението е невалидно.";
            case 401:
                // apiClient already triggers re-auth — silent here.
                return SUPPRESS_TOAST;
            case 404:
                return "Този разговор вече не съществува.";
            case 429:
                // Backend can't distinguish per-minute from daily — same copy.
                return "Твърде много съобщения. Опитай отново след малко.";
            case 503:
                // Backend already returns Bulgarian copy for 503; safe to surface.
                return error.message || "AI услугата временно не е достъпна. Моля опитайте отново.";
            default:
                return error.message || "Възникна грешка. Моля опитай отново.";
        }
    }

    if (error instanceof Error) {
        // RN's fetch throws TypeError("Network request failed") on no connection.
        if (/network/i.test(error.message)) {
            return "Няма връзка с интернет.";
        }
    }

    return "Възникна грешка. Моля опитай отново.";
}

function isAbortError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    return error.name === "AbortError" || /abort/i.test(error.message);
}
