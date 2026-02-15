import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resendVerification, storeToken, verifyEmail } from "../../lib/auth";
import { Colors } from "../constants/Colors";

export default function VerifyEmailScreen() {
    const { email, token } = useLocalSearchParams<{ email?: string; token?: string }>();

    // State for verification process (deep link)
    const [verifying, setVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle");
    const [verificationMessage, setVerificationMessage] = useState("");

    // State for resend functionality
    const [resending, setResending] = useState(false);
    const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle");
    const [resendMessage, setResendMessage] = useState("");

    useEffect(() => {
        if (token) {
            handleVerification(token);
        }
    }, [token]);

    const handleVerification = async (tokenToVerify: string) => {
        setVerifying(true);
        setVerificationStatus("idle");
        try {
            const authToken = await verifyEmail(tokenToVerify);
            await storeToken(authToken);
            setVerificationStatus("success");
            setVerificationMessage("Имейлът е потвърден успешно! Влизане...");

            // Short delay to show success before redirecting
            setTimeout(() => {
                router.replace("/(tabs)");
            }, 1500);
        } catch (error: any) {
            setVerificationStatus("error");
            setVerificationMessage(error.message);
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;

        setResending(true);
        setResendStatus("idle");
        try {
            await resendVerification(email);
            setResendStatus("success");
            setResendMessage("Линкът е изпратен успешно!");
        } catch (error: any) {
            setResendStatus("error");
            setResendMessage(error.message);
        } finally {
            setResending(false);
        }
    };

    const handleBackToLogin = () => {
        router.replace("/(auth)/sign-in");
    };

    // 1. Verification Mode (Deep Link or Token present)
    if (token || verifying || verificationStatus !== "idle") {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    {verifying ? (
                        <>
                            <ActivityIndicator size="large" color={Colors.primary} style={{ marginBottom: 20 }} />
                            <Text style={styles.title}>Потвърждаване...</Text>
                            <Text style={styles.description}>Моля изчакайте, докато потвърдим вашия имейл.</Text>
                        </>
                    ) : verificationStatus === "success" ? (
                        <>
                            <View style={styles.iconContainer}>
                                <Text style={styles.icon}>✅</Text>
                            </View>
                            <Text style={styles.title}>Успех!</Text>
                            <Text style={styles.description}>{verificationMessage}</Text>
                        </>
                    ) : (
                        <>
                            <View style={[styles.iconContainer, { backgroundColor: "rgba(255, 69, 58, 0.1)" }]}>
                                <Text style={styles.icon}>❌</Text>
                            </View>
                            <Text style={styles.title}>Грешка</Text>
                            <Text style={styles.description}>{verificationMessage}</Text>
                            <TouchableOpacity style={styles.primaryButton} onPress={handleBackToLogin}>
                                <Text style={styles.primaryButtonText}>Към вход</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    // 2. Instruction Mode (Post-Registration)
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: "#E6F4FE" }]}>
                    <Text style={styles.icon}>✉️</Text>
                </View>

                <Text style={styles.title}>Провери имейла си</Text>

                <Text style={styles.description}>
                    {email
                        ? `Изпратихме линк за потвърждение на ${email}.`
                        : "Изпратихме линк за потвърждение на твоя имейл адрес."}
                </Text>

                <Text style={styles.subDescription}>
                    Моля, кликнете на линка в имейла, за да активирате акаунта си.
                </Text>

                {/* Resend Section */}
                <View style={styles.resendContainer}>
                    {resendStatus === "success" ? (
                        <View style={styles.successBox}>
                            <Text style={styles.successText}>✅ {resendMessage}</Text>
                        </View>
                    ) : resendStatus === "error" ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{resendMessage}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.outlineButton, resending && styles.disabledButton]}
                        onPress={handleResend}
                        disabled={resending || !email}
                    >
                        {resending ? (
                            <ActivityIndicator color={Colors.primary} />
                        ) : (
                            <Text style={styles.outlineButtonText}>Изпрати отново</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.linkButton} onPress={handleBackToLogin}>
                    <Text style={styles.linkText}>Върни се към вход</Text>
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
        fontSize: 16,
        color: Colors.textPrimary,
        textAlign: "center",
        marginBottom: 8,
        lineHeight: 24,
    },
    subDescription: {
        fontFamily: "Inter-Regular",
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 20,
    },
    resendContainer: {
        width: "100%",
        marginBottom: 24,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: "center",
        width: "100%",
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
    successBox: {
        backgroundColor: "rgba(52, 199, 89, 0.1)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: "center",
    },
    successText: {
        color: "#34C759",
        fontSize: 14,
        fontFamily: "Inter-Medium",
    },
    errorBox: {
        backgroundColor: "rgba(255, 69, 58, 0.1)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: "center",
    },
    errorText: {
        color: Colors.error,
        fontSize: 14,
        fontFamily: "Inter-Medium",
        textAlign: "center",
    },
});
