import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMyListings, Listing } from "../lib/listings";
import { Colors } from "./constants/Colors";

const { width } = Dimensions.get("window");

export default function HistoryScreen() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Bold": require("@expo-google-fonts/montserrat/Montserrat_700Bold.ttf"),
    "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getMyListings();
      setListings(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("bg-BG", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }) + " г.";
    } catch {
      return dateString;
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const renderItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.historyContainer}
      onPress={() => router.push(`/listing/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.historyItem}>
        <View style={styles.historyItemLeft}>
          <Text style={styles.historyItemTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
          <Text style={styles.historyItemDate}>{formatDate(item.createdAt)}</Text>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{item.price} €</Text>
          </View>
        </View>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.historyItemImage}
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push("/(tabs)")}
      >
        <Image
          source={require("../assets/images/icons/nav/home-black.png")}
          style={styles.homeIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.header}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.pfpImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>Вашите обяви</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Все още нямате история.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  homeButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1000,
    padding: 8,
  },
  homeIcon: {
    width: 24,
    height: 24,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
    maxWidth: 500,
  },
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  pfpImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 40,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    marginBottom: 10,
    fontFamily: "Montserrat-Bold",
  },
  historyContainer: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  historyItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  historyItemTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 18,
    color: Colors.white,
    marginBottom: 6,
  },
  historyItemDate: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  priceBadge: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  priceText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.black,
  },
  historyItemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 60,
  }
});

