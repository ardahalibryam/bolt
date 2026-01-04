import { useFonts } from "expo-font";
import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { removeToken } from "../lib/auth";

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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.pfpImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>Profile</Text>
        <View style={styles.profileContainer}>
          <View style={styles.profileItem}>
            <View style={styles.profileItemContent}>
              <Image source={require("../../assets/images/icons/profile/profile.svg")} style={styles.profileItemImage} resizeMode="contain" />
              <Text style={styles.profileItemText}>Лични данни</Text>
            </View>
            <Image source={require("../../assets/images/icons/profile/arrow.svg")} style={styles.profileItemImage} resizeMode="contain" />
          </View>
          <View style={styles.profileItem}>
            <View style={styles.profileItemContent}>
              <Image source={require("../../assets/images/icons/profile/star.svg")} style={styles.profileItemImage} resizeMode="contain" />
              <Text style={styles.profileItemText}>Лични данни</Text>
            </View>
            <Image source={require("../../assets/images/icons/profile/arrow.svg")} style={styles.profileItemImage} resizeMode="contain" />
          </View>
          <View style={styles.profileItem}>
            <View style={styles.profileItemContent}>
              <Image source={require("../../assets/images/icons/profile/shield.svg")} style={styles.profileItemImage} resizeMode="contain" />
              <Text style={styles.profileItemText}>Лични данни</Text>
            </View>
            <Image source={require("../../assets/images/icons/profile/arrow.svg")} style={styles.profileItemImage} resizeMode="contain" />
          </View>
          <View style={styles.profileItem}><View style={styles.profileItemContent}>
            <Image source={require("../../assets/images/icons/profile/profile.svg")} style={styles.profileItemImage} resizeMode="contain" />
            <Text style={styles.profileItemText}>Лични данни</Text>
          </View>
            <Image source={require("../../assets/images/icons/profile/arrow.svg")} style={styles.profileItemImage} resizeMode="contain" /></View>
          <View style={[styles.profileItem, styles.profileItemLast]}><View style={styles.profileItemContent}>
            <Image source={require("../../assets/images/icons/profile/email.svg")} style={styles.profileItemImage} resizeMode="contain" />
            <Text style={styles.profileItemText}>Лични данни</Text>
          </View>
            <Image source={require("../../assets/images/icons/profile/arrow.svg")} style={styles.profileItemImage} resizeMode="contain" /></View>
        </View>
        <View style={styles.profileContainer}>
          <View style={styles.profileItem}>
            <View style={styles.profileItemContent}>
              <Image source={require("../../assets/images/icons/profile/settings.svg")} style={styles.profileItemImage} resizeMode="contain" />
              <Text style={styles.profileItemText}>Настройки</Text>
            </View>
            <Image source={require("../../assets/images/icons/profile/arrow.svg")} style={styles.profileItemImage} resizeMode="contain" />
          </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
  profileContainer: {
    width: "90%",
    backgroundColor: "#121212",
    borderColor: "#4D4D4D",
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
    borderColor: "#D4D4D4",
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
    color: "#f2f2f2",
  },
  profileItemLast: {
    borderBottomWidth: 0,
  },
});
