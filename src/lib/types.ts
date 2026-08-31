export type BusinessType = 'restaurant' | 'bookshop' | 'salon' | 'general';
export type UserRole = 'owner' | 'staff';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise' | 'enterprise_gift';
export type SubscriptionStatus = 'active' | 'expired';
export type BillingInterval = 'monthly' | 'annual';

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
  
  // Subscription fields (NULL max_items or max_categories = Unlimited)
  subscription_plan?: SubscriptionPlan;
  billing_interval?: BillingInterval;
  subscription_status?: SubscriptionStatus;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  max_items?: number | null;
  max_categories?: number | null;

  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: UserRole;
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

export interface ItemVariation {
  name: string;
  price: number;
  is_available?: boolean;
}

export interface CatalogItem {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  display_order?: number;       // Catalog Item ordering position
  
  // Type-specific optional metadata
  author?: string | null;       // Bookshop
  isbn?: string | null;         // Bookshop
  duration?: number | null;     // Salon (minutes)
  badges?: string[] | null;     // Restaurant (e.g. ["Vegan", "Spicy"])
  variations?: ItemVariation[] | null; // Item Options (e.g. Portion sizes, editions, variants)
  
  description: string | null;
  price: number;
  quantity?: number | null;     // Bookshop / General inventory
  is_available: boolean;
  is_featured: boolean;
  image_url: string | null;
  
  external_source?: string | null;
  external_product_id?: string | null;
  last_synced_at?: string | null;

  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanMeta {
  id: SubscriptionPlan;
  name: string;
  priceLKR: number;
  priceAnnualLKR: number;
  maxItems: number | null;
  maxCategories: number | null;
  badge: string;
  description: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS_META: Record<SubscriptionPlan, SubscriptionPlanMeta> = {
  free: {
    id: 'free',
    name: 'Starter Free',
    priceLKR: 0,
    priceAnnualLKR: 0,
    maxItems: 10,
    maxCategories: 5,
    badge: 'Free Forever',
    description: 'Perfect for small businesses creating their first digital QR catalog.',
    features: [
      'Up to 10 Catalog Items',
      'Up to 5 Categories',
      'Instant Mobile QR Code View',
      'Standard Support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Growth',
    priceLKR: 2000,
    priceAnnualLKR: 21000,
    maxItems: 150,
    maxCategories: 20,
    badge: 'Popular',
    description: 'Ideal for cafés, bookshops, and salons with expanding catalog needs.',
    features: [
      'Up to 150 Catalog Items',
      'Up to 20 Categories',
      'Custom Branding & Accent Colors',
      'Printable 5"x7" Table Tent Flyers',
      'Priority Admin Activation',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Business Plus',
    priceLKR: 3500,
    priceAnnualLKR: 36000,
    maxItems: null, // NULL = Unlimited
    maxCategories: null, // NULL = Unlimited
    badge: 'Best Value',
    description: 'Built for large restaurants, retail stores, and multi-category shops.',
    features: [
      'Unlimited Catalog Items',
      'Unlimited Categories',
      'All Pro Growth Features Included',
      'Advanced QR & Catalog Analytics',
      'Premium Catalog Designs',
    ],
  },
  enterprise_gift: {
    id: 'enterprise_gift',
    name: 'Business Plus (VIP Gift)',
    priceLKR: 0,
    priceAnnualLKR: 0,
    maxItems: null,
    maxCategories: null,
    badge: '🎁 VIP Gift',
    description: 'Complimentary full Business Plus access gifted by Platform Administrator.',
    features: [
      'Unlimited Catalog Items',
      'Unlimited Categories',
      'All Pro Growth Features Included',
      'Advanced QR & Catalog Analytics',
      'Premium Catalog Designs',
      'Complimentary VIP Access',
    ],
  },
};

/**
 * Dynamically calculate package annual discount percentage, savings, & monthly equivalent
 */
export function calculatePackageDiscount(monthlyPrice: number, annualPrice: number) {
  if (monthlyPrice <= 0 || annualPrice <= 0) {
    return {
      discountPercent: 0,
      formattedDiscount: '0%',
      monthlyEquivalent: 0,
      originalAnnualized: 0,
      savingsLKR: 0,
    };
  }
  const originalAnnualized = monthlyPrice * 12;
  const savingsLKR = originalAnnualized - annualPrice;
  const rawDiscount = (savingsLKR / originalAnnualized) * 100;
  
  // Format rounded dynamically: 12.5% for Pro, 14.3% for Business Plus
  const roundedDiscount = Math.round(rawDiscount * 10) / 10;
  const monthlyEquivalent = Math.round(annualPrice / 12);

  return {
    discountPercent: roundedDiscount,
    formattedDiscount: `${roundedDiscount}%`,
    monthlyEquivalent,
    originalAnnualized,
    savingsLKR,
  };
}

export const BUSINESS_TYPES_META: Record<BusinessType, {
  label: string;
  itemTerm: string;
  fields: {
    author?: boolean;
    isbn?: boolean;
    duration?: boolean;
    badges?: boolean;
    quantity?: boolean;
  };
}> = {
  restaurant: {
    label: 'Restaurant & Café',
    itemTerm: 'Dish / Drink',
    fields: { badges: true },
  },
  bookshop: {
    label: 'Bookshop',
    itemTerm: 'Book Title',
    fields: { author: true, isbn: true, quantity: true },
  },
  salon: {
    label: 'Salon & Barber',
    itemTerm: 'Service',
    fields: { duration: true },
  },
  general: {
    label: 'General Business',
    itemTerm: 'Product',
    fields: { quantity: true },
  },
};
