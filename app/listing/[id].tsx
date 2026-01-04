import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getListing, Listing } from "../lib/drafts"; // Adjusted path for app/listing/[id].tsx

export default function ListingScreen() {
    const { id } = useLocalSearchParams();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadListing(Array.isArray(id) ? id[0] : id);
        }
    }, [id]);

    const loadListing = async (listingId: string) => {
        try {
            const data = await getListing(listingId);
            setListing(data);
        } catch (e) {
            setError("Грешка при зареждане на обявата.");
            console.error(e);
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

    if (!listing || error) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>{error || "Обявата не е намерена"}</Text>
                <TouchableOpacity onPress={() => router.replace("/(tabs)")} style={styles.button}>
                    <Text style={styles.buttonText}>Към началото</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.replace("/(tabs)")}
            >
                <Image
                    source={require("../../assets/images/icons/nav/arrow-back.svg")} // Adjusted path
                    style={styles.backIcon}
                    resizeMode="contain"
                />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: listing.imageUrl }} style={styles.image} resizeMode="cover" />

                <View style={styles.content}>
                    <Text style={styles.price}>{listing.price} лв.</Text>
                    <Text style={styles.title}>{listing.title}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Описание</Text>
                    <Text style={styles.description}>{listing.description}</Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace("/(tabs)")}
                    >
                        <Text style={styles.buttonText}>Готово</Text>
                    </TouchableOpacity>
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
    scrollContent: {
        flexGrow: 1,
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 1000,
        padding: 8,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 20,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: "#fff",
    },
    image: {
        width: "100%",
        height: 300,
    },
    content: {
        padding: 20,
    },
    price: {
        color: "#007AFF", // Brand color
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8,
    },
    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: "#333",
        marginVertical: 16,
    },
    sectionTitle: {
        color: "#999",
        fontSize: 14,
        marginBottom: 8,
        textTransform: "uppercase",
    },
    description: {
        color: "#E0E0E0",
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 32,
    },
    button: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    errorText: {
        color: "#FF453A",
        fontSize: 18,
        marginBottom: 20,
    },
});
