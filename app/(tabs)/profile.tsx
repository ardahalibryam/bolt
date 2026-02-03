import { useFonts } from "expo-font";
import { router } from "expo-router";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { removeToken } from "../../lib/auth";
import { rateApp } from "../../lib/rateApp";
import { Colors } from "../constants/Colors";

export default function ProfileScreen() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Medium": require("@expo-google-fonts/montserrat/Montserrat_500Medium.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleLogout = async () => {
    await removeToken();
    router.replace("/(auth)/sign-in");
  };

  return (
    <View style={styles.wrapper}>
      <Image
        source={require("../../assets/images/gradients/gradient-profile.png")}
        style={styles.backgroundGradient}
        resizeMode="cover"
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.pfpImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Профил</Text>
          <View style={styles.profileContainer}>
            <TouchableOpacity style={styles.profileItem} onPress={() => router.push("/personal-data-screen")}>
              <View style={styles.profileItemContent}>
                <Image source={require("../../assets/images/icons/profile/profile.svg")} style={styles.profileItemImage} resizeMode="contain" />
                <Text style={styles.profileItemText}>Лични данни</Text>
              </View>
              <Image source={require("../../assets/images/icons/profile/arrow.svg")} style={styles.profileItemImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileItem} onPress={rateApp}>
              <View style={styles.profileItemContent}>
                <Image source={require("../../assets/images/icons/profile/star.svg")} style={styles.profileItemImage} resizeMode="contain" />
                <Text style={styles.profileItemText}>Оцени ни</Text>
              </View>
              <Image source={require("../../assets/images/icons/profile/arrow.svg")} style={styles.profileItemImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileItem} onPress={() => Linking.openURL("https://boltbg.info/#/privacy")}>
              <View style={styles.profileItemContent}>
                <Image source={require("../../assets/images/icons/profile/shield.svg")} style={styles.profileItemImage} resizeMode="contain" />
                <Text style={styles.profileItemText}>Поверителност</Text>
              </View>
              <Image source={require("../../assets/images/icons/profile/arrow.svg")} style={styles.profileItemImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.profileItem, styles.profileItemLast]} onPress={() => Linking.openURL("https://boltbg.info/#/support")}>
              <View style={styles.profileItemContent}>
                <Image source={require("../../assets/images/icons/profile/help.svg")} style={styles.profileItemImage} resizeMode="contain" />
                <Text style={styles.profileItemText}>Помощ</Text>
              </View>
              <Image source={require("../../assets/images/icons/profile/arrow.svg")} style={styles.profileItemImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileContainer}>
            <TouchableOpacity style={[styles.profileItem, styles.profileItemLast]} onPress={handleLogout}>
              <View style={styles.profileItemContent}>
                <Image source={require("../../assets/images/icons/profile/logout.svg")} style={styles.profileItemImage} resizeMode="contain" />
                <Text style={styles.profileItemText}>Изход</Text>
              </View>
              <Image source={require("../../assets/images/icons/profile/arrow.svg")} style={styles.profileItemImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  container: {
    flex: 1,
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
    color: Colors.textPrimary,
    fontSize: 32,
    marginBottom: 20,
  },
  profileContainer: {
    width: "90%",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginTop: 20,
  },
  profileItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  profileItemContent: {
    flexDirection: "row",
    gap: 20,
  },
  profileItemImage: {
    width: 20,
  },
  profileItemText: {
    fontFamily: "Montserrat-Medium",
    fontSize: 16,
    color: Colors.textPrimary,
  },
  profileItemLast: {
    borderBottomWidth: 0,
  },
});

