import { apiGet, apiPost } from "./apiClient";

export interface CreateDraftResponse {
    draftId: string;
}

export interface DraftPricing {
    fast: number;
    recommended: number;
    max: number;
}

export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    createdAt: string;
}

export interface GenerateTextResponse {
    draftId: string;
    status: string;
    generatedText: {
        title: string;
        description: string;
    };
}

/**
 * Creates a new draft listing with an image
 * @param imageUrl - URL of the uploaded image
 * @returns The created draft ID
 */
export async function createDraft(imageUrl: string): Promise<string> {
    const response = await apiPost<CreateDraftResponse>("/drafts", { imageUrl });
    return response.draftId;
}

/**
 * Generates text content for the draft, saving the selected price
 * @param draftId - ID of the draft
 * @param selectedPrice - The selected price
 * @returns Response including draft status
 */
export async function generateDraftText(draftId: string, selectedPrice: number): Promise<GenerateTextResponse> {
    return apiPost<GenerateTextResponse>(`/drafts/${draftId}/generate-text`, { selectedPrice });
}

/**
 * Fetches pricing suggestions for a draft
 * @param draftId - ID of the draft
 * @returns Pricing suggestions
 */
export async function getDraftPricing(draftId: string): Promise<DraftPricing> {
    return apiGet<DraftPricing>(`/drafts/${draftId}/pricing`);
}

/**
 * Triggers pricing generation for a draft
 * @param draftId - ID of the draft
 */
export async function generateDraftPricing(draftId: string): Promise<void> {
    await apiPost(`/drafts/${draftId}/pricing`);
}

/**
 * Finalizes the draft and converts it to a listing
 * @param draftId - ID of the draft
 * @param payload - The final title and description
 * @returns The created listing ID
 */
export async function finalizeDraft(draftId: string, payload: { finalTitle: string; finalDescription: string }): Promise<{ listingId: string }> {
    return apiPost<{ listingId: string }>(`/drafts/${draftId}/finalize`, payload);
}

/**
 * Fetches a finalized listing by ID
 * @param listingId - ID of the listing
 * @returns The listing data
 */
export async function getListing(listingId: string): Promise<Listing> {
    return apiGet<Listing>(`/listings/${listingId}`);
}
