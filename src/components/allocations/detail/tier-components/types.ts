import type { Allocation } from '@/types/allocation';

export interface TierFormData {
  name: string;
  level: number;
  accessStart: string;
  accessEnd: string;
  allocation: Allocation;
  overrides: {
    requirements?: {
      cartMin?: number;
      cartMax?: number;
      minAmount?: number;
    };
    discounts?: {
      type?: 'percentage' | 'fixed';
      amount?: number;
    };
    shipping?: {
      method?: string;
      type?: 'percentage' | 'fixed';
      amount?: number;
    };
    products?: boolean;
  };
}

export interface TierData {
  id: string;
  name: string;
  level: number;
  access_start: string;
  access_end: string;
  customer_count: number;
  overrides?: {
    requirements?: any;
    discounts?: any;
    shipping?: any;
    has_product_overrides?: boolean;
  };
}

export interface SelectedSource {
  sourceId: string;
  items: Array<{
    id: string;
    name: string;
    count?: number;
  }>;
}