import { proxyRequest } from './proxy';
import { type Address, type Category, type ClubMember, type Club, type Customer, type Group, type InventoryLevel, type InventoryMovement, type Order, type Payment, type Product, type Wish } from './types';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Offset Reporting API Client
 */
export class OffsetApiClient {
  private authToken: string;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(authToken: string) {
    this.authToken = authToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      'X-Auth-Token': this.authToken,
      ...options.headers,
    };

    try {
      const response = await proxyRequest(endpoint, {
        ...options,
        headers
      });

      // Handle empty responses
      if (!response) {
        throw new ApiError('Empty response from server', 0, 'Empty Response');
      }

      // Handle empty object responses
      if (typeof response === 'object' && Object.keys(response).length === 0) {
        throw new ApiError('Empty data received from server', 0, 'Empty Data');
      }

      return response as T;
    } catch (error) {
      // Handle network errors with retry
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          const delay = Math.min(1000 * Math.pow(2, this.retryCount), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.request<T>(endpoint, options);
        }
      }

      // Reset retry count
      this.retryCount = 0;

      // Re-throw the error
      throw error;
    }
  }

  // Addresses
  async getAddress(id: string): Promise<Address> {
    return this.request<Address>(`/addresses/${id}`);
  }

  async getAddresses(limit: number, page: number): Promise<Record<string, Address>> {
    return this.request<Record<string, Address>>(`/addresses/${limit}/${page}`);
  }

  // Categories
  async getCategory(id: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async getCategoryProducts(id: string): Promise<Product[]> {
    return this.request<Product[]>(`/categories/${id}/products`);
  }

  // Club Members
  async getClubMembers(): Promise<ClubMember[]> {
    return this.request<ClubMember[]>('/club-members');
  }

  async getClubMember(id: string): Promise<ClubMember[]> {
    return this.request<ClubMember[]>(`/club-members/${id}`);
  }

  // Clubs
  async getClub(id: string): Promise<Club> {
    return this.request<Club>(`/clubs/${id}`);
  }

  async getClubs(): Promise<Record<string, Club>> {
    return this.request<Record<string, Club>>('/clubs');
  }

  // Customers
  async getCustomer(id: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`);
  }

  async getCustomersByLastUpdate(start: number, end: number, limit: number, page: number): Promise<Record<string, Customer>> {
    return this.request<Record<string, Customer>>(`/customers/last-update/${start}/${end}/${limit}/${page}`);
  }

  async getCustomersBySignup(start: string, end: string, limit: number, page: number): Promise<Record<string, Customer>> {
    return this.request<Record<string, Customer>>(`/customers/created/${start}/${end}/${limit}/${page}`);
  }

  async getCustomersInGroup(groupId: string): Promise<Record<string, Customer>> {
    return this.request<Record<string, Customer>>(`/customers/groups/${groupId}`);
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    return this.request<Group[]>('/groups');
  }

  async getGroup(id: string): Promise<Group[]> {
    return this.request<Group[]>(`/groups/${id}`);
  }

  // Inventory
  async getInventoryLevels(): Promise<Record<string, InventoryLevel>> {
    return this.request<Record<string, InventoryLevel>>('/inventory');
  }

  async getInventoryMovements(start: string, end: string): Promise<InventoryMovement[]> {
    return this.request<InventoryMovement[]>(`/inventory/transactions/${start}/${end}`);
  }

  async getUnshippedInventory(): Promise<Record<string, InventoryLevel>> {
    return this.request<Record<string, InventoryLevel>>('/inventory/allocated');
  }

  // Orders
  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async getOrderPackages(id: string): Promise<any[]> {
    return this.request<any[]>(`/orders/${id}/packages`);
  }

  async getOrdersByCreation(start: string, end: string): Promise<Record<string, Order>> {
    return this.request<Record<string, Order>>(`/orders/created/${start}/${end}`);
  }

  async getOrdersByLastUpdate(start: number, end: number, limit: number, page: number): Promise<Record<string, Order>> {
    return this.request<Record<string, Order>>(`/orders/last-update/${start}/${end}/${limit}/${page}`);
  }

  async getOrdersByType(orderType: string, start: string, end: string): Promise<Record<string, Order>> {
    return this.request<Record<string, Order>>(`/orders/type/${orderType}/${start}/${end}`);
  }

  // Order Accounting
  async getOrdersForAccounting(start: string, end: string): Promise<Record<string, Order>> {
    return this.request<Record<string, Order>>(`/orders/nav/${start}/${end}`);
  }

  // Order Inventory
  async getProductTransactions(start: string, end: string): Promise<Record<string, Order>> {
    return this.request<Record<string, Order>>(`/orders/product-transactions/${start}/${end}`);
  }

  // Order Payments
  async getPaymentTransactions(start: string, end: string): Promise<Payment[]> {
    return this.request<Payment[]>(`/orders/payment-transactions/${start}/${end}`);
  }

  // Products
  async getProduct(sku: string): Promise<Product> {
    return this.request<Product>(`/products/${sku}`);
  }

  async getArchivedProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products/archived');
  }

  async getAvailableProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  // Wishes
  async getActiveWishes(): Promise<Record<string, Wish>> {
    return this.request<Record<string, Wish>>('/wishes');
  }
}

// Export a function to create new client instances
export function createApiClient(authToken: string): OffsetApiClient {
  return new OffsetApiClient(authToken);
}