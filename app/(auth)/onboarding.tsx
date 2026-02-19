import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < onboardingData.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
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

  const isFirstSlide = currentSlide === 0;
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
        {/* Top Bar: Back (left) + Skip (right) */}
        <View style={styles.topBar}>
          {!isFirstSlide ? (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Image
                source={require("../../assets/images/icons/onboarding/back-onboarding.png")}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}

          {!isLastSlide ? (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Пропусни</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
        </View>

        {/* Scrollable content — prevents clipping on short screens */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Icon */}
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
        </ScrollView>

        {/* Bottom Navigation — always pinned */}
        <View style={styles.bottomContainer}>
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
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.primaryButtonText}>Продължи</Text>
              </TouchableOpacity>
            </View>
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: SCREEN_HEIGHT * 0.015,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  backPlaceholder: {
    width: 40,
    height: 40,
  },
  skipText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: Colors.textLight,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  logoContainer: {
    paddingTop: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logo: {
    marginTop: SCREEN_HEIGHT * 0.01,
    height: SCREEN_HEIGHT * 0.08,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  onboardingImage: {
    width: SCREEN_WIDTH * 0.75,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  text: {
    fontFamily: "Montserrat-Regular",
    fontSize: Math.min(28, SCREEN_WIDTH * 0.07),
    color: Colors.textPrimary,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: Math.min(34, SCREEN_WIDTH * 0.085),
  },
  bottomContainer: {
    paddingBottom: SCREEN_HEIGHT * 0.04,
    alignItems: "center",
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
