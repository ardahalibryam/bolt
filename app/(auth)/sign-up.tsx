import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { register, storeToken } from "../../lib/auth";
import { Colors } from "../constants/Colors";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newsletterChecked, setNewsletterChecked] = useState(false);
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

  const handleSignUp = async () => {
    if (isLoading) return;

    if (!email || !password || !name) {
      setError("Моля, попълнете всички задължителни полета.");
      return;
    }

    if (password.length < 6) {
      setError("Паролата трябва да бъде поне 6 символа.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const token = await register(email.trim(), password);
      if (token) {
        await storeToken(token);
        router.replace("/(tabs)/" as any);
      } else {
        // Fallback if no token returned, redirect to login
        router.replace("/(auth)/sign-in");
      }
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
          <Text style={styles.title}>Регистрация</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
            <Text style={styles.loginLink}>Вход</Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Име"
            placeholderTextColor="#4D4D4D"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Имейл"
            placeholderTextColor="#4D4D4D"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
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

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Primary Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#F2F2F2" />
          ) : (
            <Text style={styles.primaryButtonText}>Регистрирай се</Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => router.push("/(auth)/forgot-password")}>
          <Text style={styles.forgotPasswordText}>Забравена парола</Text>
        </TouchableOpacity>

        {/* Divider */}
        {/* <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>или</Text>
          <View style={styles.dividerLine} />
        </View> */}

        {/* Social Login Buttons */}
        {/* <View style={styles.socialContainer}>
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
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.textPrimary,
  },
  loginLink: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: Colors.primary,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingRight: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  showButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  showText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    color: Colors.primary,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(255, 69, 58, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 58, 0.3)",
  },
  errorText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    color: Colors.error,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
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
    color: "#FFFFFF",
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  // dividerContainer: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   marginBottom: 24,
  // },
  // dividerLine: {
  //   flex: 1,
  //   height: 1,
  //   backgroundColor: Colors.border,
  // },
  // dividerText: {
  //   fontFamily: "Inter-Regular",
  //   fontSize: 14,
  //   color: Colors.textSecondary,
  //   paddingHorizontal: 16,
  // },
  // socialContainer: {
  //   gap: 12,
  // },
  // socialButton: {
  //   backgroundColor: Colors.surface,
  //   borderRadius: 12,
  //   paddingVertical: 16,
  //   paddingHorizontal: 16,
  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   borderWidth: 1,
  //   borderColor: Colors.border,
  // },
  // socialIcon: {
  //   width: 24,
  //   height: 24,
  //   marginRight: 12,
  // },
  // socialButtonText: {
  //   fontFamily: "Inter-SemiBold",
  //   fontSize: 16,
  //   color: Colors.textPrimary,
  // },
});
