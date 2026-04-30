import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { ApiError } from "./apiClient";
import { ChatMessage, MAX_MESSAGE_LENGTH, sendChat } from "./chat";
import { mapChatError } from "./chatErrors";

interface UseChatThreadOptions {
    /** Initial messages (e.g. from a previously-loaded conversation). */
    initialMessages?: ChatMessage[];
    /** Initial conversation id; null/undefined for a fresh thread. */
    initialConversationId?: string | null;
}

interface UseChatThreadResult {
    messages: ChatMessage[];
    isSending: boolean;
    /** The active conversation id; populated after the first successful send. */
    conversationId: string | null;
    /** Send a new message. Caller must trim. */
    send: (text: string) => Promise<void>;
    /** Re-send a message previously marked as failed. */
    retry: (messageId: string) => Promise<void>;
    /** Reset the entire thread state — used by "Нов разговор". */
    reset: () => void;
}

/**
 * Encapsulates the optimistic-render + send + error-handling logic for a single
 * chat thread. Used by both the "fresh thread" entry point and the
 * "load existing thread" entry point so they can share identical behavior.
 *
 * Behavior contracts:
 * - `send` is a no-op if `isSending` is true or text is empty/over the cap.
 * - On 404, conversationId is wiped — the next send creates a fresh thread.
 * - On any failure, the user message is preserved in the list with `failed:true`
 *   so the UI can render a retry hint.
 * - Error toasts are surfaced via Alert.alert; pass `null` from mapChatError to
 *   suppress (used for 401 since apiClient handles re-auth).
 */
export function useChatThread(options: UseChatThreadOptions = {}): UseChatThreadResult {
    const [messages, setMessages] = useState<ChatMessage[]>(options.initialMessages ?? []);
    const [isSending, setIsSending] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(
        options.initialConversationId ?? null
    );

    const sendInternal = useCallback(
        async (text: string) => {
            const tempId = makeTempId();
            const userMessage: ChatMessage = {
                id: tempId,
                role: "user",
                text,
                createdAt: new Date().toISOString(),
                pending: true,
            };
            setMessages((prev) => [...prev, userMessage]);
            setIsSending(true);

            try {
                const response = await sendChat(text, conversationId);
                setMessages((prev) => [
                    ...prev.map((m) => (m.id === tempId ? { ...m, pending: false } : m)),
                    {
                        id: `asst-${response.createdAt}`,
                        role: "assistant",
                        text: response.reply,
                        createdAt: response.createdAt,
                    },
                ]);
                setConversationId(response.conversationId);
            } catch (error) {
                if (error instanceof ApiError && error.status === 404) {
                    setConversationId(null);
                }
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === tempId ? { ...m, pending: false, failed: true } : m
                    )
                );
                const message = mapChatError(error);
                if (message) {
                    Alert.alert("Грешка", message);
                }
            } finally {
                setIsSending(false);
            }
        },
        [conversationId]
    );

    const send = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || isSending || trimmed.length > MAX_MESSAGE_LENGTH) return;
            await sendInternal(trimmed);
        },
        [isSending, sendInternal]
    );

    const retry = useCallback(
        async (messageId: string) => {
            if (isSending) return;
            const failedMessage = messages.find((m) => m.id === messageId);
            if (!failedMessage) return;
            // Drop the failed bubble before re-sending so we don't render two attempts.
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            await sendInternal(failedMessage.text);
        },
        [messages, isSending, sendInternal]
    );

    const reset = useCallback(() => {
        setMessages([]);
        setConversationId(null);
    }, []);

    return { messages, isSending, conversationId, send, retry, reset };
}

/**
 * Generates a collision-resistant client-side id for optimistic messages.
 * Date.now() alone can collide if two messages are sent in the same ms.
 */
function makeTempId(): string {
    return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
