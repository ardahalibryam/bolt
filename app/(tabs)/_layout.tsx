import { useFonts } from "expo-font";
import { Tabs, useRouter } from "expo-router";
import { Image, StyleSheet } from "react-native";

export default function TabsLayout() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopWidth: 0,
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: fontsLoaded ? "Inter-Medium" : undefined,
          fontSize: 12,
          marginTop: 4,
        },
        tabBarActiveTintColor: "#1374F6",
        tabBarInactiveTintColor: "#BFBFBF",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Начало",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/icons/nav/home.png")}
              style={[styles.icon, { tintColor: color }]}
              resizeMode="contain"
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
              source={require("../../assets/images/icons/nav/menu-snap.png")}
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
        name="profile"
        options={{
          title: "Профил",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/icons/nav/user.png")}
              style={[styles.icon, { tintColor: color }]}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
  snapIcon: {
    width: 50,
    height: 50,
  },
});
