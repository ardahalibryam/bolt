import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { changePassword, deleteAccount, getMe, removeToken } from "../lib/auth";
import { clearActiveDraft } from "../lib/draftPersistence";
import { Colors } from "./constants/Colors";

export default function PersonalDataScreen() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);

    // Change Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Explicit Error State
    const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

    // Delete Account State
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getMe();
            setEmail(data.email);
        } catch (error) {
            console.error("Failed to load profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setErrors({}); // Clear previous errors
        const minLen = 8;
        const current = currentPassword.trim();
        const newPass = newPassword.trim();
        const confirmPass = confirmNewPassword.trim();

        const newErrors: typeof errors = {};
        let hasError = false;

        if (!current) {
            newErrors.current = "Моля, въведете текуща парола.";
            hasError = true;
        }

        if (!newPass) {
            newErrors.new = "Моля, въведете нова парола.";
            hasError = true;
        } else if (newPass.length < minLen) {
            newErrors.new = `Паролата трябва да е поне ${minLen} символа.`;
            hasError = true;
        } else if (newPass === current) {
            newErrors.new = "Новата парола трябва да е различна.";
            hasError = true;
        }

        if (!confirmPass) {
            newErrors.confirm = "Моля, потвърдете паролата.";
            hasError = true;
        } else if (newPass !== confirmPass) {
            newErrors.confirm = "Паролите не съвпадат.";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setPasswordLoading(true);
        try {
            await changePassword(current, newPass);
            Alert.alert("Успех", "Паролата е сменена успешно.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setErrors({});
        } catch (error: any) {
            console.error("Change password error:", error);
            const msg = error.message || "";
            // Try to map server errors to fields
            if (msg.includes("Current password") || msg.includes("incorrect")) {
                setErrors({ current: msg || "Текущата парола е грешна." });
            } else if (msg.includes("New password")) {
                setErrors({ new: msg });
            } else {
                Alert.alert("Грешка", msg || "Неуспешна смяна на парола.");
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            return;
        }

        setDeleteLoading(true);
        try {
            await deleteAccount(deletePassword);

            // Cleanup
            await removeToken();
            await clearActiveDraft();

            setDeleteModalVisible(false);
            // Reset Navigation to Login
            router.replace("/(auth)/sign-in" as never);
        } catch (error: any) {
            Alert.alert("Грешка", error.message || "Неуспешно изтриване на акаунт.");
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#fff" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Назад</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Лични данни</Text>
                <View style={{ width: 60 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Section: Account Info */}
                    <Text style={styles.sectionTitle}>Акаунт</Text>
                    <Text style={styles.label}>Имейл</Text>
                    <View style={styles.disabledInput}>
                        <Text style={styles.disabledInputText}>{email}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Section: Change Password */}
                    <Text style={styles.sectionTitle}>Смяна на парола</Text>

                    <Text style={styles.label}>Текуща парола</Text>
                    <TextInput
                        style={[styles.input, errors.current && styles.inputError]}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        placeholderTextColor="#666"
                    />
                    {errors.current && <Text style={styles.errorText}>{errors.current}</Text>}

                    <Text style={styles.label}>Нова парола</Text>
                    <TextInput
                        style={[styles.input, errors.new && styles.inputError]}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        placeholderTextColor="#666"
                    />
                    {errors.new && <Text style={styles.errorText}>{errors.new}</Text>}

                    <Text style={styles.label}>Потвърди нова парола</Text>
                    <TextInput
                        style={[styles.input, errors.confirm && styles.inputError]}
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                        secureTextEntry
                        placeholderTextColor="#666"
                    />
                    {errors.confirm && <Text style={styles.errorText}>{errors.confirm}</Text>}

                    <TouchableOpacity
                        style={[styles.button, passwordLoading && styles.buttonDisabled]}
                        onPress={handleChangePassword}
                        disabled={passwordLoading}
                    >
                        {passwordLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Смени парола</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Section: Delete Account */}
                    <View style={styles.dangerZone}>
                        <Text style={styles.dangerTitle}>Изтриване на акаунт</Text>
                        <Text style={styles.dangerText}>
                            Внимание: Това действие е необратимо. Всички ваши обяви и данни ще бъдат изтрити завинаги.
                        </Text>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => setDeleteModalVisible(true)}
                        >
                            <Text style={styles.deleteButtonText}>Изтрий акаунт</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Delete Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={deleteModalVisible}
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Сигурен ли си?</Text>
                        <Text style={styles.modalText}>
                            За да изтриеш акаунта си, моля въведи текущата си парола.
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            value={deletePassword}
                            onChangeText={setDeletePassword}
                            secureTextEntry
                            placeholder="Парола"
                            placeholderTextColor="#666"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setDeleteModalVisible(false);
                                    setDeletePassword("");
                                }}
                            >
                                <Text style={styles.modalCancelText}>Отказ</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalDeleteButton, (!deletePassword || deleteLoading) && styles.buttonDisabled]}
                                onPress={handleDeleteAccount}
                                disabled={!deletePassword || deleteLoading}
                            >
                                {deleteLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.modalDeleteText}>Изтрий</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: "bold",
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: Colors.primary,
        fontSize: 16,
    },
    content: {
        padding: 20,
        paddingBottom: 50,
    },
    sectionTitle: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        marginTop: 10,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
        marginTop: 8,
    },
    input: {
        backgroundColor: Colors.surface,
        color: Colors.white,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        fontSize: 16,
    },
    disabledInput: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    disabledInputText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 30,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 24,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    dangerZone: {
        marginTop: 10,
        padding: 16,
        backgroundColor: "rgba(255, 69, 58, 0.1)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 69, 58, 0.3)",
    },
    dangerTitle: {
        color: Colors.error,
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    dangerText: {
        color: Colors.error,
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    deleteButton: {
        backgroundColor: Colors.transparent,
        borderWidth: 1,
        borderColor: Colors.error,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    deleteButtonText: {
        color: Colors.error,
        fontSize: 16,
        fontWeight: "600",
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 24,
    },
    modalTitle: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 12,
    },
    modalText: {
        color: Colors.textSecondary,
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
    },
    modalInput: {
        backgroundColor: Colors.black,
        color: Colors.white,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        fontSize: 16,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        padding: 14,
        backgroundColor: Colors.border,
        borderRadius: 8,
        alignItems: "center",
    },
    modalCancelText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    modalDeleteButton: {
        flex: 1,
        padding: 14,
        backgroundColor: Colors.error,
        borderRadius: 8,
        alignItems: "center",
    },
    modalDeleteText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    inputError: {
        borderColor: Colors.error,
    },
    errorText: {
        color: Colors.error,
        fontSize: 14,
        marginTop: 4,
        marginBottom: 8,
    },
});

