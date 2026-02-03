import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMyListings, Listing } from "../../lib/listings";
import { Colors } from "../constants/Colors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const CARD_IMAGE_HEIGHT = 100;

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    "Montserrat-SemiBold": require("@expo-google-fonts/montserrat/Montserrat_600SemiBold.ttf"),
    "Montserrat-Bold": require("@expo-google-fonts/montserrat/Montserrat_700Bold.ttf"),
    "Inter-Regular": require("@expo-google-fonts/inter/Inter_400Regular.ttf"),
    "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const data = await getMyListings();
      setListings(data.slice(0, 4));
    } catch (error) {
      console.error("Failed to load listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const openTipsUrl = () => {
    Linking.openURL("https://boltbg.info");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <Image
        source={require("../../assets/images/gradients/gradient-home.png")}
        style={styles.backgroundGradient}
        resizeMode="cover"
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Здравей!</Text>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => router.push("/history")}
            >
              <Image
                source={require("../../assets/images/icons/nav/history.png")}
                style={styles.historyIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* CTA Box - Снимай и продай */}
          <TouchableOpacity
            style={styles.ctaBox}
            onPress={() => router.push("/camera")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#7FB1F3", "#1374F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <View style={styles.ctaContent}>
                <View style={styles.ctaTextContainer}>
                  <Text style={styles.ctaHeading}>Снимай и продай</Text>
                  <Text style={styles.ctaDescription}>
                    Снимай и остави AI да напише обявата вместо теб.
                  </Text>
                </View>
                <View style={styles.ctaArrowContainer}>
                  <Image
                    source={require("../../assets/images/icons/profile/arrow.svg")}
                    style={styles.ctaArrow}
                    tintColor="#FFFFFF"
                    resizeMode="contain"
                  />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Tips Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Съвети</Text>
            <TouchableOpacity
              style={styles.tipsBox}
              onPress={openTipsUrl}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#FFFFFF", "#5FA0F5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tipsGradient}
              >
                <View style={styles.tipsContent}>
                  <Image
                    source={require("../../assets/images/icons/profile/percent.png")}
                    style={styles.tipsIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.tipsText}>
                    Как да заснемете най-добрите снимки за вашата обява!?
                  </Text>
                  <Image
                    source={require("../../assets/images/icons/profile/arrow.svg")}
                    style={styles.tipsArrow}
                    tintColor={Colors.primary}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Latest Listings Section */}
          {!loading && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Последни обяви</Text>
                {listings.length > 0 && (
                  <TouchableOpacity onPress={() => router.push("/history")}>
                    <Text style={styles.seeAllLink}>Виж всички</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.listingsGrid}>
                {/* Real listings */}
                {listings.map((listing) => (
                  <TouchableOpacity
                    key={listing.id}
                    style={styles.listingCard}
                    onPress={() => router.push(`/listing/${listing.id}`)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: listing.imageUrl }}
                      style={styles.listingImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.listingPrice}>{listing.price}€</Text>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {listing.title}
                    </Text>
                  </TouchableOpacity>
                ))}
                {/* Placeholder cards for empty slots */}
                {Array.from({ length: 4 - listings.length }).map((_, index) => (
                  <View key={`placeholder-${index}`} style={styles.placeholderCard}>
                    <View style={styles.placeholderImageContainer}>
                      <Text style={styles.placeholderIcon}>📦</Text>
                    </View>
                    <Text style={styles.placeholderText}>Следващата ви обява</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 16,
  },
  greeting: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 24,
    color: Colors.textPrimary,
  },
  historyButton: {
    padding: 8,
  },
  historyIcon: {
    width: 28,
    height: 28,
  },
  ctaBox: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  ctaGradient: {
    padding: 20,
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  ctaHeading: {
    fontFamily: "Montserrat-Bold",
    fontSize: 26,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  ctaDescription: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 22,
  },
  ctaArrowContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaArrow: {
    width: 24,
    height: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  seeAllLink: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 12,
  },
  tipsBox: {
    borderRadius: 12,
    overflow: "hidden",
  },
  tipsGradient: {
    padding: 16,
  },
  tipsContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipsIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  tipsText: {
    flex: 1,
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  tipsArrow: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  listingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  listingCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  listingImage: {
    width: "100%",
    height: CARD_IMAGE_HEIGHT,
    borderRadius: 8,
    backgroundColor: Colors.border,
    marginBottom: 8,
  },
  listingPrice: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 4,
  },
  listingTitle: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  placeholderCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  placeholderImageContainer: {
    width: "100%",
    height: CARD_IMAGE_HEIGHT,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 40,
  },
  placeholderText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
