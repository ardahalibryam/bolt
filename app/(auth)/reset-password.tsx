import { useFonts } from "expo-font";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PasswordChecklist from "../../components/PasswordChecklist";
import { forgotPassword, resetPassword } from "../../lib/auth";
import { isPasswordValid, validatePassword } from "../../lib/passwordValidation";
import { Colors } from "../constants/Colors";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function ResetPasswordScreen() {
    const { email } = useLocalSearchParams<{ email?: string }>();

    // Code input state
    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Password state
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Form state
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Resend state
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const [fontsLoaded] = useFonts({
        "Montserrat-Regular": require("@expo-google-fonts/montserrat/Montserrat_400Regular.ttf"),
        "Inter-Regular": require("@expo-google-fonts/inter/Inter_400Regular.ttf"),
        "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
        "Inter-SemiBold": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
    });

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    if (!fontsLoaded) {
        return null;
    }

    // ── Code input handlers ─────────────────────────────────────

    const handleDigitChange = (text: string, index: number) => {
        const cleanText = text.replace(/[^0-9]/g, "");

        if (cleanText.length > 1) {
            const newDigits = [...digits];
            for (let i = 0; i < cleanText.length; i++) {
                if (index + i < CODE_LENGTH) {
                    newDigits[index + i] = cleanText[i];
                }
            }
            setDigits(newDigits);

            if (error) {
                setError(null);
            }

            const nextFocusIndex = Math.min(index + cleanText.length, CODE_LENGTH - 1);
            inputRefs.current[nextFocusIndex]?.focus();
            return;
        }

        const digit = cleanText.slice(-1);
        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);

        // Clear previous errors when user starts typing again
        if (error) {
            setError(null);
        }

        if (digit && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === "Backspace" && !digits[index] && index > 0) {
            const newDigits = [...digits];
            newDigits[index - 1] = "";
            setDigits(newDigits);
            inputRefs.current[index - 1]?.focus();
        }
    };

    // ── Form validation & submit ────────────────────────────────

    const isCodeComplete = digits.every((d) => d !== "");

    const validateForm = (): boolean => {
        setValidationError(null);

        if (!isCodeComplete) {
            setValidationError("Моля, въведете 6-цифрения код.");
            return false;
        }

        if (!isPasswordValid(validatePassword(newPassword))) {
            setValidationError("Паролата не отговаря на изискванията за сигурност.");
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
        Keyboard.dismiss();

        try {
            const code = digits.join("");
            await resetPassword(code, newPassword);
            setIsSuccess(true);
        } catch (err: any) {
            const status = err?.status;
            if (status === 400) {
                setError("Невалиден или изтекъл код.");
            } else {
                const message = err instanceof Error ? err.message : "Възникна грешка. Моля, опитайте отново.";
                setError(message);
            }
            // Clear code inputs so user can try again
            setDigits(Array(CODE_LENGTH).fill(""));
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Resend handler ──────────────────────────────────────────

    const handleResend = async () => {
        if (!email || resending || cooldown > 0) return;

        setResending(true);
        try {
            await forgotPassword(email);
            setCooldown(RESEND_COOLDOWN_SECONDS);
            setError(null);
            setDigits(Array(CODE_LENGTH).fill(""));
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } catch {
            // Ignore errors
        } finally {
            setResending(false);
        }
    };

    const handleBackToLogin = () => {
        router.replace("/(auth)/sign-in");
    };

    // ── Success state ───────────────────────────────────────────

    if (isSuccess) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centeredContent}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>✅</Text>
                    </View>
                    <Text style={styles.title}>Готово!</Text>
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

    // ── Main form ───────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🔒</Text>
                    </View>

                    <Text style={styles.titleCentered}>Въведи код</Text>
                    <Text style={styles.descriptionCentered}>
                        {email
                            ? `Изпратихме 6-цифрен код на ${email}`
                            : "Изпратихме 6-цифрен код на твоя имейл"}
                            <br />Проверете и спам папката!
                    </Text>

                    {/* 6-digit Code Input Row */}
                    <View style={styles.codeRow}>
                        {digits.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={[
                                    styles.codeBox,
                                    digit ? styles.codeBoxFilled : null,
                                    error ? styles.codeBoxError : null,
                                ]}
                                value={digit}
                                onChangeText={(text) => handleDigitChange(text, index)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                keyboardType="number-pad"
                                maxLength={CODE_LENGTH}
                                textContentType="oneTimeCode"
                                autoFocus={index === 0}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <Text style={styles.expiryHint}>Кодът изтича след 20 минути</Text>

                    {/* Password Inputs */}
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

                        <PasswordChecklist password={newPassword} />

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

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            (!isCodeComplete || isLoading) && styles.primaryButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!isCodeComplete || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Смяна на парола</Text>
                        )}
                    </TouchableOpacity>

                    {/* Resend Button */}
                    <TouchableOpacity
                        style={[
                            styles.outlineButton,
                            (cooldown > 0 || resending || !email) && styles.primaryButtonDisabled,
                        ]}
                        onPress={handleResend}
                        disabled={cooldown > 0 || resending || !email}
                    >
                        {resending ? (
                            <ActivityIndicator color={Colors.primary} />
                        ) : (
                            <Text style={styles.outlineButtonText}>
                                {cooldown > 0
                                    ? `Изпрати отново (${cooldown}с)`
                                    : "Изпрати отново"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Back to login */}
                    <TouchableOpacity style={styles.backLink} onPress={handleBackToLogin}>
                        <Text style={styles.backLinkText}>Назад към вход</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    centeredContent: {
        flex: 1,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#E6F4FE",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    icon: {
        fontSize: 40,
    },
    title: {
        fontFamily: "Montserrat-Regular",
        fontSize: 24,
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    titleCentered: {
        fontFamily: "Montserrat-Regular",
        fontSize: 24,
        color: Colors.textPrimary,
        marginBottom: 12,
        textAlign: "center",
    },
    description: {
        fontFamily: "Inter-Regular",
        fontSize: 15,
        color: Colors.textSecondary,
        marginBottom: 32,
        lineHeight: 22,
    },
    descriptionCentered: {
        fontFamily: "Inter-Regular",
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 22,
        paddingHorizontal: 16,
    },
    // ── Code Input ──────────────────────────────────────────────
    codeRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginBottom: 12,
    },
    codeBox: {
        width: 48,
        height: 56,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
        textAlign: "center",
        fontSize: 24,
        fontWeight: "600",
        color: Colors.textPrimary,
    },
    codeBoxFilled: {
        borderColor: Colors.primary,
    },
    codeBoxError: {
        borderColor: Colors.error,
    },
    expiryHint: {
        fontFamily: "Inter-Regular",
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 28,
        textAlign: "center",
    },
    // ── Password Inputs ─────────────────────────────────────────
    inputContainer: {
        width: "100%",
        marginBottom: 16,
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
    // ── Errors ───────────────────────────────────────────────────
    errorContainer: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: "rgba(255, 69, 58, 0.1)",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 69, 58, 0.3)",
        width: "100%",
    },
    errorText: {
        fontFamily: "Inter-Medium",
        fontSize: 14,
        color: Colors.error,
        textAlign: "center",
    },
    // ── Buttons ──────────────────────────────────────────────────
    primaryButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        width: "100%",
        marginBottom: 12,
    },
    primaryButtonDisabled: {
        opacity: 0.5,
    },
    primaryButtonText: {
        fontFamily: "Inter-SemiBold",
        fontSize: 16,
        color: "#FFFFFF",
    },
    outlineButton: {
        backgroundColor: "transparent",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        width: "100%",
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 12,
    },
    outlineButtonText: {
        fontFamily: "Inter-Medium",
        fontSize: 16,
        color: Colors.textPrimary,
    },
    backLink: {
        padding: 12,
        alignItems: "center",
    },
    backLinkText: {
        fontFamily: "Inter-Medium",
        fontSize: 14,
        color: Colors.primary,
        textDecorationLine: "underline",
    },
});
