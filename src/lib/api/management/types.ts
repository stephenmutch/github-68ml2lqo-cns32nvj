/**
 * Type definitions for the Offset Management API
 */

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created: string;
}

export interface Account {
  id: string;
  app: string;
  account: string;
  name: string;
}

export interface AuthTicket {
  ticket: string;
  profile: Profile;
  accounts: Record<string, Account>;
}

export interface AuthResponse {
  ticket?: string;
  profile?: Profile;
  accounts?: Record<string, Account>;
  token?: string;
  account?: {
    id: string;
    name: string;
    account: string;
    created: string;
  };
}

export interface AuthTokenResponse {
  token: string;
  account: {
    id: string;
    name: string;
    account: string;
    created: string;
  };
}

export interface Address {
  id: string;
  hash: string;
  created: string;
  last_update: string;
  title: string;
  first_name: string;
  last_name: string;
  birthday: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  address_2: string;
  city: string;
  state: string;
  zip: string;
  zip_ext: string;
  country: string;
  lat: string;
  long: string;
  residential: string;
  verified: string;
  customer_id: string;
  default: string;
  public: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  state: string;
  order_count: string;
  order_total: string;
  last_order: string;
  last_order_total: string;
  last_update: string;
  created: string;
  signup_email_last_sent: string;
}

export interface Group {
  id: string;
  name: string;
  status: string;
  sort: string;
  allocation_message: string;
  allocation_start: string;
  checkout_cart_min: string;
  allocation_end: string;
  discount: string;
  free_shipping: string;
  description: string;
}

export interface Tag {
  id: string;
  name: string;
  description: string;
  customer_count: number;
  created: string;
  last_update: string;
}

export interface Order {
  id: string;
  datestamp: string;
  last_update: string;
  status: string;
  subtotal: string;
  tax: string;
  shipping: string;
  discount: string;
  credits: string;
  refund: string;
  total: string;
  customer_id: string;
  products: OrderProduct[];
}

export interface OrderProduct {
  id: string;
  sku: string;
  name: string;
  type: string;
  bottle_size: string;
  retail_price: string;
  discount: string;
  discount_type: string;
  price: string;
  quantity: string;
  status: string;
  description: string;
  image: string;
  stock_status: string;
  shipped: string;
  created: string;
}

export interface PaymentMethod {
  id: string;
  fingerprint: string;
  credit_type: string;
  credit_number: string;
  credit_expires_month: string;
  credit_expires_year: string;
  profile_id: string;
  payment_profile_id: string;
  first_name: string;
  birthday: string;
  phone: string;
  company: string;
  last_name: string;
  address: string;
  address_2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  customer_id: string;
  default: string;
  created: string;
  last_update: string;
}