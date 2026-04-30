import { useFonts } from "expo-font";
import { router, useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { removeToken } from "../../lib/auth";
import { disconnectOlx, getOlxAuthUrl, getOlxStatus } from "../../lib/olx";
import { rateApp } from "../../lib/rateApp";
import { setOlxConnectedCallback } from "../_layout";
import { Colors } from "../constants/Colors";

export default function ProfileScreen() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Medium": require("@expo-google-fonts/montserrat/Montserrat_500Medium.ttf"),
  });

  const [olxConnected, setOlxConnected] = useState(false);
  const [olxConnecting, setOlxConnecting] = useState(false);
  const [olxDisconnecting, setOlxDisconnecting] = useState(false);

  // Register callback for deep link OAuth completion
  const onOlxConnected = useCallback(() => {
    setOlxConnected(true);
    setOlxConnecting(false);
  }, []);

  useEffect(() => {
    setOlxConnectedCallback(onOlxConnected);
    return () => setOlxConnectedCallback(null);
  }, [onOlxConnected]);

  // Check OLX status whenever profile screen is focused
  useFocusEffect(
    useCallback(() => {
      getOlxStatus()
        .then((s) => setOlxConnected(s.connected))
        .catch(() => { });
    }, [])
  );

  if (!fontsLoaded) {
    return null;
  }

  const handleLogout = async () => {
    await removeToken();
    router.replace("/(auth)/sign-in");
  };

  const handleDisconnectOlx = () => {
    const doDisconnect = async () => {
      setOlxDisconnecting(true);
      try {
        await disconnectOlx();
        setOlxConnected(false);
      } catch (error: any) {
        Alert.alert("Грешка", error?.message || "Неуспешно прекъсване на връзката.");
      } finally {
        setOlxDisconnecting(false);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Прекъсване на връзката с OLX?");
      if (confirmed) doDisconnect();
    } else {
      Alert.alert(
        "OLX",
        "Сигурни ли сте, че искате да прекъснете връзката с OLX?",
        [
          { text: "Отказ", style: "cancel" },
          { text: "Прекъсни", style: "destructive", onPress: doDisconnect },
        ]
      );
    }
  };

  const handleConnectOlx = async () => {
    setOlxConnecting(true);
    try {
      const { url } = await getOlxAuthUrl();
      await WebBrowser.openAuthSessionAsync(url, "bolt://olx-callback");
    } catch (error) {
      Alert.alert("Грешка", "Неуспешно свързване с OLX.");
      setOlxConnecting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Image
        source={require("../../assets/images/gradients/gradient-profile.png")}
        style={styles.backgroundGradient}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push("/(tabs)")}
      >
        <Image
          source={require("../../assets/images/icons/nav/home-black.png")}
          style={styles.homeIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
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
                <Image source={require("../../assets/images/icons/profile/profile.png")} style={styles.profileItemImage} resizeMode="contain" />
                <Text style={styles.profileItemText}>Лични данни</Text>
              </View>
              <Image source={require("../../assets/images/icons/profile/arrow.png")} style={styles.profileItemImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileItem} onPress={rateApp}>
              <View style={styles.profileItemContent}>
                <Image source={require("../../assets/images/icons/profile/star.png")} style={styles.profileItemImage} resizeMode="contain" />
                <Text style={styles.profileItemText}>Оцени ни</Text>
              </View>
              <Image source={require("../../assets/images/icons/profile/arrow.png")} style={styles.profileItemImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileItem} onPress={() => Linking.openURL("https://boltbg.info/#/privacy")}>
              <View style={styles.profileItemContent}>
                <Image source={require("../../assets/images/icons/profile/shield.png")} style={styles.profileItemImage} resizeMode="contain" />
                <Text style={styles.profileItemText}>Поверителност</Text>
              </View>
              <Image source={require("../../assets/images/icons/profile/arrow.png")} style={styles.profileItemImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.profileItem, styles.profileItemLast]} onPress={() => Linking.openURL("https://boltbg.info/#/support")}>
              <View style={styles.profileItemContent}>
                <Image source={require("../../assets/images/icons/profile/help.png")} style={styles.profileItemImage} resizeMode="contain" />
                <Text style={styles.profileItemText}>Помощ</Text>
              </View>
              <Image source={require("../../assets/images/icons/profile/arrow.png")} style={styles.profileItemImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          {/* OLX Connection Section */}
          <View style={styles.profileContainer}>
            {olxConnected ? (
              <>
                <TouchableOpacity style={styles.profileItem} onPress={() => router.push("/olx-details")}>
                  <View style={styles.profileItemContent}>
                    <Image source={require("../../assets/images/icons/profile/profile.png")} style={styles.profileItemImage} resizeMode="contain" />
                    <Text style={styles.profileItemText}>OLX Данни</Text>
                  </View>
                  <Image source={require("../../assets/images/icons/profile/arrow.png")} style={styles.profileItemImage} resizeMode="contain" />
                </TouchableOpacity>
                <View style={[styles.profileItem, styles.profileItemLast]}>
                  <View style={styles.profileItemContent}>
                    <View style={[styles.olxDot, styles.olxDotConnected]} />
                    <Text style={styles.profileItemText}>Свързан с OLX</Text>
                  </View>
                  <TouchableOpacity onPress={handleDisconnectOlx} disabled={olxDisconnecting}>
                    {olxDisconnecting ? (
                      <ActivityIndicator size="small" color={Colors.error} />
                    ) : (
                      <Text style={styles.olxDisconnectText}>Прекъсни</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.profileItem, styles.profileItemLast]}
                onPress={handleConnectOlx}
                disabled={olxConnecting}
              >
                <View style={styles.profileItemContent}>
                  <View style={styles.olxDot} />
                  <Text style={styles.profileItemText}>OLX не е свързан</Text>
                </View>
                {olxConnecting ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.olxConnectText}>Свържи</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.profileContainer}>
            <TouchableOpacity style={[styles.profileItem, styles.profileItemLast]} onPress={handleLogout}>
              <View style={styles.profileItemContent}>
                <Image source={require("../../assets/images/icons/profile/logout.png")} style={styles.profileItemImage} resizeMode="contain" />
                <Text style={styles.profileItemText}>Изход</Text>
              </View>
              <Image source={require("../../assets/images/icons/profile/arrow.png")} style={styles.profileItemImage} resizeMode="contain" />
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
  homeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1000,
    padding: 8,
  },
  homeIcon: {
    width: 24,
    height: 24,
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
    alignItems: "center",
    gap: 16,
  },
  profileItemImage: {
    width: 20,
    height: 20,
  },
  profileItemArrow: {
    width: 14,
    height: 14,
  },
  profileItemText: {
    fontFamily: "Montserrat-Medium",
    fontSize: 16,
    color: Colors.textPrimary,
  },
  profileItemLast: {
    borderBottomWidth: 0,
  },
  // ── OLX Styles ──────────────────────────────────────────────
  olxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textSecondary,
  },
  olxDotConnected: {
    backgroundColor: "#22c55e",
  },
  olxDisconnectText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
  olxConnectText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});

