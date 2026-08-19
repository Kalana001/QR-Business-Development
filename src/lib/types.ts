export type BusinessType = 'restaurant' | 'bookshop' | 'salon' | 'general';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  business_type: BusinessType;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  logo_url: string | null;
  banner_url: string | null;
  currency: string;
  theme_color: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: 'owner' | 'staff';
  created_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  author?: string | null;       // Bookshop
  isbn?: string | null;         // Bookshop
  duration?: number | null;     // Salon (minutes)
  badges?: string[] | null;     // Restaurant (e.g. ["Vegan", "Spicy"])
  description: string | null;
  price: number;
  quantity?: number | null;     // Bookshop / General
  is_available: boolean;
  is_featured: boolean;
  image_url: string | null;
  external_source?: string | null;
  external_product_id?: string | null;
  last_synced_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessTypeMeta {
  type: BusinessType;
  label: string;
  description: string;
  itemTerm: string;
  fields: {
    author: boolean;
    isbn: boolean;
    duration: boolean;
    badges: boolean;
    quantity: boolean;
  };
}

export const BUSINESS_TYPES_META: Record<BusinessType, BusinessTypeMeta> = {
  restaurant: {
    type: 'restaurant',
    label: 'Restaurant / Café',
    description: 'Food & drinks menu with badges, pricing, and availability. No quantity displayed.',
    itemTerm: 'Dish / Drink',
    fields: {
      author: false,
      isbn: false,
      duration: false,
      badges: true,
      quantity: false,
    },
  },
  bookshop: {
    type: 'bookshop',
    label: 'Bookshop',
    description: 'Books catalog with Author, ISBN, stock quantity, and pricing.',
    itemTerm: 'Book',
    fields: {
      author: true,
      isbn: true,
      duration: false,
      badges: false,
      quantity: true,
    },
  },
  salon: {
    type: 'salon',
    label: 'Salon / Barber',
    description: 'Services catalog with duration in minutes and service descriptions.',
    itemTerm: 'Service',
    fields: {
      author: false,
      isbn: false,
      duration: true,
      badges: false,
      quantity: false,
    },
  },
  general: {
    type: 'general',
    label: 'General / Other',
    description: 'General purpose product catalog with pricing and stock availability.',
    itemTerm: 'Product',
    fields: {
      author: false,
      isbn: false,
      duration: false,
      badges: false,
      quantity: true,
    },
  },
};
