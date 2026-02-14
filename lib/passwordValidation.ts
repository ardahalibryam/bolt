export interface PasswordRules {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
}

/**
 * Validates a password against all strength rules.
 * Keys match the backend's failedRules response.
 */
export function validatePassword(password: string): PasswordRules {
    return {
        minLength: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        specialChar: /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?\/\\]/.test(password),
    };
}

/**
 * Returns true if all password rules are satisfied.
 */
export function isPasswordValid(rules: PasswordRules): boolean {
    return Object.values(rules).every(Boolean);
}
