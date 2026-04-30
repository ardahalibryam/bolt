import { Feather, Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Tabs, useRouter } from "expo-router";
import { Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          borderColor: Colors.border,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: fontsLoaded ? "Inter-Medium" : undefined,
          fontSize: 12,
          marginTop: 4,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.inactive,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Начало",
          tabBarIcon: ({ color }) => (
            <Feather
              name="home"
              size={24}
              color={color}
              style={styles.ioniconReset}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="snap"
        options={{
          title: "",
          tabBarIcon: () => (
            <Image
              source={require("../../assets/images/icons/nav/menu-snap-black.png")}
              style={styles.snapIcon}
              resizeMode="contain"
            />
          ),
          tabBarLabel: () => null,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/camera");
          },
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Асистент",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color={color}
              style={styles.ioniconReset}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          // Hide profile from the tab bar — accessed via the home screen header icon.
          // The route still works at /(tabs)/profile.
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // @expo/vector-icons renders glyphs as Text. Without these overrides, the
  // built-in line-height + Android font padding knocks the tab label out of
  // alignment with neighboring tabs that use plain <Image> icons.
  ioniconReset: {
    width: 24,
    height: 24,
    lineHeight: 24,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  snapIcon: {
    width: 50,
    height: 50,
  },
});
