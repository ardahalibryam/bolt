import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_DRAFT_KEY = "active_draft";

export interface ActiveDraft {
    draftId: string;
    status: string;
    timestamp: number;
}

/**
 * Saves the current active draft ID and status to storage
 */
export async function saveActiveDraft(draftId: string, status: string): Promise<void> {
    try {
        const data: ActiveDraft = {
            draftId,
            status,
            timestamp: Date.now(),
        };
        await AsyncStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save active draft:", error);
    }
}

/**
 * Retrieves the active draft from storage
 */
export async function getActiveDraft(): Promise<ActiveDraft | null> {
    try {
        const json = await AsyncStorage.getItem(ACTIVE_DRAFT_KEY);
        if (!json) return null;
        return JSON.parse(json);
    } catch (error) {
        console.error("Failed to get active draft:", error);
        return null;
    }
}

/**
 * Clears the active draft from storage
 */
export async function clearActiveDraft(): Promise<void> {
    try {
        await AsyncStorage.removeItem(ACTIVE_DRAFT_KEY);
    } catch (error) {
        console.error("Failed to clear active draft:", error);
    }
}
