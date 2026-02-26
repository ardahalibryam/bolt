import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import CityPickerModal from "../components/CityPickerModal";
import { getOlxProfile, OlxCity, updateOlxProfile } from "../lib/olx";
import { Colors } from "./constants/Colors";

export default function OlxDetailsScreen() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile data
    const [email, setEmail] = useState<string | null>(null);
    const [phone, setPhone] = useState("");
    const [selectedCity, setSelectedCity] = useState<OlxCity | null>(null);

    // City picker
    const [showCityModal, setShowCityModal] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getOlxProfile();
            setEmail(data.email);
            setPhone(data.phone || "");
            if (data.cityId && data.cityName) {
                setSelectedCity({
                    id: data.cityId,
                    name: data.cityName,
                    municipality: data.cityName,
                });
            }
        } catch (error) {
            console.error("Failed to load OLX profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateOlxProfile({
                phone: phone.trim() || undefined,
                cityId: selectedCity?.id,
            });
            Alert.alert("Успех", "Данните са запазени.");
        } catch (error: any) {
            Alert.alert("Грешка", error?.message || "Неуспешно запазване.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Назад</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>OLX Данни</Text>
                <View style={{ width: 60 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    {/* OLX Email (read-only) */}
                    <Text style={styles.sectionTitle}>OLX Имейл</Text>
                    <View style={styles.disabledInput}>
                        <Text
                            style={[
                                styles.disabledInputText,
                                email === null && { color: Colors.warning },
                            ]}
                        >
                            {email ?? "⚠️ Неуспешна връзка с OLX"}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Phone Number */}
                    <Text style={styles.sectionTitle}>Телефонен номер</Text>
                    <Text style={styles.label}>
                        Този номер ще се използва при публикуване в OLX.
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0888123456"
                        placeholderTextColor="#666"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    <View style={styles.divider} />

                    {/* City */}
                    <Text style={styles.sectionTitle}>Град</Text>
                    <Text style={styles.label}>
                        Градът по подразбиране за вашите OLX обяви.
                    </Text>
                    <TouchableOpacity
                        style={styles.citySelector}
                        onPress={() => setShowCityModal(true)}
                    >
                        <Text
                            style={[
                                styles.citySelectorText,
                                !selectedCity && { color: Colors.textSecondary },
                            ]}
                        >
                            {selectedCity
                                ? `${selectedCity.name} (${selectedCity.municipality})`
                                : "Изберете град..."}
                        </Text>
                        <Text style={styles.citySelectorArrow}>›</Text>
                    </TouchableOpacity>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.button, saving && styles.buttonDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Запази</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* City Picker Modal */}
            <CityPickerModal
                visible={showCityModal}
                initialCity={selectedCity}
                onSelect={(city) => {
                    setSelectedCity(city);
                    setShowCityModal(false);
                }}
                onClose={() => setShowCityModal(false)}
            />
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
        marginBottom: 12,
        marginTop: 10,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
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
    citySelector: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    citySelectorText: {
        color: Colors.white,
        fontSize: 16,
        flex: 1,
    },
    citySelectorArrow: {
        color: Colors.textSecondary,
        fontSize: 22,
        marginLeft: 8,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 32,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
});
