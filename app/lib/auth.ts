import { API_BASE_URL } from "./api";
import { apiPost } from "./apiClient";
import * as TokenService from "./token";

// Re-export token service for backward compatibility
export const { storeToken, getToken, removeToken } = TokenService;

interface LoginResponse {
    token: string;
}

interface RegisterResponse {
    token: string;
}

interface ApiError {
    message?: string;
    error?: string;
}

/**
 * Authenticates user with email and password
 * @returns The auth token on success
 * @throws Error with Bulgarian message on failure
 */
export async function login(email: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        let errorMessage = "Възникна грешка при влизане. Моля, опитайте отново.";

        try {
            const errorData: ApiError = await response.json();
            if (response.status === 401) {
                errorMessage = "Невалиден имейл или парола.";
            } else if (response.status === 400) {
                errorMessage = "Моля, въведете валиден имейл и парола.";
            } else if (errorData.message || errorData.error) {
                errorMessage = errorData.message || errorData.error || errorMessage;
            }
        } catch {
            // Use default error message if response parsing fails
        }

        throw new Error(errorMessage);
    }

    const data: LoginResponse = await response.json();
    return data.token;
}

/**
 * Registers a new user
 * @returns The auth token on success
 */
export async function register(email: string, password: string): Promise<string> {
    try {
        const data = await apiPost<RegisterResponse>("/auth/register", { email, password }, { skipAuth: true });
        return data.token;
    } catch (error: any) {
        let errorMessage = "Възникна грешка при регистрация. Моля, опитайте отново.";

        // Handle ApiError from apiClient
        if (error.status === 400) {
            errorMessage = "Невалидни данни за регистрация. Моля, проверете полетата.";
        } else if (error.status === 409) {
            errorMessage = "Потребител с такъв имейл вече съществува.";
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
}

