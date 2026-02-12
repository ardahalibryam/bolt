import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

/**
 * Stores the auth token securely using the device's secure enclave/keystore
 */
export async function storeToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Retrieves the stored auth token from secure storage
 */
export async function getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Removes the stored auth token from secure storage
 */
export async function removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}
