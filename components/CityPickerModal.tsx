import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../app/constants/Colors";
import { getOlxCities, OlxCity } from "../lib/olx";

const TOP_5_CITIES = ["София", "Пловдив", "Варна", "Бургас", "Русе"];

interface CityPickerModalProps {
    visible: boolean;
    initialCity?: OlxCity | null;
    onSelect: (city: OlxCity) => void;
    onClose: () => void;
}

export default function CityPickerModal({
    visible,
    initialCity,
    onSelect,
    onClose,
}: CityPickerModalProps) {
    const [cities, setCities] = useState<OlxCity[]>([]);
    const [citySearch, setCitySearch] = useState("");
    const [selectedCity, setSelectedCity] = useState<OlxCity | null>(null);
    const [loading, setLoading] = useState(false);

    // Sync initial city when modal opens
    useEffect(() => {
        if (visible) {
            setSelectedCity(initialCity ?? null);
            setCitySearch(
                initialCity
                    ? `${initialCity.name} (${initialCity.municipality})`
                    : ""
            );
            loadCities();
        }
    }, [visible]);

    const loadCities = async () => {
        if (cities.length > 0) return;
        setLoading(true);
        try {
            const data = await getOlxCities();
            setCities(data);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const filteredCities = useMemo(() => {
        if (!citySearch.trim()) {
            return cities
                .filter((c) => TOP_5_CITIES.includes(c.name))
                .sort(
                    (a, b) =>
                        TOP_5_CITIES.indexOf(a.name) - TOP_5_CITIES.indexOf(b.name)
                );
        }
        return cities
            .filter((c) => {
                const q = citySearch.toLowerCase();
                return (
                    c.name.toLowerCase().includes(q) ||
                    c.municipality.toLowerCase().includes(q)
                );
            })
            .sort((a, b) => {
                const q = citySearch.toLowerCase();
                const aExact = a.name.toLowerCase() === q ? 0 : 1;
                const bExact = b.name.toLowerCase() === q ? 0 : 1;
                if (aExact !== bExact) return aExact - bExact;
                const aMain = a.name === a.municipality ? 0 : 1;
                const bMain = b.name === b.municipality ? 0 : 1;
                if (aMain !== bMain) return aMain - bMain;
                return a.name.localeCompare(b.name, "bg");
            })
            .slice(0, 20);
    }, [cities, citySearch]);

    const handleSearchChange = (text: string) => {
        setCitySearch(text);
        if (
            selectedCity &&
            text !== `${selectedCity.name} (${selectedCity.municipality})`
        ) {
            setSelectedCity(null);
        }
    };

    const handleCitySelect = (city: OlxCity) => {
        setSelectedCity(city);
        setCitySearch(`${city.name} (${city.municipality})`);
    };

    const handleSubmit = () => {
        if (selectedCity) {
            onSelect(selectedCity);
        }
    };

    const handleClose = () => {
        setCitySearch("");
        setSelectedCity(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { maxHeight: "70%" }]}>
                    <Text style={styles.modalTitle}>Изберете град</Text>
                    <Text style={styles.modalSubtitle}>
                        Изберете град за обявата в OLX.
                    </Text>

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Търси град..."
                        placeholderTextColor={Colors.textSecondary}
                        value={citySearch}
                        onChangeText={handleSearchChange}
                        autoFocus
                    />

                    {loading ? (
                        <ActivityIndicator
                            color={Colors.primary}
                            style={{ marginTop: 20 }}
                        />
                    ) : (
                        <FlatList
                            data={filteredCities}
                            keyExtractor={(item) => item.id.toString()}
                            style={{ marginTop: 12, maxHeight: 250 }}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.cityRow,
                                        selectedCity?.id === item.id &&
                                        styles.cityRowSelected,
                                    ]}
                                    onPress={() => handleCitySelect(item)}
                                >
                                    <Text
                                        style={[
                                            styles.cityRowText,
                                            selectedCity?.id === item.id &&
                                            styles.cityRowTextSelected,
                                        ]}
                                    >
                                        {item.name} ({item.municipality})
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                citySearch.trim().length > 0 ? (
                                    <Text style={styles.cityEmptyText}>
                                        Няма резултати
                                    </Text>
                                ) : null
                            }
                        />
                    )}

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelText}>Отказ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                !selectedCity && { opacity: 0.5 },
                            ]}
                            disabled={!selectedCity}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitText}>Продължи</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 400,
    },
    modalTitle: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    modalSubtitle: {
        color: Colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    searchInput: {
        backgroundColor: Colors.black,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: Colors.white,
    },
    modalButtons: {
        flexDirection: "row",
        marginTop: 20,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cancelText: {
        color: Colors.textSecondary,
        fontSize: 15,
        fontWeight: "600",
    },
    submitButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: Colors.primary,
    },
    submitText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: "600",
    },
    // City list styles
    cityRow: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    cityRowSelected: {
        backgroundColor: `${Colors.primary}20`,
    },
    cityRowText: {
        color: Colors.textPrimary,
        fontSize: 15,
    },
    cityRowTextSelected: {
        color: Colors.primary,
        fontWeight: "600",
    },
    cityEmptyText: {
        color: Colors.textSecondary,
        fontSize: 14,
        textAlign: "center",
        marginTop: 16,
    },
});
