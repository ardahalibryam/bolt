import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";

/**
 * Stores the auth token securely
 */
export async function storeToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
}

/**
 * Retrieves the stored auth token
 */
export async function getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Removes the stored auth token
 */
export async function removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
}
