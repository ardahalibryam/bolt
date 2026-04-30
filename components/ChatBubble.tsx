import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../app/constants/Colors";
import { ChatRole } from "../lib/chat";

interface ChatBubbleProps {
    role: ChatRole;
    text: string;
    /** True while waiting for the assistant's reply to this user message. */
    pending?: boolean;
    /** True when the most recent send attempt failed. */
    failed?: boolean;
    /** Called when the user taps the failure hint to retry. */
    onRetry?: () => void;
}

const ENTRY_DURATION = 220;
const ENTRY_OFFSET = 16;

export function ChatBubble({ role, text, pending, failed, onRetry }: ChatBubbleProps) {
    const isUser = role === "user";

    // Subtle entry animation: bubble fades in and slides slightly inward
    // (from the side it's anchored to). Cheap, hardware-accelerated, runs once.
    const opacity = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(isUser ? ENTRY_OFFSET : -ENTRY_OFFSET)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: ENTRY_DURATION,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateX, {
                toValue: 0,
                duration: ENTRY_DURATION,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, [opacity, translateX]);

    return (
        <Animated.View
            style={[
                styles.row,
                isUser ? styles.userRow : styles.assistantRow,
                { opacity, transform: [{ translateX }] },
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                    pending && styles.pendingBubble,
                    failed && styles.failedBubble,
                ]}
            >
                <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
                    {text}
                </Text>
            </View>
            {failed && onRetry ? (
                <TouchableOpacity
                    onPress={onRetry}
                    style={styles.retryButton}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                    <Text style={styles.retryHint}>! Натисни за повторно изпращане</Text>
                </TouchableOpacity>
            ) : null}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    row: {
        marginVertical: 4,
        paddingHorizontal: 12,
        maxWidth: "100%",
    },
    userRow: {
        alignItems: "flex-end",
    },
    assistantRow: {
        alignItems: "flex-start",
    },
    bubble: {
        maxWidth: "82%",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    userBubble: {
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: Colors.surface,
        borderBottomLeftRadius: 4,
    },
    pendingBubble: {
        opacity: 0.65,
    },
    failedBubble: {
        borderWidth: 1,
        borderColor: Colors.error,
    },
    text: {
        fontSize: 15,
        lineHeight: 21,
    },
    userText: {
        color: "#FFFFFF",
    },
    assistantText: {
        color: Colors.textPrimary,
    },
    retryButton: {
        marginTop: 4,
        paddingHorizontal: 4,
    },
    retryHint: {
        fontSize: 12,
        color: Colors.error,
        fontWeight: "500",
    },
});
