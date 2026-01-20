/**
 * Products API Service
 *
 * Fetches equipment products from the Access Products API
 */

import type { Equipment, EquipmentFilters, EquipmentSearchResult } from "@/types/equipment";

const API_BASE_URL = process.env.NEXT_PUBLIC_PRODUCTS_API_URL || 'https://acccessproducts.netlify.app';

export interface ApiProduct {
  productId: string;
  model: string;
  description?: string;
  brand?: string;
  category: string;
  subCategory?: string;
  heroLabel?: string;
  productImages?: Array<{
    imageUrl: string;
    imageThumbUrl?: string;
    imageAltText?: string;
  }>;
  transportSpecification?: {
    weightKg?: number;
    widthM?: number;
    lengthM?: number;
    heightM?: number;
    heightFt?: string;
  };
  operationalSpecification?: {
    horizontalReachFt?: string;
    horizontalReachM?: number;
    platformHeightFt?: string;
    platformHeightM?: number;
    workingHeightFt?: string;
    workingHeightM?: number;
    capacityKg?: number;
    capacityT?: number;
  };
  pricing?: {
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
}

/**
 * Map API product to Equipment type
 */
function mapApiProductToEquipment(product: ApiProduct): Equipment {
  const getTitle = (): string => {
    if (product.heroLabel) {
      const match = product.heroLabel.match(/title="([^"]+)"/);
      return match ? match[1] : product.model;
    }
    return product.model;
  };

  const ops = product.operationalSpecification;

  return {
    id: product.productId,
    name: getTitle(),
    model: product.model,
    brand: product.brand || 'Unknown',
    category: product.category,
    subcategory: product.subCategory,
    description: product.description,
    imageUrl: product.productImages?.[0]?.imageUrl,
    images: product.productImages?.map(img => img.imageUrl),
    specs: {
      workingHeight: ops?.workingHeightFt && ops.workingHeightFt !== 'NA' ? ops.workingHeightFt : undefined,
      platformHeight: ops?.platformHeightFt,
      capacity: ops?.capacityT ? `${ops.capacityT}T` : ops?.capacityKg ? `${ops.capacityKg}kg` : undefined,
      reach: ops?.horizontalReachFt && ops.horizontalReachFt !== 'NA' ? ops.horizontalReachFt : undefined,
      weight: product.transportSpecification?.weightKg ? `${product.transportSpecification.weightKg}kg` : undefined,
    },
    pricing: product.pricing ? {
      daily: product.pricing.daily,
      weekly: product.pricing.weekly,
      monthly: product.pricing.monthly,
      currency: 'AUD',
    } : undefined,
    powerSource: inferPowerSource(product),
    environment: inferEnvironment(product),
  };
}

function inferPowerSource(product: ApiProduct): Equipment['powerSource'] {
  const category = product.category?.toLowerCase() || '';
  const model = product.model?.toLowerCase() || '';

  if (model.includes('electric') || category.includes('electric')) return 'electric';
  if (model.includes('diesel') || category.includes('diesel')) return 'diesel';
  if (model.includes('gas') || model.includes('lpg')) return 'gas';
  if (model.includes('hybrid')) return 'hybrid';
  return undefined;
}

function inferEnvironment(product: ApiProduct): Equipment['environment'] {
  const category = product.category?.toLowerCase() || '';
  const subCategory = product.subCategory?.toLowerCase() || '';

  if (subCategory.includes('indoor') || category.includes('indoor')) return 'indoor';
  if (subCategory.includes('outdoor') || category.includes('outdoor')) return 'outdoor';
  return 'both';
}

/**
 * Fetch all products from API
 */
export async function fetchProducts(options?: {
  limit?: number;
  category?: string;
  subcategory?: string;
}): Promise<ApiProduct[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let products: ApiProduct[] = Array.isArray(data) ? data : data.products || [];

    // Apply filters
    if (options?.category) {
      products = products.filter(
        p => p.category?.toLowerCase() === options.category!.toLowerCase()
      );
    }

    if (options?.subcategory) {
      products = products.filter(
        p => p.subCategory?.toLowerCase() === options.subcategory!.toLowerCase()
      );
    }

    if (options?.limit) {
      products = products.slice(0, options.limit);
    }

    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(productId: string): Promise<ApiProduct | null> {
  try {
    const products = await fetchProducts();
    return products.find(p => p.productId === productId) || null;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

/**
 * Search and filter equipment
 */
export async function searchEquipment(filters: EquipmentFilters = {}): Promise<EquipmentSearchResult> {
  const products = await fetchProducts();
  let equipment = products.map(mapApiProductToEquipment);

  // Apply filters
  if (filters.category) {
    equipment = equipment.filter(
      e => e.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters.subcategory) {
    equipment = equipment.filter(
      e => e.subcategory?.toLowerCase() === filters.subcategory!.toLowerCase()
    );
  }

  if (filters.brand) {
    equipment = equipment.filter(
      e => e.brand.toLowerCase() === filters.brand!.toLowerCase()
    );
  }

  if (filters.powerSource) {
    equipment = equipment.filter(e => e.powerSource === filters.powerSource);
  }

  if (filters.environment) {
    equipment = equipment.filter(e => e.environment === filters.environment);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    equipment = equipment.filter(
      e =>
        e.name.toLowerCase().includes(searchLower) ||
        e.model.toLowerCase().includes(searchLower) ||
        e.category.toLowerCase().includes(searchLower) ||
        e.brand.toLowerCase().includes(searchLower)
    );
  }

  // Get unique categories
  const categoriesMap = new Map<string, number>();
  products.forEach(p => {
    const cat = p.category;
    categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
  });

  const categories = Array.from(categoriesMap.entries()).map(([name, count]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    count,
  }));

  return {
    items: equipment,
    total: equipment.length,
    page: 1,
    pageSize: equipment.length,
    filters,
    categories,
  };
}

/**
 * Get unique categories from products
 */
export async function getCategories(): Promise<string[]> {
  const products = await fetchProducts();
  const categories = new Set(products.map(p => p.category));
  return Array.from(categories).sort();
}

/**
 * Get unique brands from products
 */
export async function getBrands(): Promise<string[]> {
  const products = await fetchProducts();
  const brands = new Set(products.filter(p => p.brand).map(p => p.brand!));
  return Array.from(brands).sort();
}
