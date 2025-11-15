import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    "Montserrat-SemiBold": require("@expo-google-fonts/montserrat/Montserrat_600SemiBold.ttf"),
    "Inter-Regular": require("@expo-google-fonts/inter/Inter_400Regular.ttf"),
    "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../../assets/images/home-bg.png")}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
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
      <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Добре дошли!</Text>
          <Text style={styles.subtitle}>
            Направете снимка.{"\n"}Получете цена.{"\n"}Продавайте по-умно.
          </Text>
          
          {/* Tips Grid */}
          <View style={styles.tipsGrid}>
            <LinearGradient
              colors={["#1E1E1E", "#121212", "#121212", "#1E1E1E"]}
              locations={[0, 0.3, 0.7, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.tipCard, styles.tipCardTop]}
            >
              <Text style={styles.tipText}>
                Колкото по-качествена снимка, толкова по-добра оценка.
              </Text>
            </LinearGradient>
            <View style={styles.bottomRow}>
              <LinearGradient
                colors={["#1E1E1E", "#121212", "#121212", "#1E1E1E"]}
                locations={[0, 0.3, 0.7, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.tipCard, styles.tipCardBottomLeft]}
              >
                <Text style={styles.tipText}>
                  Постави продукта на чист фон за по-добро разпознаване.
                </Text>
              </LinearGradient>
              <LinearGradient
                colors={["#1E1E1E", "#121212", "#121212", "#1E1E1E"]}
                locations={[0, 0.3, 0.7, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.tipCard, styles.tipCardBottomRight]}
              >
                <Text style={styles.tipText}>
                  Колкото по-ясна е снимката, толкова по-точно AI ще оцени продукта.
                </Text>
              </LinearGradient>
            </View>
          </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/camera")}
        >
          <Text style={styles.buttonText}>Заснеми предмет</Text>
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
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    alignSelf: "flex-start",
  },
  historyButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1000,
    padding: 8,
  },
  historyIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontFamily: "Montserrat-SemiBold",
    fontSize: 30,
    color: "#F2F2F2",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 20,
    color: "#F2F2F2",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  tipsGrid: {
    width: "100%",
    marginTop: 100,
    marginBottom: 24,
  },
  bottomRow: {
    flexDirection: "row",
    width: "100%",
  },
  tipCard: {
    borderWidth: 1,
    borderColor: "#4D4D4D",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 150,
  },
  tipCardTop: {
    width: "100%",
    marginBottom: 12,
  },
  tipCardBottomLeft: {
    flex: 1,
    marginRight: 6,
  },
  tipCardBottomRight: {
    flex: 1,
    marginLeft: 6,
  },
  tipText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: "#F2F2F2",
    textAlign: "center",
    lineHeight: 22,
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
    fontSize: 16,
    color: "#F2F2F2",
  },
});
