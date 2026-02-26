import { Stack } from "expo-router";
import { useEffect } from "react";
import { Linking } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { exchangeOlxCode } from "../lib/olx";

// Global callback so the listing screen can react to OLX connection
let _olxConnectedCallback: (() => void) | null = null;
export function setOlxConnectedCallback(cb: (() => void) | null) {
  _olxConnectedCallback = cb;
}

export default function RootLayout() {
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
    </SafeAreaProvider>
  );
}

