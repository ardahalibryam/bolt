import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Colors } from "../app/constants/Colors";
import { MAX_MESSAGE_LENGTH } from "../lib/chat";

const COUNTER_THRESHOLD = 1800;

interface ChatComposerProps {
    value: string;
    onChangeText: (text: string) => void;
    /** Fired when the user taps send. Caller is responsible for trimming/validation. */
    onSend: () => void;
    /** True while a chat request is in flight; disables the send button (input stays editable). */
    isSending: boolean;
}

/**
 * Bottom input bar for the chat screen.
 *
 * - Input is always editable (per backend integration doc §9 — let user keep
 *   composing while the previous reply is in flight).
 * - Send button is disabled when input is empty/whitespace OR a request is
 *   already in flight (one in-flight request per conversation prevents a
 *   known race in the backend's non-atomic save).
 * - Char counter only appears when nearing the 2000-char limit.
 */
export function ChatComposer({ value, onChangeText, onSend, isSending }: ChatComposerProps) {
    const trimmedLength = value.trim().length;
    const canSend = trimmedLength > 0 && !isSending && value.length <= MAX_MESSAGE_LENGTH;
    const showCounter = value.length >= COUNTER_THRESHOLD;
    const atMaxLength = value.length >= MAX_MESSAGE_LENGTH;

    return (
        <View style={styles.container}>
            {showCounter && (
                <Text style={[styles.counter, atMaxLength && styles.counterMax]}>
                    {value.length}/{MAX_MESSAGE_LENGTH}
                </Text>
            )}
            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="Напиши съобщение..."
                    placeholderTextColor={Colors.inactive}
                    multiline
                    maxLength={MAX_MESSAGE_LENGTH}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                    onPress={onSend}
                    disabled={!canSend}
                    activeOpacity={0.7}
                >
                    {isSending ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Ionicons
                            name="send"
                            size={18}
                            color={canSend ? "#FFFFFF" : Colors.inactive}
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.background,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
    },
    counter: {
        alignSelf: "flex-end",
        fontSize: 11,
        color: Colors.textSecondary,
        marginBottom: 4,
        marginRight: 4,
    },
    counterMax: {
        color: Colors.error,
        fontWeight: "600",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 140,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        fontSize: 15,
        color: Colors.textPrimary,
        lineHeight: 20,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    sendButtonDisabled: {
        backgroundColor: Colors.surface,
    },
});
