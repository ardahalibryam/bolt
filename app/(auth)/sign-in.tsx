import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login, storeToken } from "../lib/auth";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    "Montserrat-Regular": require("@expo-google-fonts/montserrat/Montserrat_400Regular.ttf"),
    "Inter-Regular": require("@expo-google-fonts/inter/Inter_400Regular.ttf"),
    "Inter-Medium": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
    "Inter-SemiBold": require("@expo-google-fonts/inter/Inter_500Medium.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSignIn = async () => {
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const token = await login(email.trim(), password);
      await storeToken(token);
      router.replace("/(tabs)/" as any);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Възникна неочаквана грешка.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Вход</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
            <Text style={styles.registerLink}>Регистрация</Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Имейл"
              placeholderTextColor="#4D4D4D"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputWrapper}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Парола"
                placeholderTextColor="#4D4D4D"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showButton}
              >
                <Text style={styles.showText}>Покажи</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Primary Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#F2F2F2" />
          ) : (
            <Text style={styles.primaryButtonText}>Влез</Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Забравена парола</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>или</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../assets/images/icons/auth/google_icon.png")}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>Продължи с Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../assets/images/icons/auth/apple_icon.png")}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>Продължи с Apple</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontFamily: "Montserrat-Regular",
    fontSize: 30,
    color: "#F2F2F2",
  },
  registerLink: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#1374F6",
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#121212",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#212121",
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#F2F2F2",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#212121",
    paddingHorizontal: 16,
    paddingRight: 0,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#F2F2F2",
  },
  showButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  showText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: "#1374F6",
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#1374F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#F2F2F2",
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: "#1374F6",
    textDecorationLine: "underline",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333333",
  },
  dividerText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    color: "#BFBFBF",
    paddingHorizontal: 16,
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: "#4D4D4D",
  },
});
