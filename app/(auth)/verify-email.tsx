import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    clearPendingVerification,
    resendVerification,
    setPendingVerification,
    storeToken,
    verifyEmail,
} from "../../lib/auth";
import { Colors } from "../constants/Colors";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
    const { email, autoSend } = useLocalSearchParams<{ email?: string; autoSend?: string }>();

    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Verification state
    const [verifying, setVerifying] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [statusMessage, setStatusMessage] = useState("");

    // Resend state
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Persist the pending state so the screen survives app restarts
    useEffect(() => {
        if (email) {
            setPendingVerification(email);
        }
    }, [email]);

    // Auto-send verification code when arriving from sign-in
    useEffect(() => {
        if (autoSend === "true" && email && !resending && cooldown === 0) {
            handleResend();
        }
    }, []);

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleDigitChange = (text: string, index: number) => {
        // Only accept digits
        const cleanText = text.replace(/[^0-9]/g, "");

        // Handle paste operation (length > 1)
        if (cleanText.length > 1) {
            const newDigits = [...digits];
            for (let i = 0; i < cleanText.length; i++) {
                if (index + i < CODE_LENGTH) {
                    newDigits[index + i] = cleanText[i];
                }
            }
            setDigits(newDigits);

            if (status === "error") {
                setStatus("idle");
                setStatusMessage("");
            }

            const nextFocusIndex = Math.min(index + cleanText.length, CODE_LENGTH - 1);
            inputRefs.current[nextFocusIndex]?.focus();

            // Auto-submit when all digits are filled from paste
            const fullCode = newDigits.join("");
            if (fullCode.length === CODE_LENGTH) {
                Keyboard.dismiss();
                handleVerify(fullCode);
            }
            return;
        }

        // Normal single digit typing
        const digit = cleanText.slice(-1);
        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);

        // Clear any previous error when user starts typing again
        if (status === "error") {
            setStatus("idle");
            setStatusMessage("");
        }

        if (digit && index < CODE_LENGTH - 1) {
            // Auto-advance to next input
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are filled by typing
        if (digit && index === CODE_LENGTH - 1) {
            const code = newDigits.join("");
            if (code.length === CODE_LENGTH) {
                Keyboard.dismiss();
                handleVerify(code);
            }
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === "Backspace" && !digits[index] && index > 0) {
            // Move back on backspace when current input is empty
            const newDigits = [...digits];
            newDigits[index - 1] = "";
            setDigits(newDigits);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (code: string) => {
        if (verifying) return;
        setVerifying(true);
        setStatus("idle");

        try {
            const authToken = await verifyEmail(code);
            await storeToken(authToken);
            await clearPendingVerification();
            setStatus("success");
            setStatusMessage("Имейлът е потвърден! Влизане...");

            setTimeout(() => {
                router.replace("/(tabs)/" as any);
            }, 1200);
        } catch (error: any) {
            setStatus("error");
            setStatusMessage(error.message || "Невалиден или изтекъл код.");
            // Clear inputs so user can try again
            setDigits(Array(CODE_LENGTH).fill(""));
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!email || resending || cooldown > 0) return;

        setResending(true);
        try {
            await resendVerification(email);
            setCooldown(RESEND_COOLDOWN_SECONDS);
            setStatus("idle");
            setStatusMessage("");
            setDigits(Array(CODE_LENGTH).fill(""));
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } catch (error: any) {
            setStatus("error");
            setStatusMessage(error.message);
        } finally {
            setResending(false);
        }
    };

    const handleBackToLogin = async () => {
        await clearPendingVerification();
        router.replace("/(auth)/sign-in");
    };

    const handleSubmitButton = () => {
        const code = digits.join("");
        if (code.length === CODE_LENGTH) {
            handleVerify(code);
        }
    };

    const isCodeComplete = digits.every((d) => d !== "");

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>
                        {status === "success" ? "✅" : "✉️"}
                    </Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>
                    {status === "success" ? "Успех!" : "Въведи код"}
                </Text>

                {/* Description */}
                <Text style={styles.description}>
                    {status === "success"
                        ? statusMessage
                        : email
                            ? `Изпратихме 6-цифрен код на ${email}`
                            : "Изпратихме 6-цифрен код на твоя имейл"}
                            <br />Проверете и спам папката!
                </Text>

                {/* Code Input Boxes */}
                {status !== "success" && (
                    <>
                        <View style={styles.codeRow}>
                            {digits.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { inputRefs.current[index] = ref; }}
                                    style={[
                                        styles.codeBox,
                                        digit ? styles.codeBoxFilled : null,
                                        status === "error" ? styles.codeBoxError : null,
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

                        {/* Error Message */}
                        {status === "error" && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{statusMessage}</Text>
                            </View>
                        )}

                        {/* Verify Button */}
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                (!isCodeComplete || verifying) && styles.disabledButton,
                            ]}
                            onPress={handleSubmitButton}
                            disabled={!isCodeComplete || verifying}
                        >
                            {verifying ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Потвърди</Text>
                            )}
                        </TouchableOpacity>

                        {/* Resend */}
                        <TouchableOpacity
                            style={[
                                styles.outlineButton,
                                (cooldown > 0 || resending || !email) && styles.disabledButton,
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
                        <TouchableOpacity style={styles.linkButton} onPress={handleBackToLogin}>
                            <Text style={styles.linkText}>Върни се към вход</Text>
                        </TouchableOpacity>
                    </>
                )}
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
        textAlign: "center",
    },
    description: {
        fontFamily: "Inter-Regular",
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 22,
        paddingHorizontal: 16,
    },
    codeRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        marginBottom: 24,
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
    errorBox: {
        backgroundColor: "rgba(255, 69, 58, 0.1)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        width: "100%",
        alignItems: "center",
    },
    errorText: {
        color: Colors.error,
        fontSize: 14,
        fontFamily: "Inter-Medium",
        textAlign: "center",
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        width: "100%",
        marginBottom: 12,
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
    disabledButton: {
        opacity: 0.5,
    },
    linkButton: {
        padding: 12,
    },
    linkText: {
        fontFamily: "Inter-Medium",
        fontSize: 14,
        color: Colors.primary,
        textDecorationLine: "underline",
    },
});
