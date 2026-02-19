import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreen } from "../../components/LoadingScreen";
import { deleteListing, getListing, Listing } from "../../lib/listings";
import { Colors } from "../constants/Colors";

const { width } = Dimensions.get("window");

export default function ListingDetailsScreen() {
    const { id, created } = useLocalSearchParams<{ id: string; created?: string }>();
    const navigation = useNavigation();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [copiedField, setCopiedField] = useState<"title" | "description" | null>(null);

    const isNewlyCreated = created === "true";

    // ── Disable back navigation when just created ───────────────
    useEffect(() => {
        if (isNewlyCreated) {
            navigation.setOptions({ gestureEnabled: false });
        }
    }, [isNewlyCreated, navigation]);

    useEffect(() => {
        if (!isNewlyCreated) return;

        const handler = BackHandler.addEventListener("hardwareBackPress", () => true);
        return () => handler.remove();
    }, [isNewlyCreated]);

    // ── Load listing data ───────────────────────────────────────
    useEffect(() => {
        if (id) {
            loadListing();
        }
    }, [id]);

    const loadListing = async () => {
        try {
            const data = await getListing(id);
            setListing(data);
        } catch (error) {
            Alert.alert("Грешка", "Неуспешно зареждане на обявата.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // ── Copy to clipboard ───────────────────────────────────────
    const copyToClipboard = async (text: string, field: "title" | "description") => {
        await Clipboard.setStringAsync(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // ── Delete listing ──────────────────────────────────────────
    const confirmAndDelete = async () => {
        const listingId = Array.isArray(id) ? id[0] : id;
        if (!listingId) return;

        setDeleting(true);
        try {
            await deleteListing(listingId);
            router.replace("/(tabs)");
        } catch (error) {
            Alert.alert("Грешка", "Неуспешно изтриване. Моля, опитайте отново.");
            setDeleting(false);
        }
    };

    const handleDelete = () => {
        if (Platform.OS === "web") {
            const confirmed = window.confirm("Сигурни ли сте, че искате да изтриете тази обява?");
            if (confirmed) {
                confirmAndDelete();
            }
        } else {
            Alert.alert(
                "Изтриване на обява",
                "Сигурни ли сте, че искате да изтриете тази обява?",
                [
                    { text: "Отказ", style: "cancel" },
                    {
                        text: "Изтрий",
                        style: "destructive",
                        onPress: confirmAndDelete,
                    },
                ]
            );
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (!listing) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {isNewlyCreated ? (
                    <View style={{ width: 40 }} />
                ) : (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Image
                            source={require("../../assets/images/icons/nav/arrow-back.png")}
                            style={styles.backIcon}
                            tintColor={Colors.textPrimary}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle} numberOfLines={1}>Детайли</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Image
                    source={{ uri: listing.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />

                <View style={styles.detailsContainer}>
                    {/* Title + Copy */}
                    <View style={styles.fieldHeader}>
                        <Text style={styles.title}>{listing.title}</Text>
                        <TouchableOpacity
                            onPress={() => copyToClipboard(listing.title, "title")}
                            style={styles.copyButton}
                        >
                            <Text style={styles.copyButtonText}>
                                {copiedField === "title" ? "✓ Копирано" : "Копирай"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{listing.price} {listing.currency || "лв."}</Text>
                        <Text style={styles.date}>
                            {new Date(listing.createdAt).toLocaleDateString("bg-BG")}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Description Header + Copy */}
                    <View style={styles.fieldHeader}>
                        <Text style={styles.sectionTitle}>Описание</Text>
                        <TouchableOpacity
                            onPress={() => copyToClipboard(listing.description, "description")}
                            style={styles.copyButton}
                        >
                            <Text style={styles.copyButtonText}>
                                {copiedField === "description" ? "✓ Копирано" : "Копирай"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.description}>{listing.description}</Text>

                    {listing.externalPlatformHint && (
                        <View style={styles.platformBadge}>
                            <Text style={styles.platformText}>Платформа: {listing.externalPlatformHint}</Text>
                        </View>
                    )}

                    {isNewlyCreated && (
                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => router.replace("/(tabs)")}
                        >
                            <Text style={styles.doneButtonText}>Завърши обява</Text>
                        </TouchableOpacity>
                    )}

                    {/* Delete Button */}
                    <TouchableOpacity
                        style={[styles.deleteButton, deleting && styles.buttonDisabled]}
                        onPress={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <ActivityIndicator color={Colors.error} />
                        ) : (
                            <Text style={styles.deleteButtonText}>Изтрий обявата</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    content: {
        paddingBottom: 40,
    },
    image: {
        width: width * 0.6,
        height: width * 0.45,
        alignSelf: "center",
        borderRadius: 12,
        marginVertical: 16,
        backgroundColor: Colors.surface,
    },
    detailsContainer: {
        padding: 20,
    },
    fieldHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    title: {
        color: Colors.white,
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        flex: 1,
        marginRight: 12,
    },
    copyButton: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        marginTop: 2,
    },
    copyButtonText: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: "600",
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 20,
    },
    price: {
        color: Colors.white,
        fontSize: 28,
        fontWeight: "bold",
    },
    date: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 20,
    },
    sectionTitle: {
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    description: {
        color: Colors.textPrimary,
        fontSize: 16,
        lineHeight: 24,
    },
    platformBadge: {
        marginTop: 20,
        backgroundColor: Colors.surface,
        padding: 10,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    platformText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    doneButton: {
        marginTop: 40,
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
    },
    doneButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    deleteButton: {
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
        borderWidth: 1,
        borderColor: Colors.error,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    deleteButtonText: {
        color: Colors.error,
        fontSize: 16,
        fontWeight: "bold",
    },
});
