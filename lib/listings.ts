import { apiDelete, apiGet } from "./apiClient";

export interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    createdAt: string;
    currency?: string;
    externalPlatformHint?: string;
}

interface BackendListing {
    _id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    createdAt: string;
    currency?: string;
    externalPlatformHint?: string;
}

interface ListingsResponse {
    items: BackendListing[];
    total: number;
}

export async function getMyListings(): Promise<Listing[]> {
    const response = await apiGet<ListingsResponse>("/listings");
    return response.items.map(mapBackendListing);
}

export async function getListing(id: string): Promise<Listing> {
    const backendListing = await apiGet<BackendListing>(`/listings/${id}`);
    return mapBackendListing(backendListing);
}

export async function deleteListing(id: string): Promise<void> {
    await apiDelete(`/listings/${id}`);
}

function mapBackendListing(item: BackendListing): Listing {
    return {
        id: item._id,
        title: item.title,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
        currency: item.currency,
        externalPlatformHint: item.externalPlatformHint
    };
}
