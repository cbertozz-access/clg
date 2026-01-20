/**
 * Equipment Types
 *
 * Types for equipment data from the products API
 */

export type PowerSource = 'electric' | 'diesel' | 'gas' | 'hybrid' | 'petrol';
export type Environment = 'indoor' | 'outdoor' | 'both';

export interface EquipmentSpecs {
  workingHeight?: string;
  platformHeight?: string;
  capacity?: string;
  reach?: string;
  weight?: string;
  dimensions?: string;
  power?: string;
  fuelType?: string;
  [key: string]: string | undefined;
}

export interface EquipmentPricing {
  daily?: number;
  weekly?: number;
  monthly?: number;
  currency?: string;
}

export interface EquipmentAvailability {
  status: 'available' | 'limited' | 'unavailable';
  locations?: string[];
  nextAvailable?: string;
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  brand: string;
  category: string;
  subcategory?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  specs: EquipmentSpecs;
  pricing?: EquipmentPricing;
  availability?: EquipmentAvailability;
  powerSource?: PowerSource;
  environment?: Environment;
  featured?: boolean;
  tags?: string[];
}

export interface EquipmentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  count?: number;
  subcategories?: EquipmentSubcategory[];
}

export interface EquipmentSubcategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface EquipmentFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  powerSource?: PowerSource;
  environment?: Environment;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface EquipmentSearchResult {
  items: Equipment[];
  total: number;
  page: number;
  pageSize: number;
  filters: EquipmentFilters;
  categories?: EquipmentCategory[];
}
