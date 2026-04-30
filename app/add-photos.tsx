import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogoSpinner } from "../components/LogoSpinner";
import { PressableScale } from "../components/PressableScale";
import { uploadImage } from "../lib/cloudinary";
import { updateDraftImages } from "../lib/drafts";
import { compressImage } from "../lib/imageCompression";
import { Colors } from "./constants/Colors";

const { width } = Dimensions.get("window");
const SLOT_GAP = 12;
const SLOT_SIZE = (width - 40 - SLOT_GAP) / 2;
const TOTAL_SLOTS = 4;

type SlotState = { kind: "filled"; url: string } | { kind: "loading" } | { kind: "empty" };

const emptySlots = (): SlotState[] => Array.from({ length: TOTAL_SLOTS }, () => ({ kind: "empty" }));

export default function AddPhotosScreen() {
    const { draftId, productName, coverUrl } = useLocalSearchParams<{
        draftId: string;
        productName?: string;
        coverUrl?: string;
    }>();

    const draftIdValue = Array.isArray(draftId) ? draftId[0] : draftId;
    const productNameValue = Array.isArray(productName) ? productName[0] : productName;
    const coverUrlValue = Array.isArray(coverUrl) ? coverUrl[0] : coverUrl;

    // Source of truth in a ref so async handlers always read the latest state.
    // setSlots() is mirrored from the ref, so React re-renders the UI.
    const slotsRef = useRef<SlotState[]>(emptySlots());
    const [slots, setSlots] = useState<SlotState[]>(slotsRef.current);

    const [showCamera, setShowCamera] = useState(false);
    const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const isAnyUploading = slots.some((s) => s.kind === "loading");

    const writeSlots = (next: SlotState[]) => {
        slotsRef.current = next;
        setSlots(next);
    };

    const replaceSlot = (index: number, slot: SlotState) => {
        const next = [...slotsRef.current];
        next[index] = slot;
        writeSlots(next);
        return next;
    };

    const goNext = () => {
        if (!draftIdValue) {
            Alert.alert("Грешка", "Липсва ID на чернова.");
            return;
        }
        const additionalUrls = slotsRef.current
            .filter((s): s is { kind: "filled"; url: string } => s.kind === "filled")
            .map((s) => s.url);
        router.push({
            pathname: "/price",
            params: {
                draftId: draftIdValue,
                productName: productNameValue || "",
                coverUrl: coverUrlValue || "",
                additionalImageUrls: JSON.stringify(additionalUrls),
            },
        });
    };

    /**
     * PATCH the backend with whatever URLs are currently in the slots.
     * Reads from the ref to always get the freshest state.
     */
    const persistImages = async (snapshot: SlotState[]): Promise<void> => {
        if (!draftIdValue) return;
        const urls = snapshot
            .filter((s): s is { kind: "filled"; url: string } => s.kind === "filled")
            .map((s) => s.url);
        await updateDraftImages(draftIdValue, urls);
    };

    const askSource = (slotIndex: number) => {
        Alert.alert(
            "Добавете снимка",
            undefined,
            [
                { text: "Заснеми снимка", onPress: () => openCamera(slotIndex) },
                { text: "Избери от галерия", onPress: () => pickFromGallery(slotIndex) },
                { text: "Отказ", style: "cancel" },
            ],
            { cancelable: true }
        );
    };

    const openCamera = async (slotIndex: number) => {
        if (!cameraPermission?.granted) {
            const result = await requestCameraPermission();
            if (!result.granted) {
                Alert.alert("Нужен е достъп", "Моля, разрешете достъп до камерата.");
                return;
            }
        }
        setActiveSlotIndex(slotIndex);
        setShowCamera(true);
    };

    const handleCameraSnap = async () => {
        if (!cameraRef.current || activeSlotIndex === null) return;
        const slotIdx = activeSlotIndex;
        try {
            const photo = await cameraRef.current.takePictureAsync({ base64: false });
            if (!photo?.uri) throw new Error("Неуспешно заснемане.");
            setShowCamera(false);
            setActiveSlotIndex(null);
            await processAndUpload(slotIdx, photo.uri);
        } catch (error) {
            console.error("Camera snap error:", error);
            setShowCamera(false);
            setActiveSlotIndex(null);
            Alert.alert("Грешка", "Неуспешно заснемане на снимка.");
        }
    };

    const pickFromGallery = async (slotIndex: number) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Нужен е достъп", "Моля, разрешете достъп до галерията.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            await processAndUpload(slotIndex, result.assets[0].uri);
        }
    };

    const processAndUpload = async (slotIndex: number, localUri: string) => {
        replaceSlot(slotIndex, { kind: "loading" });

        try {
            const compressed = await compressImage(localUri);
            const uploadedUrl = await uploadImage(compressed);
            const snapshotAfter = replaceSlot(slotIndex, { kind: "filled", url: uploadedUrl });

            try {
                await persistImages(snapshotAfter);
            } catch (persistError) {
                console.error("Failed to persist images:", persistError);
                replaceSlot(slotIndex, { kind: "empty" });
                Alert.alert("Грешка", "Снимката не беше запазена. Моля, опитайте отново.");
            }
        } catch (uploadError) {
            console.error("Upload error:", uploadError);
            replaceSlot(slotIndex, { kind: "empty" });
            const message = uploadError instanceof Error
                ? uploadError.message
                : "Неуспешно качване на снимка.";
            Alert.alert("Грешка", message);
        }
    };

    const removePhoto = async (slotIndex: number) => {
        const before = [...slotsRef.current];
        const after = replaceSlot(slotIndex, { kind: "empty" });

        try {
            await persistImages(after);
        } catch (error) {
            console.error("Remove failed:", error);
            writeSlots(before);
            Alert.alert("Грешка", "Снимката не беше премахната. Моля, опитайте отново.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>Назад</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Снимки</Text>
                <TouchableOpacity onPress={goNext} style={styles.headerButton} disabled={isAnyUploading}>
                    <Text style={[styles.headerButtonText, isAnyUploading && styles.disabledText]}>
                        Прескочи
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Добавете още снимки</Text>
                <Text style={styles.subtitle}>
                    Обявите с повече снимки се продават по-бързо. По избор.
                </Text>

                {coverUrlValue ? (
                    <View style={styles.coverContainer}>
                        <Image source={{ uri: coverUrlValue }} style={styles.coverImage} resizeMode="cover" />
                        <View style={styles.coverBadge}>
                            <Text style={styles.coverBadgeText}>Корица</Text>
                        </View>
                    </View>
                ) : null}

                <View style={styles.grid}>
                    {slots.map((slot, i) => {
                        if (slot.kind === "loading") {
                            return (
                                <View key={i} style={[styles.slot, styles.slotFilled]}>
                                    <LogoSpinner size={48} />
                                </View>
                            );
                        }
                        if (slot.kind === "filled") {
                            return (
                                <View key={i} style={styles.slot}>
                                    <Image source={{ uri: slot.url }} style={styles.slotImage} resizeMode="cover" />
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removePhoto(i)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Text style={styles.removeButtonText}>×</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        }
                        return (
                            <PressableScale
                                key={i}
                                style={[styles.slot, styles.slotEmpty]}
                                onPress={() => askSource(i)}
                            >
                                <Text style={styles.plus}>+</Text>
                            </PressableScale>
                        );
                    })}
                </View>

                <PressableScale
                    style={[styles.continueButton, isAnyUploading && styles.continueButtonDisabled]}
                    onPress={goNext}
                    disabled={isAnyUploading}
                >
                    <Text style={styles.continueButtonText}>Продължи</Text>
                </PressableScale>
            </View>

            {/* Camera modal for in-app capture */}
            <Modal visible={showCamera} animationType="slide" onRequestClose={() => setShowCamera(false)}>
                <SafeAreaView style={styles.cameraModal}>
                    <CameraView ref={cameraRef} style={styles.cameraView} facing="back">
                        <TouchableOpacity
                            style={styles.cameraClose}
                            onPress={() => {
                                setShowCamera(false);
                                setActiveSlotIndex(null);
                            }}
                        >
                            <Text style={styles.cameraCloseText}>Отказ</Text>
                        </TouchableOpacity>

                        <View style={styles.cameraBottomBar}>
                            <TouchableOpacity style={styles.snapButton} onPress={handleCameraSnap}>
                                <View style={styles.snapInner} />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </SafeAreaView>
            </Modal>
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
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    headerButtonText: {
        color: Colors.primary,
        fontSize: 15,
        fontWeight: "600",
    },
    disabledText: {
        opacity: 0.4,
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 17,
        fontWeight: "700",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        color: Colors.white,
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        color: Colors.textSecondary,
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 20,
    },
    coverContainer: {
        position: "relative",
        alignSelf: "center",
        marginBottom: 24,
    },
    coverImage: {
        width: width - 40,
        height: (width - 40) * 0.5,
        borderRadius: 12,
        backgroundColor: Colors.surface,
    },
    coverBadge: {
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "rgba(0,0,0,0.65)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    coverBadgeText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: SLOT_GAP,
    },
    slot: {
        width: SLOT_SIZE,
        height: SLOT_SIZE,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },
    slotEmpty: {
        borderWidth: 2,
        borderColor: Colors.border,
        borderStyle: "dashed",
        backgroundColor: Colors.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    slotFilled: {
        backgroundColor: Colors.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    slotImage: {
        width: "100%",
        height: "100%",
    },
    plus: {
        fontSize: 40,
        color: Colors.textSecondary,
        fontWeight: "300",
    },
    removeButton: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "rgba(0,0,0,0.7)",
        alignItems: "center",
        justifyContent: "center",
    },
    removeButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        lineHeight: 18,
        fontWeight: "600",
    },
    continueButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: "auto",
        marginBottom: 24,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    // Camera modal
    cameraModal: {
        flex: 1,
        backgroundColor: "#000",
    },
    cameraView: {
        flex: 1,
    },
    cameraClose: {
        position: "absolute",
        top: Platform.OS === "ios" ? 20 : 30,
        left: 20,
        zIndex: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 18,
    },
    cameraCloseText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    cameraBottomBar: {
        position: "absolute",
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    snapButton: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: "rgba(255,255,255,0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    snapInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#FFFFFF",
    },
});
