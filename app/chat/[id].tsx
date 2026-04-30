import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatBubble } from "../../components/ChatBubble";
import { ChatComposer } from "../../components/ChatComposer";
import { LoadingScreen } from "../../components/LoadingScreen";
import { TypingIndicator } from "../../components/TypingIndicator";
import { ApiError } from "../../lib/apiClient";
import { ChatMessage, getConversation } from "../../lib/chat";
import { mapChatError } from "../../lib/chatErrors";
import { useChatThread } from "../../lib/useChatThread";
import { Colors } from "../constants/Colors";

const NEW_THREAD_ID = "new";
/** Pixel threshold for "user is near the bottom of the list". */
const NEAR_BOTTOM_PX = 80;
/** Approximate height of the chat header (paddingVertical 10 * 2 + ~26px content + 1px border). */
const HEADER_HEIGHT = 47;

export default function ChatThreadScreen() {
    const { id: routeId } = useLocalSearchParams<{ id: string }>();
    const id = Array.isArray(routeId) ? routeId[0] : routeId;
    const isNewThread = id === NEW_THREAD_ID;

    // Initial load state — only relevant for existing threads.
    const [initialMessages, setInitialMessages] = useState<ChatMessage[] | null>(
        isNewThread ? [] : null
    );
    const [initialConversationId, setInitialConversationId] = useState<string | null>(
        isNewThread ? null : null
    );
    const [serverTitle, setServerTitle] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (isNewThread) return;
        if (!id) {
            setLoadError("Невалиден разговор.");
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const thread = await getConversation(id);
                if (cancelled) return;
                setInitialMessages(thread.messages);
                setInitialConversationId(thread.id);
                setServerTitle(thread.title);
            } catch (error) {
                if (cancelled) return;
                if (error instanceof ApiError && error.status === 404) {
                    Alert.alert(
                        "Този разговор вече не съществува.",
                        undefined,
                        [{ text: "OK", onPress: () => router.replace("/(tabs)/assistant") }]
                    );
                    return;
                }
                const message = mapChatError(error) ?? "Неуспешно зареждане на разговора.";
                setLoadError(message);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, isNewThread]);

    if (loadError) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title="AI Асистент" />
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{loadError}</Text>
                    <TouchableOpacity
                        style={styles.errorButton}
                        onPress={() => router.replace("/(tabs)/assistant")}
                    >
                        <Text style={styles.errorButtonText}>Обратно към списъка</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (initialMessages === null) {
        return <LoadingScreen />;
    }

    return (
        <ChatThreadInner
            initialMessages={initialMessages}
            initialConversationId={initialConversationId}
            serverTitle={serverTitle}
        />
    );
}

interface InnerProps {
    initialMessages: ChatMessage[];
    initialConversationId: string | null;
    serverTitle: string | null;
}

function ChatThreadInner({ initialMessages, initialConversationId, serverTitle }: InnerProps) {
    const insets = useSafeAreaInsets();
    const [inputText, setInputText] = useState("");
    const { messages, isSending, send, retry } = useChatThread({
        initialMessages,
        initialConversationId,
    });

    // Smart scroll state: only auto-scroll when user is at/near the bottom.
    const flatListRef = useRef<FlatList<ChatMessage>>(null);
    const isNearBottomRef = useRef(true);
    const [showNewMessagePill, setShowNewMessagePill] = useState(false);
    // Initialize to 0 so the very first effect run on an already-populated
    // thread (e.g. opened via the list) auto-scrolls to the latest message.
    const lastMessageCountRef = useRef(0);

    const headerTitle = useMemo(() => {
        if (serverTitle) return serverTitle;
        const firstUser = messages.find((m) => m.role === "user");
        if (firstUser) return truncate(firstUser.text, 40);
        return "Нов разговор";
    }, [serverTitle, messages]);

    // Detect new messages and decide whether to auto-scroll or show the pill.
    useEffect(() => {
        const grew = messages.length > lastMessageCountRef.current;
        lastMessageCountRef.current = messages.length;
        if (!grew) return;

        if (isNearBottomRef.current) {
            // Defer to next frame so layout has settled.
            requestAnimationFrame(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            });
        } else {
            setShowNewMessagePill(true);
        }
    }, [messages.length]);

    const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
        const nearBottom = distanceFromBottom < NEAR_BOTTOM_PX;
        isNearBottomRef.current = nearBottom;
        if (nearBottom && showNewMessagePill) {
            setShowNewMessagePill(false);
        }
    }, [showNewMessagePill]);

    const handleSend = useCallback(() => {
        const trimmed = inputText.trim();
        if (!trimmed) return;
        setInputText("");
        send(trimmed);
    }, [inputText, send]);

    const scrollToBottom = useCallback(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
        setShowNewMessagePill(false);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title={headerTitle}
                onBack={() => router.back()}
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                // Offset = top safe area + header height, so the KAV knows
                // how much non-keyboard-avoiding space sits above it.
                keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + HEADER_HEIGHT : 0}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>Здравей, аз съм Bolt.</Text>
                        <Text style={styles.emptySubtitle}>С какво мога да помогна?</Text>
                    </View>
                ) : (
                    <View style={styles.flex}>
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(m) => m.id}
                            renderItem={({ item }) => (
                                <ChatBubble
                                    role={item.role}
                                    text={item.text}
                                    pending={item.pending}
                                    failed={item.failed}
                                    onRetry={item.failed ? () => retry(item.id) : undefined}
                                />
                            )}
                            contentContainerStyle={styles.listContent}
                            ListFooterComponent={isSending ? <TypingIndicator /> : null}
                            onScroll={handleScroll}
                            scrollEventThrottle={64}
                            keyboardShouldPersistTaps="handled"
                            initialNumToRender={20}
                            maxToRenderPerBatch={20}
                        />
                        {showNewMessagePill && (
                            <NewMessagePill onPress={scrollToBottom} />
                        )}
                    </View>
                )}

                <ChatComposer
                    value={inputText}
                    onChangeText={setInputText}
                    onSend={handleSend}
                    isSending={isSending}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header({ title, onBack }: { title: string; onBack?: () => void }) {
    return (
        <View style={styles.header}>
            <View style={styles.headerSide}>
                {onBack ? (
                    <TouchableOpacity
                        onPress={onBack}
                        style={styles.headerBackButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
                    </TouchableOpacity>
                ) : null}
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            <View style={styles.headerSide} />
        </View>
    );
}

// ─── New-message pill ──────────────────────────────────────────────────────

function NewMessagePill({ onPress }: { onPress: () => void }) {
    const opacity = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    }, [opacity]);

    return (
        <Animated.View style={[styles.pillContainer, { opacity }]} pointerEvents="box-none">
            <TouchableOpacity style={styles.pill} onPress={onPress} activeOpacity={0.85}>
                <Ionicons name="arrow-down" size={14} color="#FFFFFF" />
                <Text style={styles.pillText}>Ново съобщение</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    return text.slice(0, max - 1).trimEnd() + "…";
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    flex: {
        flex: 1,
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    errorText: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: "center",
        marginBottom: 20,
    },
    errorButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
    },
    errorButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 15,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerSide: {
        width: 40,
    },
    headerBackButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.textPrimary,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: "center",
    },
    listContent: {
        paddingVertical: 12,
    },
    pillContainer: {
        position: "absolute",
        bottom: 16,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: Colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    pillText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
    },
});
