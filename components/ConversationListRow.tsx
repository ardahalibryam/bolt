import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../app/constants/Colors";
import { ConversationListItem } from "../lib/chat";
import { formatRelativeTimeBg } from "../lib/timeFormat";

interface ConversationListRowProps {
    conversation: ConversationListItem;
    onPress: () => void;
}

export function ConversationListRow({ conversation, onPress }: ConversationListRowProps) {
    return (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.body}>
                <View style={styles.headerLine}>
                    <Text style={styles.title} numberOfLines={1}>
                        {conversation.title || "Нов разговор"}
                    </Text>
                    <Text style={styles.time}>{formatRelativeTimeBg(conversation.updatedAt)}</Text>
                </View>
                <Text style={styles.preview} numberOfLines={1}>
                    {conversation.lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    body: {
        flex: 1,
    },
    headerLine: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    title: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: Colors.textPrimary,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    preview: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
});
