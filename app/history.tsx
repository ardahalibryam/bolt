import { useFonts } from "expo-font";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Bold": require("@expo-google-fonts/montserrat/Montserrat_700Bold.ttf"),
    "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push("/(tabs)")}
      >
        <Image
          source={require("../assets/images/icons/nav/home.png")}
          style={styles.homeIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.pfpImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>History</Text>
        <View style={styles.historyContainer}>
          <View style={styles.historyItem}>
            <View style={styles.historyItemLeft}>
              <Text style={styles.historyItemTitle}>iPhone 15</Text>
              <Text style={styles.historyItemDate}>02.10.2025 г.</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>985 лв.</Text>
              </View>
            </View>
            <Image
              source={require("../assets/images/iphone.png")}
              style={styles.historyItemImage}
              resizeMode="cover"
            />
          </View>
        </View>
        <View style={styles.historyContainer}>
          <View style={styles.historyItem}>
            <View style={styles.historyItemLeft}>
              <Text style={styles.historyItemTitle}>iPhone 15</Text>
              <Text style={styles.historyItemDate}>02.10.2025 г.</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>985 лв.</Text>
              </View>
            </View>
            <Image
              source={require("../assets/images/iphone.png")}
              style={styles.historyItemImage}
              resizeMode="cover"
            />
          </View>
        </View>
        <View style={styles.historyContainer}>
          <View style={styles.historyItem}>
            <View style={styles.historyItemLeft}>
              <Text style={styles.historyItemTitle}>iPhone 15</Text>
              <Text style={styles.historyItemDate}>02.10.2025 г.</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>985 лв.</Text>
              </View>
            </View>
            <Image
              source={require("../assets/images/iphone.png")}
              style={styles.historyItemImage}
              resizeMode="cover"
            />
          </View>
        </View>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
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
  content: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    marginTop: 75,
  },
  pfpImage: {
    width: 100,
    height: 100,
    marginBottom: 25,
    borderRadius: 50,
  },
  title: {
    color: "#f2f2f2",
    fontSize: 32,
    marginBottom: 20,
  },
  historyContainer: {
    width: "90%",
    backgroundColor: "#121212",
    borderColor: "#4D4D4D",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginTop: 20,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  historyItemLeft: {
    flex: 1,
    marginRight: 16,
  },
  historyItemTitle: {
    fontFamily: "Montserrat-Bold",
    fontSize: 20,
    color: "#f2f2f2",
    marginBottom: 8,
  },
  historyItemDate: {
    fontFamily: "Inter-Medium",
    fontSize: 10,
    color: "#f2f2f2",
    marginBottom: 8,
  },
  priceBadge: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  priceText: {
    fontFamily: "Inter-Medium",
    fontSize: 12,
    color: "#000",
  },
  historyItemImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
});

