/**
 * Algolia Search Service
 *
 * Integrates with the Access Group product index for equipment search.
 * Uses Algolia v5 API.
 */

import { algoliasearch } from 'algoliasearch';

// Algolia configuration
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'ZVMLPBZ3YI';
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || 'e4a2311272ac551d3ad467d1fc6a984b';
const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'all-products';

// Initialize Algolia client (v5 API)
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

// Types matching Algolia index structure
export interface AlgoliaProduct {
  objectID: string;
  productID: string;
  productKey: string;
  name: {
    en: string;
  };
  attributes: {
    brand?: string;
    model?: string;
    energySource?: string;
    isHire?: boolean;
    isSale?: boolean;
    isUsed?: boolean;
    workingHeightM?: number;
    workingHeightFT?: number;
    horizontalReachM?: number;
    horizontalReachFT?: number;
    capacityKg?: number;
    capacityT?: number;
    widthM?: number;
  };
  categories: {
    en: {
      lvl0?: string[];
      lvl1?: string[];
    };
  };
  categoryKeys: {
    en: string[];
  };
  categorySlugs: {
    en: string[];
  };
  images: string[];
  facets: {
    capacity?: string[];
    workingHeight?: string[];
    horizontalReach?: string[];
    platformHeight?: string[];
  };
  isInStock: boolean;
  slug: {
    en: string;
  };
}

export interface SearchFilters {
  query?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  isHire?: boolean;
  isSale?: boolean;
  isUsed?: boolean;
  inStock?: boolean;
}

export interface SearchOptions {
  page?: number;
  hitsPerPage?: number;
  filters?: SearchFilters;
}

export interface SearchResult {
  hits: AlgoliaProduct[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  query: string;
  facets?: Record<string, Record<string, number>>;
}

/**
 * Build Algolia filter string from search filters
 */
function buildFilterString(filters: SearchFilters): string {
  const filterParts: string[] = [];

  if (filters.category) {
    // Use categoryKeys for filtering (flat array)
    filterParts.push(`categoryKeys.en:"${filters.category}"`);
  }

  if (filters.subcategory) {
    filterParts.push(`categoryKeys.en:"${filters.subcategory}"`);
  }

  if (filters.brand) {
    filterParts.push(`attributes.brand:"${filters.brand}"`);
  }

  if (filters.isHire !== undefined) {
    filterParts.push(`attributes.isHire:${filters.isHire}`);
  }

  if (filters.isSale !== undefined) {
    filterParts.push(`attributes.isSale:${filters.isSale}`);
  }

  if (filters.isUsed !== undefined) {
    filterParts.push(`attributes.isUsed:${filters.isUsed}`);
  }

  if (filters.inStock !== undefined) {
    filterParts.push(`isInStock:${filters.inStock}`);
  }

  return filterParts.join(' AND ');
}

/**
 * Search products using Algolia v5 API
 */
export async function searchProducts(options: SearchOptions = {}): Promise<SearchResult> {
  const {
    page = 0,
    hitsPerPage = 12,
    filters = {},
  } = options;

  try {
    const filterString = buildFilterString(filters);

    const result = await searchClient.searchSingleIndex<AlgoliaProduct>({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: {
        query: filters.query || '',
        page,
        hitsPerPage,
        filters: filterString || undefined,
        facets: ['categoryKeys.en', 'attributes.brand', 'attributes.energySource'],
        attributesToRetrieve: [
          'objectID',
          'productID',
          'productKey',
          'name',
          'attributes',
          'categories',
          'categoryKeys',
          'categorySlugs',
          'images',
          'facets',
          'isInStock',
          'slug',
        ],
      },
    });

    return {
      hits: result.hits,
      nbHits: result.nbHits ?? 0,
      page: result.page ?? 0,
      nbPages: result.nbPages ?? 0,
      hitsPerPage: result.hitsPerPage ?? hitsPerPage,
      query: result.query || '',
      facets: result.facets as Record<string, Record<string, number>>,
    };
  } catch (error) {
    console.error('Algolia search error:', error);
    return {
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage,
      query: filters.query || '',
    };
  }
}

/**
 * Get all available categories
 */
export async function getCategories(): Promise<{ name: string; count: number }[]> {
  try {
    const result = await searchClient.searchSingleIndex<AlgoliaProduct>({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: {
        query: '',
        hitsPerPage: 0,
        facets: ['categoryKeys.en'],
      },
    });

    const categoryFacets = result.facets?.['categoryKeys.en'] || {};

    // Filter to only top-level categories (those that appear in lvl0)
    // We'll get all and let the UI decide what to show
    return Object.entries(categoryFacets)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Failed to get categories:', error);
    return [];
  }
}

/**
 * Get all available brands
 */
export async function getBrands(): Promise<{ name: string; count: number }[]> {
  try {
    const result = await searchClient.searchSingleIndex<AlgoliaProduct>({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: {
        query: '',
        hitsPerPage: 0,
        facets: ['attributes.brand'],
      },
    });

    const brandFacets = result.facets?.['attributes.brand'] || {};

    return Object.entries(brandFacets)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Failed to get brands:', error);
    return [];
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId: string): Promise<AlgoliaProduct | null> {
  try {
    const result = await searchClient.searchSingleIndex<AlgoliaProduct>({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: {
        query: '',
        filters: `productID:"${productId}"`,
        hitsPerPage: 1,
      },
    });

    return result.hits[0] || null;
  } catch (error) {
    console.error('Failed to get product:', error);
    return null;
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<AlgoliaProduct | null> {
  try {
    const result = await searchClient.searchSingleIndex<AlgoliaProduct>({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: {
        query: '',
        filters: `slug.en:"${slug}"`,
        hitsPerPage: 1,
      },
    });

    return result.hits[0] || null;
  } catch (error) {
    console.error('Failed to get product by slug:', error);
    return null;
  }
}

/**
 * Map Algolia product to simplified equipment format
 */
export function mapAlgoliaToEquipment(product: AlgoliaProduct) {
  const attrs = product.attributes;
  const cats = product.categories?.en;

  return {
    id: product.productID,
    objectId: product.objectID,
    name: product.name?.en || attrs?.model || 'Unknown',
    model: attrs?.model || '',
    brand: attrs?.brand || 'Unknown',
    category: cats?.lvl0?.[0] || 'Equipment',
    subcategory: cats?.lvl1?.[0]?.split(' > ')[1] || undefined,
    slug: product.slug?.en || product.productID,
    imageUrl: product.images?.[0] || undefined,
    images: product.images || [],
    specs: {
      workingHeight: attrs?.workingHeightFT ? `${attrs.workingHeightFT}ft` : undefined,
      horizontalReach: attrs?.horizontalReachFT ? `${attrs.horizontalReachFT}ft` : undefined,
      capacity: attrs?.capacityT ? `${attrs.capacityT}T` : undefined,
    },
    energySource: attrs?.energySource,
    isHire: attrs?.isHire ?? true,
    isSale: attrs?.isSale ?? false,
    isUsed: attrs?.isUsed ?? false,
    isInStock: product.isInStock,
  };
}

// Export the search client for advanced usage (e.g., InstantSearch)
export { searchClient, ALGOLIA_APP_ID, ALGOLIA_INDEX_NAME };
