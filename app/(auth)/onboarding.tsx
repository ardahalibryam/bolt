import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

const onboardingData = [
  {
    icon: require("../../assets/images/camera-icon-1.png"),
    image: require("../../assets/images/onboarding-image-1.png"),
    text: "Снимай предмета, който искаш да продадеш.",
  },
  {
    icon: require("../../assets/images/rocket-icon-1.png"),
    image: require("../../assets/images/onboarding-image-2.png"),
    text: "Виж каква е актуалната цена!",
  },
  {
    icon: require("../../assets/images/bell-icon-1.png"),
    image: require("../../assets/images/onboarding-image-3.png"),
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

  const handleRegister = () => {
    router.push("/(auth)/sign-up");
  };

  const handleLogin = () => {
    router.push("/(auth)/sign-in");
  };

  const isLastSlide = currentSlide === onboardingData.length - 1;

  return (
    <View style={styles.outerContainer}>
      {/* Background Gradients */}
      {currentSlide === 0 && (
        <Image
          source={require("../../assets/images/gradients/gradient-bg-1.png")}
          style={styles.gradientTop}
          resizeMode="cover"
        />
      )}
      {currentSlide === 1 && (
        <Image
          source={require("../../assets/images/gradients/gradient-bg-2.png")}
          style={styles.gradientTop}
          resizeMode="cover"
        />
      )}
      {currentSlide === 2 && (
        <Image
          source={require("../../assets/images/gradients/gradient-bg-3.png")}
          style={styles.gradientBottom}
          resizeMode="cover"
        />
      )}

      <SafeAreaView style={styles.container}>
        {/* Icon at Top (replaces logo) */}
        <View style={styles.logoContainer}>
          <Image
            source={onboardingData[currentSlide].icon}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Image
            source={onboardingData[currentSlide].image}
            style={styles.onboardingImage}
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

          {/* Skip or Register/Login Buttons */}
          {isLastSlide ? (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
                <Text style={styles.primaryButtonText}>Регистрация</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
                <Text style={styles.secondaryButtonText}>Вход</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Пропусни</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
  },
  logoContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logo: {
    marginTop: 20,
    height: 80,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  onboardingImage: {
    width: 320,
    marginBottom: 20,
  },
  text: {
    fontFamily: "Montserrat-Regular",
    fontSize: 30,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    backgroundColor: Colors.inactive,
  },
  skipText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  buttonsContainer: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: Colors.transparent,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    color: Colors.primary,
  },
});
