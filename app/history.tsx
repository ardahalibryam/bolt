import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMyListings, Listing } from "../lib/listings";
import { Colors } from "./constants/Colors";

type FilterOption = "all" | "olx" | "no-olx";
type SortOption = "newest" | "oldest" | "price-high" | "price-low";
type ActiveDropdown = "filter" | "sort" | null;

const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
  { key: "all", label: "Всички" },
  { key: "olx", label: "В OLX" },
  { key: "no-olx", label: "Без OLX" },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "newest", label: "Най-нови" },
  { key: "oldest", label: "Най-стари" },
  { key: "price-high", label: "Цена ↑" },
  { key: "price-low", label: "Цена ↓" },
];

export default function HistoryScreen() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Bold": require("@expo-google-fonts/montserrat/Montserrat_700Bold.ttf"),
    "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);

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
        year: "numeric",
      }) + " г.";
    } catch {
      return dateString;
    }
  };

  const displayedListings = useMemo(() => {
    let result = [...listings];

    if (filter === "olx") result = result.filter((l) => !!l.olxAdvertId);
    else if (filter === "no-olx") result = result.filter((l) => !l.olxAdvertId);

    if (sort === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sort === "oldest") result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sort === "price-low") result.sort((a, b) => a.price - b.price);

    return result;
  }, [listings, filter, sort]);

  const currentFilterLabel = FILTER_OPTIONS.find((o) => o.key === filter)?.label ?? "Филтър";
  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? "Сортиране";

  const toggleDropdown = (name: ActiveDropdown) =>
    setActiveDropdown((prev) => (prev === name ? null : name));

  if (!fontsLoaded) return null;

  const renderItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.historyContainer}
      onPress={() => router.push(`/listing/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.historyItem}>
        <View style={styles.historyItemLeft}>
          <Text style={styles.historyItemTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
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

      {/* Controls + dropdown overlay wrapped together so dropdown floats above FlatList */}
      <View style={styles.controlsArea}>
        {/* Dismiss overlay when a dropdown is open */}
        {activeDropdown !== null && (
          <TouchableWithoutFeedback onPress={() => setActiveDropdown(null)}>
            <View style={styles.dismissOverlay} />
          </TouchableWithoutFeedback>
        )}

        {/* Two buttons row */}
        <View style={styles.buttonsRow}>
          {/* Filter button */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={[styles.dropdownButton, activeDropdown === "filter" && styles.dropdownButtonActive]}
              onPress={() => toggleDropdown("filter")}
              activeOpacity={0.8}
            >
              <Text style={[styles.dropdownButtonText, activeDropdown === "filter" && styles.dropdownButtonTextActive]}>
                {currentFilterLabel}
              </Text>
              <Text style={[styles.chevron, activeDropdown === "filter" && styles.chevronActive]}>
                {activeDropdown === "filter" ? "▲" : "▾"}
              </Text>
            </TouchableOpacity>

            {activeDropdown === "filter" && (
              <View style={styles.dropdownMenu}>
                {FILTER_OPTIONS.map((opt, i) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.dropdownItem,
                      i < FILTER_OPTIONS.length - 1 && styles.dropdownItemBorder,
                      filter === opt.key && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setFilter(opt.key);
                      setActiveDropdown(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownItemText, filter === opt.key && styles.dropdownItemTextActive]}>
                      {opt.label}
                    </Text>
                    {filter === opt.key && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Sort button */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={[styles.dropdownButton, activeDropdown === "sort" && styles.dropdownButtonActive]}
              onPress={() => toggleDropdown("sort")}
              activeOpacity={0.8}
            >
              <Text style={[styles.dropdownButtonText, activeDropdown === "sort" && styles.dropdownButtonTextActive]}>
                {currentSortLabel}
              </Text>
              <Text style={[styles.chevron, activeDropdown === "sort" && styles.chevronActive]}>
                {activeDropdown === "sort" ? "▲" : "▾"}
              </Text>
            </TouchableOpacity>

            {activeDropdown === "sort" && (
              <View style={styles.dropdownMenu}>
                {SORT_OPTIONS.map((opt, i) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.dropdownItem,
                      i < SORT_OPTIONS.length - 1 && styles.dropdownItemBorder,
                      sort === opt.key && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setSort(opt.key);
                      setActiveDropdown(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownItemText, sort === opt.key && styles.dropdownItemTextActive]}>
                      {opt.label}
                    </Text>
                    {sort === opt.key && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <FlatList
        style={styles.list}
        data={displayedListings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Все още нямате история.</Text>
        }
      />
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
    top: 50,
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
  // Controls area sits above FlatList, handles its own overlay
  controlsArea: {
    zIndex: 10,
    marginBottom: 12,
  },
  dismissOverlay: {
    position: "absolute",
    top: -9999,
    bottom: -9999,
    left: -9999,
    right: -9999,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  dropdownWrapper: {
    position: "relative",
    width: 148,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  dropdownButtonActive: {
    borderColor: Colors.white,
    backgroundColor: Colors.white,
  },
  dropdownButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dropdownButtonTextActive: {
    color: Colors.black,
  },
  chevron: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  chevronActive: {
    color: Colors.black,
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 100,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: {
    backgroundColor: Colors.surface,
  },
  dropdownItemText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dropdownItemTextActive: {
    color: Colors.textPrimary,
    fontFamily: "Montserrat-Bold",
  },
  checkmark: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Inter-Medium",
  },
  list: {
    flex: 1,
    maxWidth: 500,
  },
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
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
  },
});
