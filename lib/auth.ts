import { API_BASE_URL } from "./api";
import { apiDelete, apiGet, apiPost } from "./apiClient";
import * as TokenService from "./token";

// Re-export token service for backward compatibility
export const { storeToken, getToken, removeToken } = TokenService;

interface LoginResponse {
    token: string;
}

// Register response is now just a message, no token
interface RegisterResponse {
    message: string;
}

interface VerifyEmailResponse {
    token: string;
    user: any;
}

interface ApiError {
    message?: string;
    error?: string | { message?: string; stack?: string };
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

            // Extract the error message string regardless of shape
            const errorStr = typeof errorData.error === "object"
                ? errorData.error?.message
                : errorData.error;
            const combinedMessage = errorData.message || errorStr || "";

            if (response.status === 403 && combinedMessage.toLowerCase().includes("verify")) {
                // Specific error code for frontend to handle
                throw new Error("EMAIL_NOT_VERIFIED");
            }

            if (response.status === 401) {
                errorMessage = "Невалиден имейл или парола.";
            } else if (response.status === 400) {
                errorMessage = "Моля, въведете валиден имейл и парола.";
            } else if (combinedMessage) {
                errorMessage = combinedMessage;
            }
        } catch (e: any) {
            // If we already threw the specific error, re-throw it
            if (e.message === "EMAIL_NOT_VERIFIED") throw e;
            // Otherwise use default error
        }

        throw new Error(errorMessage);
    }

    const data: LoginResponse = await response.json();
    return data.token;
}

/**
 * Registers a new user. 
 * NOTE: Does NOT log the user in. They must verify email first.
 */
export async function register(email: string, password: string): Promise<void> {
    try {
        await apiPost<RegisterResponse>("/auth/register", { email, password }, { skipAuth: true });
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

/**
 * Verifies email with the token from the link.
 * @returns The auth token (logs the user in).
 */
export async function verifyEmail(token: string): Promise<string> {
    try {
        const data = await apiPost<VerifyEmailResponse>("/auth/verify-email", { token }, { skipAuth: true });
        return data.token;
    } catch (error: any) {
        throw new Error(error.message || "Неуспешно потвърждение. Линкът може да е изтекъл.");
    }
}

/**
 * Resends the verification email.
 */
export async function resendVerification(email: string): Promise<void> {
    try {
        await apiPost("/auth/resend-verification", { email }, { skipAuth: true });
    } catch (error: any) {
        throw new Error(error.message || "Неуспешно изпращане на имейл. Моля, опитайте по-късно.");
    }
}

/**
 * Fetches current user profile
 */
export async function getMe(): Promise<{ email: string; createdAt: string }> {
    const response = await apiGet<{ user: { email: string; createdAt: string } }>("/auth/me");
    return response.user;
}

/**
 * Changes user password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiPost("/auth/change-password", { currentPassword, newPassword });
}

/**
 * Deletes user account
 */
export async function deleteAccount(currentPassword: string): Promise<void> {
    await apiDelete("/auth/me", {
        body: { password: currentPassword }
    });
}

/**
 * Requests a password reset email
 * Always succeeds from user perspective (security: no user enumeration)
 */
export async function forgotPassword(email: string): Promise<void> {
    await apiPost("/auth/forgot-password", { email }, { skipAuth: true });
}

/**
 * Resets password using token from email link
 * @throws Error with Bulgarian message on failure
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
    try {
        await apiPost("/auth/reset-password", { token, newPassword }, { skipAuth: true });
    } catch (error: any) {
        let errorMessage = "Възникна грешка. Моля, опитайте отново.";

        if (error.status === 400) {
            // Check if it's a weak password or invalid token
            const message = error.message?.toLowerCase() || "";
            if (message.includes("password") || message.includes("парола")) {
                errorMessage = "Паролата трябва да бъде поне 8 символа.";
            } else {
                errorMessage = "Линкът за възстановяване е невалиден или е изтекъл.";
            }
        }

        throw new Error(errorMessage);
    }
}
