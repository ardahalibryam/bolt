import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Colors } from "../app/constants/Colors";

interface LoadingScreenProps {
    /** Optional background color, defaults to theme background */
    backgroundColor?: string;
}

/**
 * A full-screen loading indicator component.
 * Use this while fetching data to provide visual feedback.
 */
export function LoadingScreen({ backgroundColor }: LoadingScreenProps) {
    return (
        <View style={[styles.container, backgroundColor && { backgroundColor }]}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.black,
    },
});
