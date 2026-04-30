import { apiGet, apiPatch, apiPost } from "./apiClient";

export interface CreateDraftResponse {
    draftId: string;
    detectedName?: string;
    detectedNameBg?: string;
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
 * @returns The created draft ID and detected product name
 */
export async function createDraft(imageUrl: string): Promise<CreateDraftResponse> {
    return apiPost<CreateDraftResponse>("/drafts", { imageUrl });
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
 * Replaces the additional images attached to a draft.
 * Backend stores up to 4 extras (5 total including the cover).
 */
export interface UpdateDraftImagesResponse {
    draftId: string;
    imageUrl: string;
    additionalImageUrls: string[];
}

export async function updateDraftImages(
    draftId: string,
    additionalImageUrls: string[]
): Promise<UpdateDraftImagesResponse> {
    return apiPatch<UpdateDraftImagesResponse>(`/drafts/${draftId}/images`, {
        additionalImageUrls,
    });
}

/**
 * Persists a user-corrected item name to the draft.
 * Updates detectedName, detectedNameBg, pricingQuery, and searchQuery on the
 * backend so subsequent pricing and copywriting use the corrected name.
 */
export interface CorrectDraftNameResponse {
    draftId: string;
    detectedName: string;
    detectedNameBg: string;
    status: string;
    updatedAt: string;
}

export async function correctDraftName(
    draftId: string,
    correctedName: string
): Promise<CorrectDraftNameResponse> {
    return apiPatch<CorrectDraftNameResponse>(`/drafts/${draftId}/name`, {
        correctedName,
    });
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
