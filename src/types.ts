export interface User {
  id: string; // Directus system users use UUID
  email: string;
  shop_name?: string;
  shop_slug?: string;
  token?: string;
}

export interface Color {
  id: number;
  name_fa: string;
  name_en: string;
  hex_code: string;
}

export type ClothingTypeSlug = 'tops' | 'bottoms' | 'footwear' | 'one_piece' | 'accessories';

export interface ClothingType {
  id: number;
  name: string;
  slug: ClothingTypeSlug;
}

export interface Category {
  id: number;
  name: string;
  name_fa?: string;
  slug?: string;
  system_type?: number | null;
  clothing_type_slug?: ClothingTypeSlug;
  user_id?: string | null;
}

export interface Size {
  id: number;
  name: string;
  sort_order: number;
  user_created?: string | null;
}

export interface SizeGuideSchema {
  // Height range in cm, weight range in kg, recommendations mapping body shapes to sizes
  gender: 'unisex' | 'male' | 'female';
  base_rules: Array<{
    min_height: number;
    max_height: number;
    min_weight: number;
    max_weight: number;
    shapes: {
      slim: string;    // e.g. "S"
      athletic: string;// e.g. "M"
      heavy: string;   // e.g. "L"
    };
  }>;
}

export interface Product {
  id: number;
  name_fa: string;
  name_en: string;
  description_fa?: string;
  description_en?: string;
  image?: string; // Directus file ID or absolute URL
  base_price: number;
  size_guides?: SizeGuideSchema; // JSON schema parsed in Size Advisor
  size_guide_template_id?: number | string | null; // ID of the template
  category?: string;
  category_id?: number | null;
  clothing_type_slug?: ClothingTypeSlug;
  created_by?: string;
}

export interface SizeGuideTemplateItem {
  size_id: number;
  min_height: number;
  max_height: number;
  min_weight: number;
  max_weight: number;
  min_chest?: number;
  max_chest?: number;
  min_waist?: number;
  max_waist?: number;
  min_hip?: number;
  max_hip?: number;
  min_shoulder?: number;
  max_shoulder?: number;
  min_sleeve?: number;
  max_sleeve?: number;
  min_length?: number;
  max_length?: number;
  min_foot_length?: number;
  max_foot_length?: number;
  shapes: {
    slim: boolean;
    regular?: boolean;
    athletic: boolean;
    heavy: boolean;
  };
}

export interface SizeGuideTemplate {
  id: number;
  name: string;
  clothing_type_slug?: ClothingTypeSlug;
  measurements: SizeGuideTemplateItem[]; // Array of size rules
  user_created?: string;
}

export interface InventoryItem {
  id: number;
  product_id: number;
  color_id: number;
  size_id: number;
  stock: number;
  price: number; // custom price for this variant, falls back to product base_price
}

export interface DiffSyncPayload {
  create: Array<Omit<InventoryItem, 'id'>>;
  update: Array<Partial<InventoryItem> & { id: number }>;
  delete: Array<number>; // IDs of inventory items to delete
}

export interface LocaleDictionary {
  [key: string]: string;
}
