import { useFonts } from "expo-font";
import { router } from "expo-router";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    "Montserrat-SemiBold": require("@expo-google-fonts/montserrat/Montserrat_600SemiBold.ttf"),
    "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ImageBackground
      source={require("../../assets/images/welcome-bg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Logo */}
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 60,
  },
  headingContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  heading: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 60,
    color: "#F2F2F2",
    lineHeight: 72,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1374F6",
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Inter-Medium",
    fontSize: 20,
    color: "#F2F2F2",
  },
});
