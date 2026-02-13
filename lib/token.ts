import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";

/**
 * Stores the auth token securely.
 * Uses SecureStore on native, localStorage on web.
 */
export async function storeToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
}

/**
 * Retrieves the stored auth token.
 */
export async function getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
        return localStorage.getItem(TOKEN_KEY);
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Removes the stored auth token.
 */
export async function removeToken(): Promise<void> {
    if (Platform.OS === "web") {
        localStorage.removeItem(TOKEN_KEY);
    } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
}
