import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiError } from "./lib/apiClient";
import { DraftPricing, generateDraftPricing, generateDraftText, getDraftPricing } from "./lib/drafts";

export default function PriceScreen() {
  const { draftId } = useLocalSearchParams();
  const [pricing, setPricing] = useState<DraftPricing | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    loadPricing();
  }, [draftId]);

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
        setFetchError("Неуспешно генериране на цени.");
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
          description
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
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  if (fetchError || !pricing) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{fetchError || "Няма налични цени"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPricing}>
          <Text style={styles.buttonText}>Опитайте отново</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButtonCenter} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Image
          source={require("../assets/images/icons/nav/arrow-back.svg")}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Изберете цена</Text>

        {/* Option: Fast */}
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

        {/* Option: Recommended */}
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

        {/* Option: Max */}
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

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Генерирай обява</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1000,
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 32,
    textAlign: "center",
    fontWeight: "bold",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    borderColor: "#007AFF",
    backgroundColor: "#1A1A1A", // Keep background dark but border highlights it
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  optionHelper: {
    color: "#999",
    fontSize: 14,
  },
  optionPrice: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 24,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF453A",
    fontSize: 18,
    textAlign: "center",
  },
  backButtonCenter: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: "#999",
    fontSize: 16,
  },
});
