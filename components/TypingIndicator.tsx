import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Colors } from "../app/constants/Colors";

/**
 * Three-dot animated typing indicator rendered inside an assistant-style bubble.
 * Used as the FlatList footer while a chat reply is in flight.
 */
export function TypingIndicator() {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animateDot = (value: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(value, {
                        toValue: 1,
                        duration: 320,
                        useNativeDriver: true,
                    }),
                    Animated.timing(value, {
                        toValue: 0.3,
                        duration: 320,
                        useNativeDriver: true,
                    }),
                ])
            );

        const animations = [
            animateDot(dot1, 0),
            animateDot(dot2, 160),
            animateDot(dot3, 320),
        ];
        animations.forEach((a) => a.start());
        return () => animations.forEach((a) => a.stop());
    }, [dot1, dot2, dot3]);

    return (
        <View style={styles.row}>
            <View style={styles.bubble}>
                <Animated.View style={[styles.dot, { opacity: dot1 }]} />
                <Animated.View style={[styles.dot, { opacity: dot2 }]} />
                <Animated.View style={[styles.dot, { opacity: dot3 }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        alignItems: "flex-start",
        marginVertical: 4,
        paddingHorizontal: 12,
    },
    bubble: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.surface,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        gap: 4,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: Colors.textSecondary,
    },
});
