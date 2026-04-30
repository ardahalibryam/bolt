import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConversationListRow } from "../../components/ConversationListRow";
import {
    ConversationListItem,
    deleteConversation,
    listConversations,
} from "../../lib/chat";
import { mapChatError } from "../../lib/chatErrors";
import { Colors } from "../constants/Colors";

const PAGE_SIZE = 50;

export default function AssistantListScreen() {
    const [conversations, setConversations] = useState<ConversationListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchList = useCallback(async (mode: "initial" | "refresh") => {
        if (mode === "initial") setLoading(true);
        if (mode === "refresh") setRefreshing(true);
        try {
            const data = await listConversations(PAGE_SIZE, 0);
            setConversations(data.items);
            setError(null);
        } catch (err) {
            const message = mapChatError(err) ?? "Неуспешно зареждане.";
            setError(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Refresh whenever the tab becomes focused — covers "user just sent a
    // message in a thread and tapped back to the list".
    useFocusEffect(
        useCallback(() => {
            fetchList("initial");
        }, [fetchList])
    );

    const goToNewThread = () => router.push({ pathname: "/chat/[id]", params: { id: "new" } });
    const goToThread = (id: string) => router.push({ pathname: "/chat/[id]", params: { id } });

    const handleDelete = useCallback(async (item: ConversationListItem) => {
        Alert.alert(
            "Изтриване на разговор",
            "Сигурен ли си? Този разговор ще бъде изтрит завинаги.",
            [
                { text: "Отказ", style: "cancel" },
                {
                    text: "Изтрий",
                    style: "destructive",
                    onPress: async () => {
                        // Optimistic removal
                        const previous = conversations;
                        setConversations((prev) => prev.filter((c) => c.id !== item.id));
                        try {
                            await deleteConversation(item.id);
                        } catch (err) {
                            // 404 = already gone — keep the optimistic removal.
                            const isAlreadyGone =
                                err instanceof Error && /404|not found/i.test(String(err));
                            if (!isAlreadyGone) {
                                setConversations(previous);
                                const message = mapChatError(err) ?? "Неуспешно изтриване.";
                                Alert.alert("Грешка", message);
                            }
                        }
                    },
                },
            ]
        );
    }, [conversations]);

    const renderRightActions = (item: ConversationListItem) => (
        <TouchableOpacity
            style={styles.swipeAction}
            onPress={() => handleDelete(item)}
            activeOpacity={0.85}
        >
            <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Изтрий</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <View style={styles.headerSide} />
                <Text style={styles.headerTitle}>AI Асистент</Text>
                <View style={styles.headerSide}>
                    <TouchableOpacity
                        onPress={goToNewThread}
                        style={styles.newButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="add-circle-outline" size={26} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading && conversations.length === 0 ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={Colors.primary} />
                </View>
            ) : error && conversations.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>{error}</Text>
                    <TouchableOpacity
                        onPress={() => fetchList("initial")}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryButtonText}>Опитай отново</Text>
                    </TouchableOpacity>
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.centered}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="chatbubble-ellipses-outline" size={36} color={Colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>Все още нямаш разговори</Text>
                    <Text style={styles.emptyText}>
                        Започни нов разговор с AI асистента и попитай каквото и да е за продажбите си.
                    </Text>
                    <TouchableOpacity onPress={goToNewThread} style={styles.ctaButton} activeOpacity={0.85}>
                        <Text style={styles.ctaButtonText}>Започни разговор</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(c) => c.id}
                    renderItem={({ item }) => (
                        <Swipeable
                            renderRightActions={() => renderRightActions(item)}
                            overshootRight={false}
                        >
                            <ConversationListRow
                                conversation={item}
                                onPress={() => goToThread(item.id)}
                            />
                        </Swipeable>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchList("refresh")}
                            tintColor={Colors.primary}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerSide: {
        width: 40,
        alignItems: "flex-end",
    },
    headerTitle: {
        flex: 1,
        textAlign: "center",
        fontSize: 17,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    newButton: {
        padding: 4,
    },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    emptyIconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.surface,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.textPrimary,
        marginBottom: 8,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    ctaButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    ctaButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 15,
    },
    retryButton: {
        marginTop: 4,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    retryButtonText: {
        color: Colors.primary,
        fontWeight: "600",
        fontSize: 14,
    },
    swipeAction: {
        backgroundColor: Colors.error,
        justifyContent: "center",
        alignItems: "center",
        width: 84,
        flexDirection: "column",
        gap: 4,
    },
    swipeActionText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
});
