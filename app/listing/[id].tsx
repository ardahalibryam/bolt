import * as Clipboard from "expo-clipboard";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Dimensions,

    Image,
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
import CityPickerModal from "../../components/CityPickerModal";
import { LoadingScreen } from "../../components/LoadingScreen";
import { PressableScale } from "../../components/PressableScale";
import { SuccessCelebration } from "../../components/SuccessCelebration";
import { deleteListing, getListing, Listing } from "../../lib/listings";
import {
    getOlxAuthUrl,
    getOlxProfile,
    getOlxPublishStatus,
    getOlxStatus,
    OlxCity,
    OlxPublishStatus,
    publishToOlx,
} from "../../lib/olx";
import { setOlxConnectedCallback } from "../_layout";
import { Colors } from "../constants/Colors";

const { width } = Dimensions.get("window");
const PHONE_REGEX = /^(\+359|0)\d{9}$/;

export default function ListingDetailsScreen() {
    const { id, created } = useLocalSearchParams<{ id: string; created?: string }>();
    const navigation = useNavigation();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [copiedField, setCopiedField] = useState<"title" | "description" | null>(null);

    // ── OLX state ───────────────────────────────────────────────
    const [olxConnected, setOlxConnected] = useState(false);
    const [olxConnecting, setOlxConnecting] = useState(false);
    const [olxPublishing, setOlxPublishing] = useState(false);
    const [olxPublishInfo, setOlxPublishInfo] = useState<OlxPublishStatus | null>(null);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");

    // ── City picker state ───────────────────────────────────────
    const [showCityModal, setShowCityModal] = useState(false);
    const [selectedCity, setSelectedCity] = useState<OlxCity | null>(null);

    // ── Success celebration state ───────────────────────────────
    const [celebration, setCelebration] = useState<{ visible: boolean; message: string }>({
        visible: false,
        message: "",
    });

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
            if (isNewlyCreated) {
                setCelebration({ visible: true, message: "Обявата е създадена!" });
            }
        } catch (error) {
            Alert.alert("Грешка", "Неуспешно зареждане на обявата.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // ── Check OLX status on focus (re-checks after OAuth callback) ─
    useFocusEffect(
        useCallback(() => {
            getOlxStatus()
                .then((s) => setOlxConnected(s.connected))
                .catch(() => { });
        }, [])
    );

    // ── Check OLX publish status when listing loads ─────────────
    useEffect(() => {
        if (listing?.olxAdvertId) {
            getOlxPublishStatus(listing.id)
                .then((s) => setOlxPublishInfo(s))
                .catch(() => { });
        }
    }, [listing]);

    // ── Register callback for deep link OAuth completion ────────
    const onOlxConnected = useCallback(() => {
        setOlxConnected(true);
        setOlxConnecting(false);
    }, []);

    useEffect(() => {
        setOlxConnectedCallback(onOlxConnected);
        return () => setOlxConnectedCallback(null);
    }, [onOlxConnected]);

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

    // ── OLX OAuth flow ──────────────────────────────────────────
    const handleConnectOlx = async () => {
        setOlxConnecting(true);
        try {
            const { url } = await getOlxAuthUrl();
            await WebBrowser.openAuthSessionAsync(url, "bolt://olx-callback");
            // The deep link handler in _layout.tsx will call exchangeOlxCode
            // and trigger onOlxCo

        } catch (error) {
            Alert.alert("Грешка", "Неуспешно свързване с OLX.");
            setOlxConnecting(false);
        }
    };

    // ── OLX Publish flow ────────────────────────────────────────
    const handleStartPublish = async () => {
        // Check if user already has a saved city
        try {
            const profile = await getOlxProfile();
            if (profile.cityId && profile.cityName) {
                const saved: OlxCity = {
                    id: profile.cityId,
                    name: profile.cityName,
                    municipality: profile.cityName,
                };
                setSelectedCity(saved);
                handlePublishToOlx();
                return;
            }
        } catch {
            // If profile fetch fails, fall through to city picker
        }
        setShowCityModal(true);
    };

    const handlePublishToOlx = async (phoneNumber?: string) => {
        if (!listing) return;

        setOlxPublishing(true);
        setShowPhoneModal(false);
        try {
            const result = await publishToOlx(listing.id, phoneNumber, selectedCity?.id);
            setOlxPublishInfo({
                published: true,
                olxAdvertId: result.olxAdvertId,
                olxStatus: "new",
            });
            setCelebration({ visible: true, message: "Обявата е изпратена към OLX!" });
        } catch (error: any) {
            // If backend returns 400 with "phone required", show phone modal
            if (error?.status === 400 && error?.message?.toLowerCase().includes("phone")) {
                setOlxPublishing(false);
                setShowPhoneModal(true);
                return;
            }
            Alert.alert("Грешка", error?.message || "Неуспешно публикуване в OLX.");
        } finally {
            setOlxPublishing(false);
        }
    };

    const handlePhoneSubmit = () => {
        if (!PHONE_REGEX.test(phone)) {
            setPhoneError("Въведете валиден телефонен номер (напр. 0888123456)");
            return;
        }
        setPhoneError("");
        handlePublishToOlx(phone);
    };

    // ── Render helpers ──────────────────────────────────────────

    const renderOlxButton = () => {
        // Already published — show status badge
        if (olxPublishInfo?.published) {
            const status = olxPublishInfo.olxStatus;

            // Special case: OLX account was disconnected
            if (status === "olx_disconnected") {
                return (
                    <View>
                        <View style={[styles.olxStatusBadge, { borderColor: Colors.warning }]}>
                            <Text style={[styles.olxStatusText, { color: Colors.warning }]}>
                                ⚠ OLX акаунтът е изключен
                            </Text>
                        </View>
                        <PressableScale
                            style={[styles.olxConnectButton, { marginTop: 8 }]}
                            onPress={handleConnectOlx}
                            disabled={olxConnecting}
                        >
                            {olxConnecting ? (
                                <ActivityIndicator color={Colors.primary} size="small" />
                            ) : (
                                <Text style={styles.olxConnectButtonText}>Свържи OLX</Text>
                            )}
                        </PressableScale>
                    </View>
                );
            }

            const statusConfig = {
                new: { text: "✓ Изпратено към OLX", color: Colors.primary },
                waiting: { text: "✓ В изчакване на модерация", color: Colors.primary },
                active: { text: "✓ Активно в OLX", color: "#22c55e" },
                rejected: { text: "✗ Отказано от OLX", color: Colors.error },
                removed: { text: "✗ Премахнато от OLX", color: Colors.textSecondary },
            };
            const config = statusConfig[status || "new"] || statusConfig["new"];

            return (
                <View style={[styles.olxStatusBadge, { borderColor: config.color }]}>
                    <Text style={[styles.olxStatusText, { color: config.color }]}>
                        {config.text}
                    </Text>
                </View>
            );
        }

        // Currently publishing
        if (olxPublishing) {
            return (
                <View style={[styles.olxButton, styles.olxButtonDisabled]}>
                    <ActivityIndicator color={Colors.white} size="small" />
                    <Text style={styles.olxButtonText}>Публикуване...</Text>
                </View>
            );
        }

        // Not connected — show connect button
        if (!olxConnected) {
            return (
                <PressableScale
                    style={styles.olxConnectButton}
                    onPress={handleConnectOlx}
                    disabled={olxConnecting}
                >
                    {olxConnecting ? (
                        <ActivityIndicator color={Colors.primary} size="small" />
                    ) : (
                        <Text style={styles.olxConnectButtonText}>Свържи OLX акаунт</Text>
                    )}
                </PressableScale>
            );
        }

        // Connected — show publish button
        return (
            <PressableScale
                style={styles.olxButton}
                onPress={handleStartPublish}
            >
                <Text style={styles.olxButtonText}>Публикувай в OLX</Text>
            </PressableScale>
        );
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

                    {/* OLX Publish Section */}
                    <View style={styles.divider} />
                    {renderOlxButton()}

                    {isNewlyCreated && (
                        <PressableScale
                            style={styles.doneButton}
                            onPress={() => router.replace("/(tabs)")}
                        >
                            <Text style={styles.doneButtonText}>Завърши обява</Text>
                        </PressableScale>
                    )}

                    {/* Delete Button */}
                    <PressableScale
                        style={[styles.deleteButton, deleting && styles.buttonDisabled]}
                        onPress={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <ActivityIndicator color={Colors.error} />
                        ) : (
                            <Text style={styles.deleteButtonText}>Изтрий обявата</Text>
                        )}
                    </PressableScale>
                </View>
            </ScrollView>

            {/* Phone Number Modal */}
            <Modal
                visible={showPhoneModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPhoneModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Телефонен номер</Text>
                        <Text style={styles.modalSubtitle}>
                            OLX изисква телефонен номер за публикуване на обяви.
                        </Text>

                        <TextInput
                            style={[styles.phoneInput, phoneError ? styles.phoneInputError : null]}
                            placeholder="0888123456"
                            placeholderTextColor={Colors.textSecondary}
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={(text) => {
                                setPhone(text);
                                setPhoneError("");
                            }}
                            autoFocus
                        />
                        {phoneError ? (
                            <Text style={styles.phoneErrorText}>{phoneError}</Text>
                        ) : null}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => {
                                    setShowPhoneModal(false);
                                    setPhoneError("");
                                }}
                            >
                                <Text style={styles.modalCancelText}>Отказ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={handlePhoneSubmit}
                            >
                                <Text style={styles.modalSubmitText}>Публикувай</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* City Picker Modal */}
            <CityPickerModal
                visible={showCityModal}
                initialCity={selectedCity}
                onSelect={(city) => {
                    setSelectedCity(city);
                    setShowCityModal(false);
                    handlePublishToOlx();
                }}
                onClose={() => setShowCityModal(false)}
            />

            {/* Success Celebration */}
            <SuccessCelebration
                visible={celebration.visible}
                message={celebration.message}
                onComplete={() => setCelebration({ visible: false, message: "" })}
            />
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
    // ── OLX Styles ──────────────────────────────────────────────
    olxButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        width: "100%",
        gap: 8,
    },
    olxButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: "bold",
    },
    olxButtonDisabled: {
        opacity: 0.7,
    },
    olxConnectButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    olxConnectButtonText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: "bold",
    },
    olxStatusBadge: {
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
        borderWidth: 1,
    },
    olxStatusText: {
        fontSize: 15,
        fontWeight: "600",
    },
    // ── Phone Modal Styles ──────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
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
    phoneInput: {
        backgroundColor: Colors.black,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: Colors.white,
    },
    phoneInputError: {
        borderColor: Colors.error,
    },
    phoneErrorText: {
        color: Colors.error,
        fontSize: 13,
        marginTop: 6,
    },
    modalButtons: {
        flexDirection: "row",
        marginTop: 20,
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.border,
    },
    modalCancelText: {
        color: Colors.textSecondary,
        fontSize: 15,
        fontWeight: "600",
    },
    modalSubmitButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: Colors.primary,
    },
    modalSubmitText: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: "600",
    },
    // ── Existing Styles ─────────────────────────────────────────
    doneButton: {
        marginTop: 16,
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
