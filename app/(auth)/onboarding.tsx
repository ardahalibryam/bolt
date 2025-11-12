import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const onboardingData = [
  {
    image: require("../../assets/images/camera-icon-1.png"),
    text: "Снимай предмета, който искаш да продадеш.",
  },
  {
    image: require("../../assets/images/rocket-icon-1.png"),
    text: "Виж каква е актуалната цена!",
  },
  {
    image: require("../../assets/images/bell-icon-1.png"),
    text: "Генерирай обява с помощта на Изкуствен интелект.",
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("@expo-google-fonts/montserrat/Montserrat_400Regular.ttf"),
    "Inter-SemiBold": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleDotPress = (index: number) => {
    setCurrentSlide(index);
  };

  const handleSkip = () => {
    router.push("/(auth)/sign-up");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Image
          source={onboardingData[currentSlide].image}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.text}>
          {onboardingData[currentSlide].text}
        </Text>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? styles.dotActive : styles.dotInactive,
              ]}
              onPress={() => handleDotPress(index)}
            />
          ))}
        </View>

        {/* Skip Text */}
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Пропусни</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  logoContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  icon: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  text: {
    fontFamily: "Montserrat-Regular",
    fontSize: 30,
    color: "#F2F2F2",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 36,
  },
  bottomContainer: {
    paddingBottom: 60,
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: "#1374F6",
  },
  dotInactive: {
    backgroundColor: "#B0E4FD",
  },
  skipText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#1374F6",
    textDecorationLine: "underline",
  },
});
