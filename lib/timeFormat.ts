/**
 * Bulgarian relative-time formatter.
 * Returns short, human-friendly strings suitable for chat list rows.
 *
 * Examples:
 *   < 1 min  → "сега"
 *   < 1 h    → "преди 5 мин"
 *   < 24 h   → "преди 3 ч"
 *   yesterday → "вчера"
 *   < 7 days → "преди 3 дни"
 *   else     → "21.04.2026"
 */
export function formatRelativeTimeBg(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const now = Date.now();
    const diffMs = Math.max(0, now - then);
    const diffMin = Math.floor(diffMs / 60_000);
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1) return "сега";
    if (diffMin < 60) return `преди ${diffMin} мин`;
    if (diffH < 24) return `преди ${diffH} ч`;
    if (diffDays === 1) return "вчера";
    if (diffDays < 7) return `преди ${diffDays} дни`;

    try {
        return new Date(iso).toLocaleDateString("bg-BG", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return "";
    }
}
