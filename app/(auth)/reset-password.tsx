import { useFonts } from "expo-font";
import { router, useLocalSearchParams } from "expo-router";
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
import { resetPassword } from "../../lib/auth";
import { Colors } from "../constants/Colors";

export default function ResetPasswordScreen() {
    const { token } = useLocalSearchParams<{ token?: string }>();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const [fontsLoaded] = useFonts({
        "Montserrat-Regular": require("@expo-google-fonts/montserrat/Montserrat_400Regular.ttf"),
        "Inter-Regular": require("@expo-google-fonts/inter/Inter_400Regular.ttf"),
        "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
        "Inter-SemiBold": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
    });

    if (!fontsLoaded) {
        return null;
    }

    // Missing token error state
    if (!token) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Грешка</Text>
                    <Text style={styles.errorDescription}>
                        Невалиден линк за възстановяване.
                    </Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.replace("/(auth)/forgot-password")}
                    >
                        <Text style={styles.primaryButtonText}>Заяви нов линк</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const validateForm = (): boolean => {
        setValidationError(null);

        if (newPassword.length < 8) {
            setValidationError("Паролата трябва да бъде поне 8 символа.");
            return false;
        }

        if (newPassword !== confirmPassword) {
            setValidationError("Паролите не съвпадат.");
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (isLoading) return;

        if (!validateForm()) return;

        setError(null);
        setIsLoading(true);

        try {
            await resetPassword(token, newPassword);
            setIsSuccess(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Възникна грешка. Моля, опитайте отново.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.replace("/(auth)/sign-in");
    };

    const handleRequestNewLink = () => {
        router.replace("/(auth)/forgot-password");
    };

    // Success state
    if (isSuccess) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Готово</Text>
                    <Text style={styles.description}>
                        Паролата е успешно сменена.
                    </Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleBackToLogin}>
                        <Text style={styles.primaryButtonText}>Към вход</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Check if error is token-related (terminal state)
    const isTokenError = error?.includes("невалиден") || error?.includes("изтекъл");

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Нова парола</Text>
                <Text style={styles.description}>
                    Въведи нова парола за акаунта си.
                </Text>

                <View style={styles.inputContainer}>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Нова парола"
                            placeholderTextColor="#4D4D4D"
                            value={newPassword}
                            onChangeText={(text) => {
                                setNewPassword(text);
                                setValidationError(null);
                            }}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.showButton}
                        >
                            <Text style={styles.showText}>{showPassword ? "Скрий" : "Покажи"}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Потвърди парола"
                            placeholderTextColor="#4D4D4D"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setValidationError(null);
                            }}
                            secureTextEntry={!showPassword}
                        />
                    </View>
                </View>

                {/* Validation Error */}
                {validationError && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{validationError}</Text>
                    </View>
                )}

                {/* API Error */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {isTokenError ? (
                    <TouchableOpacity style={styles.primaryButton} onPress={handleRequestNewLink}>
                        <Text style={styles.primaryButtonText}>Заяви нов линк</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Запази паролата</Text>
                        )}
                    </TouchableOpacity>
                )}

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
    errorDescription: {
        fontFamily: "Inter-Regular",
        fontSize: 16,
        color: Colors.error,
        marginBottom: 32,
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 24,
        gap: 16,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: 16,
        paddingRight: 0,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    showButton: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    showText: {
        fontFamily: "Inter-Medium",
        fontSize: 16,
        color: Colors.primary,
    },
    errorContainer: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: "rgba(255, 69, 58, 0.1)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 69, 58, 0.3)",
    },
    errorText: {
        fontFamily: "Inter-Medium",
        fontSize: 14,
        color: Colors.error,
        textAlign: "center",
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
