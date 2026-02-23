import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { exchangeOlxCode } from "../lib/olx";
import { Colors } from "./constants/Colors";

export default function OlxCallbackScreen() {
    const { code } = useLocalSearchParams<{ code: string }>();

    useEffect(() => {
        if (!code) {
            router.replace("/(tabs)");
            return;
        }

        exchangeOlxCode(code)
            .then(() => {
                // Go back to previous screen (the listing details)
                if (router.canGoBack()) {
                    router.back();
                } else {
                    router.replace("/(tabs)");
                }
            })
            .catch((error) => {
                console.error("OLX token exchange failed:", error);
                if (router.canGoBack()) {
                    router.back();
                } else {
                    router.replace("/(tabs)");
                }
            });
    }, [code]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.text}>Свързване с OLX...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    text: {
        color: Colors.white,
        fontSize: 16,
    },
});
