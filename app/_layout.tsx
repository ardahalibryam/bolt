import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { API_BASE_URL } from "../lib/api";
import { exchangeOlxCode } from "../lib/olx";
import { CURRENT_VERSION } from "./constants/appVersion";
import { Colors } from "./constants/Colors";

// Global callback so the listing screen can react to OLX connection
let _olxConnectedCallback: (() => void) | null = null;
export function setOlxConnectedCallback(cb: (() => void) | null) {
  _olxConnectedCallback = cb;
}

export default function RootLayout() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");

  // ── Check for app updates on launch ────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/app/version`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.version && data.version !== CURRENT_VERSION) {
          setStoreUrl(data.storeUrl || "");
          setShowUpdate(true);
        }
      } catch {
        // Fail silently — don't block the app if the check fails
      }
    })();
  }, []);

  // ── Handle deep links for OLX OAuth callback ──────────────────
  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const url = event.url;
      if (!url.startsWith("bolt://olx-callback")) return;

      try {
        const codeMatch = url.match(/[?&]code=([^&]+)/);
        if (codeMatch?.[1]) {
          await exchangeOlxCode(codeMatch[1]);
          _olxConnectedCallback?.();
        }
      } catch (error) {
        console.error("OLX token exchange failed:", error);
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);

    // Also check if the app was opened with a deep link (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />

      {/* Update Available Modal */}
      <Modal
        visible={showUpdate}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpdate(false)}
      >
        <View style={updateStyles.overlay}>
          <View style={updateStyles.card}>
            <Text style={updateStyles.title}>Налична е нова версия</Text>
            <Text style={updateStyles.message}>
              Искате ли да изтеглите последната версия на приложението?
            </Text>

            <View style={updateStyles.buttons}>
              <TouchableOpacity
                style={updateStyles.laterButton}
                onPress={() => setShowUpdate(false)}
              >
                <Text style={updateStyles.laterText}>По-късно</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={updateStyles.updateButton}
                onPress={() => {
                  setShowUpdate(false);
                  if (storeUrl) Linking.openURL(storeUrl);
                }}
              >
                <Text style={updateStyles.updateText}>Обнови</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}

const updateStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  laterButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  laterText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  updateButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  updateText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});
