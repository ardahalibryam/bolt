import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace("/(tabs)")}
      >
        <Image
          source={require("../assets/images/icons/nav/home.png")}
          style={styles.homeIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.text}>История на обяви</Text>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    color: "#fff",
    fontSize: 18,
  },
});

