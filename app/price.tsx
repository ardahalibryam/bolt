import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreen } from "../components/LoadingScreen";
import { PressableScale } from "../components/PressableScale";
import { ApiError } from "../lib/apiClient";
import { DraftPricing, generateDraftPricing, generateDraftText, getDraftPricing } from "../lib/drafts";
import { Colors } from "./constants/Colors";

export default function PriceScreen() {
  const { draftId, productName, coverUrl, additionalImageUrls } = useLocalSearchParams();
  const [pricing, setPricing] = useState<DraftPricing | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fastGlow = useRef(new Animated.Value(0)).current;
  const recGlow = useRef(new Animated.Value(0)).current;
  const maxGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPricing();
  }, [draftId]);

  useEffect(() => {
    if (!pricing) return;
    const animate = (val: Animated.Value, target: number) =>
      Animated.timing(val, { toValue: target, duration: 220, useNativeDriver: false }).start();
    animate(fastGlow, selectedPrice === pricing.fast ? 1 : 0);
    animate(recGlow, selectedPrice === pricing.recommended ? 1 : 0);
    animate(maxGlow, selectedPrice === pricing.max ? 1 : 0);
  }, [selectedPrice, pricing, fastGlow, recGlow, maxGlow]);

  const glowStyle = (val: Animated.Value) => ({
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: val.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] }),
    shadowRadius: val.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }),
    elevation: val.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }),
  });

  // Intercept Android back button with discard warning
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert(
        "Отказ от обявата",
        "Сигурни ли сте? Обявата ще бъде изтрита.",
        [
          { text: "Остани", style: "cancel" },
          { text: "Изтрий", style: "destructive", onPress: () => router.back() },
        ]
      );
      return true; // Prevent default back
    });
    return () => backHandler.remove();
  }, []);

  const loadPricing = async () => {
    const id = Array.isArray(draftId) ? draftId[0] : draftId;
    if (!id) return;

    setLoading(true);
    setFetchError(null);

    try {
      // First try to generate pricing
      await generateDraftPricing(id);
    } catch (error) {
      // If 409 Conflict, it means pricing already exists -> proceed to fetch
      // For other errors, we stop and show error
      if (error instanceof ApiError && error.status === 409) {
        // Already priced, continue
      } else {
        console.error("Pricing generation failed:", error);
        setFetchError("Не могат да се намерят достатъчно обяви в OLX, за да се генерира цена.");
        setLoading(false);
        return;
      }
    }

    try {
      const data = await getDraftPricing(id);
      setPricing(data);
      setSelectedPrice(data.recommended);
    } catch (error) {
      console.error("Pricing fetch failed:", error);
      setFetchError("Неуспешно зареждане на цени.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPrice || selectedPrice <= 0) {
      Alert.alert("Грешка", "Моля, изберете валидна цена.");
      return;
    }

    const id = Array.isArray(draftId) ? draftId[0] : draftId;
    if (!id) {
      Alert.alert("Грешка", "Липсва ID на обявата.");
      return;
    }

    setSubmitting(true);
    try {
      // Generate text (saves price)
      const genResult = await generateDraftText(id, selectedPrice);

      if (genResult.status !== "text_generated") {
        throw new Error("Генерирането на текст не е успешно.");
      }

      const { title, description } = genResult.generatedText || {};

      if (!title || !description) {
        throw new Error("Липсват заглавие или описание от AI.");
      }

      // Navigate to Review screen for user editing
      router.push({
        pathname: "/review",
        params: {
          draftId: id,
          title,
          description,
          coverUrl: Array.isArray(coverUrl) ? coverUrl[0] : (coverUrl || ""),
          additionalImageUrls: Array.isArray(additionalImageUrls)
            ? additionalImageUrls[0]
            : (additionalImageUrls || "[]"),
        }
      });
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Грешка", "Неуспешно генериране на текст. Моля, опитайте отново.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (fetchError || !pricing) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{fetchError || "Няма налични цени"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Назад</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Product Name */}
        {productName ? (
          <Text style={styles.productName}>
            {Array.isArray(productName) ? productName[0] : productName}
          </Text>
        ) : null}

        <Text style={styles.title}>Изберете цена</Text>

        {/* Option: Fast */}
        <Animated.View style={[styles.optionWrapper, glowStyle(fastGlow)]}>
          <TouchableOpacity
            style={[styles.option, selectedPrice === pricing.fast && styles.selectedOption]}
            onPress={() => setSelectedPrice(pricing.fast)}
          >
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>⚡ Бърза продажба</Text>
              <Text style={styles.optionHelper}>По-бърза продажба</Text>
            </View>
            <Text style={styles.optionPrice}>{pricing.fast} €</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Option: Recommended */}
        <Animated.View style={[styles.optionWrapper, glowStyle(recGlow)]}>
          <TouchableOpacity
            style={[styles.option, selectedPrice === pricing.recommended && styles.selectedOption]}
            onPress={() => setSelectedPrice(pricing.recommended)}
          >
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>⭐ Препоръчана цена</Text>
              <Text style={styles.optionHelper}>Най-добър баланс</Text>
            </View>
            <Text style={styles.optionPrice}>{pricing.recommended} €</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Option: Max */}
        <Animated.View style={[styles.optionWrapper, glowStyle(maxGlow)]}>
          <TouchableOpacity
            style={[styles.option, selectedPrice === pricing.max && styles.selectedOption]}
            onPress={() => setSelectedPrice(pricing.max)}
          >
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>💰 Максимална цена</Text>
              <Text style={styles.optionHelper}>Максимална печалба</Text>
            </View>
            <Text style={styles.optionPrice}>{pricing.max} €</Text>
          </TouchableOpacity>
        </Animated.View>

        <PressableScale
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Генерирай обява</Text>
          )}
        </PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    marginBottom: 32,
    textAlign: "center",
    fontWeight: "bold",
  },
  productName: {
    color: Colors.primary,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  optionWrapper: {
    marginBottom: 16,
    borderRadius: 12,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.transparent,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  optionHelper: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  optionPrice: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: Colors.error,
    fontSize: 18,
    textAlign: "center",
    maxWidth: "80%",
  },
});

