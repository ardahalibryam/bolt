import { apiDelete, apiGet, apiPost } from "./apiClient";

/**
 * Client-side timeout for chat requests.
 * Backend Gemini calls can take up to 20s; 30s gives 10s headroom for network.
 */
const CHAT_TIMEOUT_MS = 30000;

export const MAX_MESSAGE_LENGTH = 2000;

// ─── Types ──────────────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant";

/**
 * A single message rendered in the UI. Server messages have stable ids;
 * optimistic client-side messages use a `temp-` prefix until they're either
 * confirmed by a successful response or marked as failed.
 */
export interface ChatMessage {
    id: string;
    role: ChatRole;
    text: string;
    createdAt: string;
    /** True while the message is awaiting the server's reply. */
    pending?: boolean;
    /** True when the most recent send attempt for this message failed. */
    failed?: boolean;
}

export interface SendChatResponse {
    reply: string;
    conversationId: string;
    createdAt: string;
}

export interface ConversationListItem {
    id: string;
    title: string;
    messageCount: number;
    lastMessage: string;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationListResponse {
    items: ConversationListItem[];
    total: number;
}

interface BackendThreadMessage {
    id: string;
    role: ChatRole;
    text: string;
    createdAt: string;
}

interface BackendThread {
    id: string;
    title: string;
    messages: BackendThreadMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface ChatThread {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wraps an async fetch-style call with an AbortController-based timeout.
 * The signal is passed into the function so the underlying request is
 * actually cancelled when the timeout fires (not just a Promise.race illusion).
 */
async function withTimeout<T>(
    fn: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number
): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fn(controller.signal);
    } finally {
        clearTimeout(timeoutId);
    }
}

// ─── Endpoints ──────────────────────────────────────────────────────────────

/**
 * Send a chat message. Pass `null` for `conversationId` to start a fresh thread;
 * the response always carries the (existing or newly-created) conversation id.
 */
export async function sendChat(
    message: string,
    conversationId: string | null
): Promise<SendChatResponse> {
    return withTimeout((signal) => {
        const body: Record<string, string> = { message };
        if (conversationId) body.conversationId = conversationId;
        return apiPost<SendChatResponse>("/chat", body, { signal });
    }, CHAT_TIMEOUT_MS);
}

export async function listConversations(
    limit = 20,
    skip = 0
): Promise<ConversationListResponse> {
    return withTimeout(
        (signal) => apiGet<ConversationListResponse>(
            `/chat/conversations?limit=${limit}&skip=${skip}`,
            { signal }
        ),
        CHAT_TIMEOUT_MS
    );
}

export async function getConversation(id: string): Promise<ChatThread> {
    return withTimeout(async (signal) => {
        const raw = await apiGet<BackendThread>(`/chat/conversations/${id}`, { signal });
        return {
            id: raw.id,
            title: raw.title,
            messages: raw.messages.map((m) => ({
                id: m.id,
                role: m.role,
                text: m.text,
                createdAt: m.createdAt,
            })),
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
    }, CHAT_TIMEOUT_MS);
}

export async function deleteConversation(id: string): Promise<void> {
    return withTimeout(
        (signal) => apiDelete<void>(`/chat/conversations/${id}`, { signal }),
        CHAT_TIMEOUT_MS
    );
}
