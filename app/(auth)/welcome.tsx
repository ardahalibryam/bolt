import { useFonts } from "expo-font";
import { router } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Bold": require("@expo-google-fonts/montserrat/Montserrat_700Bold.ttf"),
    "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Top Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/welcome-bg-white.png")}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      {/* Bottom Content Section */}
      <SafeAreaView style={styles.contentContainer} edges={["bottom"]}>
        <View style={styles.content}>
          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>Снимай.</Text>
            <Text style={styles.heading}>Оцени.</Text>
            <Text style={styles.heading}>Продай.</Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(auth)/onboarding")}
          >
            <Text style={styles.buttonText}>Продължи</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageContainer: {
    flex: 1,
    width: "100%",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 0.6,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  content: {
    alignItems: "center",
  },
  headingContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  heading: {
    fontFamily: "Montserrat-Bold",
    fontSize: 48,
    color: Colors.textPrimary,
    lineHeight: 58,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Inter-Medium",
    fontSize: 18,
    color: "#FFFFFF",
  },
});
