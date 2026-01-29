import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as StoreReview from "expo-store-review";
import { Alert, Platform } from "react-native";

// STORAGE KEY
const RATE_LIMIT_KEY = "last_review_request_timestamp";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// TODO: Replace with your actual IDs
const ANDROID_PACKAGE_NAME = "com.bolt.app";
const IOS_APP_ID = "id123456789";

// Platform-specific Store URLs
const STORE_URLS = {
    ios: `itms-apps://apps.apple.com/app/${IOS_APP_ID}?action=write-review`,
    android: `market://details?id=${ANDROID_PACKAGE_NAME}`,
    androidFallback: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`,
};

/**
 * Opens the native store page for the app
 */
export async function openStorePage() {
    try {
        if (Platform.OS === "ios") {
            const supported = await Linking.canOpenURL(STORE_URLS.ios);
            if (supported) {
                await Linking.openURL(STORE_URLS.ios);
            } else {
                console.warn("Store URL not supported on this iOS device/simulator");
            }
        } else if (Platform.OS === "android") {
            // Try market:// first
            const supported = await Linking.canOpenURL(STORE_URLS.android);
            if (supported) {
                await Linking.openURL(STORE_URLS.android);
            } else {
                // Fallback to HTTPS
                await Linking.openURL(STORE_URLS.androidFallback);
            }
        }
    } catch (error) {
        console.error("Failed to open store page:", error);
    }
}

/**
 * Checks if we should request a review based on rate limiting (7 days)
 */
async function checkRateLimit(): Promise<boolean> {
    try {
        const lastRequest = await AsyncStorage.getItem(RATE_LIMIT_KEY);
        if (!lastRequest) return true;

        const lastTime = parseInt(lastRequest, 10);
        const now = Date.now();

        if (now - lastTime < SEVEN_DAYS_MS) {
            console.log("Rate limit active. Skipping review request.");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error checking rate limit:", error);
        return true; // Fail safe: allow request
    }
}

/**
 * Records the current time as the last review request
 */
async function updateRateLimit() {
    try {
        await AsyncStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
    } catch (error) {
        console.error("Error updating rate limit:", error);
    }
}

/**
 * Main function to trigger the "Rate Our App" flow
 */
export async function rateApp() {
    // 1. Dev Guard
    if (__DEV__) {
        console.log("DEV MODE: Skipping native In-App Review. Opening Store Page directly.");
        // Alert used just for demo visibility in Dev
        Alert.alert(
            "Dev Mode: Rate App",
            "In production, this would try the In-App Review first. Opening store URL now...",
            [{ text: "OK", onPress: openStorePage }]
        );
        return;
    }

    // 2. Rate Limiting
    const canRequest = await checkRateLimit();
    if (!canRequest) {
        return; // Silently exit if we asked recently
    }

    // 3. Eligibility Check
    const isAvailable = await StoreReview.isAvailableAsync();

    if (isAvailable) {
        // 4. Execute Native Review
        try {
            await StoreReview.requestReview();
            await updateRateLimit(); // Mark as requested
        } catch (error) {
            console.error("In-App Review failed:", error);
            // Fallback
            await openStorePage();
        }
    } else {
        // 5. Fallback if not available (e.g. quota exceeded or OS unsupported)
        console.log("In-App Review unavailable. Using fallback.");
        await openStorePage();
        await updateRateLimit();
    }
}
