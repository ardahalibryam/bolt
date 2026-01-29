import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getListing, Listing } from "../lib/listings";

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
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#fff" />
            </SafeAreaView>
        );
    }

    if (!listing) return null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Назад</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Детайли</Text>
                <View style={{ width: 60 }} />
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
        backgroundColor: "#000",
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    backButton: {
        padding: 5,
        width: 60,
    },
    backText: {
        color: "#007AFF",
        fontSize: 16,
    },
    content: {
        paddingBottom: 40,
    },
    image: {
        width: width * 0.6,
        height: width * 0.6,
        alignSelf: "center",
        borderRadius: 12,
        marginVertical: 16,
        backgroundColor: "#121212",
    },
    detailsContainer: {
        padding: 20,
    },
    title: {
        color: "#fff",
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
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },
    date: {
        color: "#888",
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: "#333",
        marginVertical: 20,
    },
    sectionTitle: {
        color: "#ccc",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    description: {
        color: "#ddd",
        fontSize: 16,
        lineHeight: 24,
    },
    platformBadge: {
        marginTop: 20,
        backgroundColor: "#1A1A1A",
        padding: 10,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    platformText: {
        color: "#888",
        fontSize: 14,
    },
    doneButton: {
        marginTop: 40,
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
    },
    doneButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
