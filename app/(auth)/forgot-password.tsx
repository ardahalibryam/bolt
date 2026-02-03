import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { forgotPassword } from "../../lib/auth";
import { Colors } from "../constants/Colors";

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [fontsLoaded] = useFonts({
        "Montserrat-Regular": require("@expo-google-fonts/montserrat/Montserrat_400Regular.ttf"),
        "Inter-Regular": require("@expo-google-fonts/inter/Inter_400Regular.ttf"),
        "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
        "Inter-SemiBold": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
    });

    if (!fontsLoaded) {
        return null;
    }

    const handleSubmit = async () => {
        if (isLoading || !email.trim()) return;

        setIsLoading(true);

        try {
            await forgotPassword(email.trim());
        } catch {
            // Ignore errors - always show success for security
        } finally {
            setIsLoading(false);
            setIsSuccess(true);
        }
    };

    const handleBackToLogin = () => {
        router.replace("/(auth)/sign-in");
    };

    if (isSuccess) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Готово</Text>
                    <Text style={styles.description}>
                        Ако съществува акаунт с този имейл, ще получиш линк за смяна на паролата.
                    </Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleBackToLogin}>
                        <Text style={styles.primaryButtonText}>Назад към вход</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Забравена парола</Text>
                <Text style={styles.description}>
                    Въведи имейла си и ще ти изпратим линк за възстановяване на паролата.
                </Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Имейл"
                        placeholderTextColor="#4D4D4D"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.primaryButton, (!email.trim() || isLoading) && styles.primaryButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!email.trim() || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Изпрати линк</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.backLink} onPress={handleBackToLogin}>
                    <Text style={styles.backLinkText}>Назад към вход</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: "center",
    },
    title: {
        fontFamily: "Montserrat-Regular",
        fontSize: 30,
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    description: {
        fontFamily: "Inter-Regular",
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 32,
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 24,
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginBottom: 16,
    },
    primaryButtonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        fontFamily: "Inter-SemiBold",
        fontSize: 16,
        color: "#FFFFFF",
    },
    backLink: {
        alignItems: "center",
    },
    backLinkText: {
        fontFamily: "Inter-Medium",
        fontSize: 14,
        color: Colors.primary,
        textDecorationLine: "underline",
    },
});
