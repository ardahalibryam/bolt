import { router } from "expo-router";
import { API_BASE_URL } from "./api";
import { getToken, removeToken } from "./token";

/**
 * Custom error for API responses
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: unknown
    ) {
        super(message);
        this.name = "ApiError";
    }
}

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
    body?: unknown;
    headers?: Record<string, string>;
    skipAuth?: boolean;
}

/**
 * Handles 401 errors by logging out user and redirecting to sign-in
 */
async function handleUnauthorized(): Promise<void> {
    await removeToken();
    router.replace("/(auth)/sign-in" as never);
}

/**
 * Core API request function with automatic auth header attachment
 */
async function apiRequest<T>(
    endpoint: string,
    method: RequestMethod,
    options: RequestOptions = {}
): Promise<T> {
    const { body, headers = {}, skipAuth = false } = options;

    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
    };

    // Attach Authorization header if token exists
    if (!skipAuth) {
        const token = await getToken();
        if (token) {
            requestHeaders["Authorization"] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
    });

    // Handle 401 Unauthorized
    if (response.status === 401 && !skipAuth) {
        await handleUnauthorized();
        throw new ApiError("Сесията ви е изтекла. Моля, влезте отново.", 401);
    }

    // Handle other error responses
    if (!response.ok) {
        let errorMessage = "Възникна грешка. Моля, опитайте отново.";
        let errorData: unknown;

        try {
            errorData = await response.json();
            if (typeof errorData === "object" && errorData !== null) {
                const data = errorData as { message?: string; error?: string };
                errorMessage = data.message || data.error || errorMessage;
            }
        } catch {
            // Use default error message if response parsing fails
        }

        throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

/**
 * GET request helper
 */
export function apiGet<T>(
    endpoint: string,
    options?: Omit<RequestOptions, "body">
): Promise<T> {
    return apiRequest<T>(endpoint, "GET", options);
}

/**
 * POST request helper
 */
export function apiPost<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">
): Promise<T> {
    return apiRequest<T>(endpoint, "POST", { ...options, body });
}

/**
 * PUT request helper
 */
export function apiPut<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">
): Promise<T> {
    return apiRequest<T>(endpoint, "PUT", { ...options, body });
}

/**
 * PATCH request helper
 */
export function apiPatch<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">
): Promise<T> {
    return apiRequest<T>(endpoint, "PATCH", { ...options, body });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(
    endpoint: string,
    options?: Omit<RequestOptions, "body">
): Promise<T> {
    return apiRequest<T>(endpoint, "DELETE", options);
}
