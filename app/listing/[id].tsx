import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreen } from "../../components/LoadingScreen";
import { getListing, Listing } from "../../lib/listings";
import { Colors } from "../constants/Colors";

const { width } = Dimensions.get("window");

export default function ListingDetailsScreen() {
    const { id, created } = useLocalSearchParams<{ id: string; created?: string }>();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);

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
            Alert.alert("Error", "Failed to load listing details.");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (!listing) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
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
                    <Text style={styles.title}>{listing.title}</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{listing.price} {listing.currency || "лв."}</Text>
                        <Text style={styles.date}>
                            {new Date(listing.createdAt).toLocaleDateString("bg-BG")}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Описание</Text>
                    <Text style={styles.description}>{listing.description}</Text>

                    {listing.externalPlatformHint && (
                        <View style={styles.platformBadge}>
                            <Text style={styles.platformText}>Платформа: {listing.externalPlatformHint}</Text>
                        </View>
                    )}

                    {created === "true" && (
                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => router.replace("/(tabs)")}
                        >
                            <Text style={styles.doneButtonText}>Завърши обява</Text>
                        </TouchableOpacity>
                    )}
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
    center: {
        justifyContent: "center",
        alignItems: "center",
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
    title: {
        color: Colors.white,
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
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
});

