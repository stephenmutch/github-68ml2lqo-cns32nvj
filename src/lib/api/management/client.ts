import { ApiError } from '../client';
import type { 
  Address,
  AuthResponse,
  AuthTokenResponse,
  Customer,
  Group,
  Order,
  PaymentMethod,
  Tag
} from './types';

const API_BASE_URL = 'https://api.securecheckout.com/v1';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

/**
 * Offset Management API Client
 */
export class OffsetManagementClient {
  private authToken: string | null = null;

  constructor(private baseUrl: string = API_BASE_URL) {}

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Add leading slash if missing
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Prepend the CORS proxy URL
    const url = `${CORS_PROXY}${this.baseUrl}${normalizedEndpoint}`;
    
    // Create headers with auth token if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // Required by cors-anywhere
      'Origin': window.location.origin,
      ...options.headers,
    };

    // Add auth token to headers if available
    if (this.authToken) {
      headers['Authorization'] = this.authToken;
      headers['X-Auth-Token'] = this.authToken; // Add X-Auth-Token header
    }

    // Log request details
    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers: { 
        ...headers, 
        Authorization: this.authToken ? '(token present)' : '(no token)',
        'X-Auth-Token': this.authToken ? '(token present)' : '(no token)'
      },
      body: options.body ? JSON.parse(options.body as string) : null
    });

    try {
      console.log(`Making request to ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'omit'
      });

      // Log response status
      console.log('API Response Status:', {
        status: response.status,
        statusText: response.statusText
      });

      // Handle CORS proxy errors
      if (response.status === 403) {
        const text = await response.text();
        console.log('403 Response Text:', text);
        if (text.includes('cors-anywhere')) {
          throw new ApiError(
            'CORS proxy access not enabled. Please visit https://cors-anywhere.herokuapp.com/corsdemo to enable temporary access.',
            403,
            'Forbidden'
          );
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        throw new ApiError(
          `API request failed: ${response.statusText}`,
          response.status,
          response.statusText
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        console.log('API Response Data:', data);
        
        if (data.error) {
          throw new ApiError(
            data.error.message || 'API Error',
            data.error.code || response.status
          );
        }
        return data;
      }

      // Log non-JSON response
      const textResponse = await response.text();
      console.log('API Non-JSON Response:', textResponse);
      
      return null as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiError(
          'Network error - unable to reach API. Please check your internet connection and try again.',
          0,
          'Network Error'
        );
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }

  // Authentication
  async authenticate(username: string, password: string, account?: string): Promise<AuthResponse> {
    console.log('Authenticating user:', username, 'with account:', account || 'none');
    return this.request<AuthResponse>('/account/authenticate', {
      method: 'POST',
      body: JSON.stringify({ username, password, account }),
    });
  }

  async authenticate2FA(ticket: string, pin: string): Promise<AuthResponse> {
    console.log('Authenticating 2FA with ticket:', ticket);
    return this.request<AuthResponse>('/account/authenticate/2fa', {
      method: 'POST',
      body: JSON.stringify({ ticket, pin }),
    });
  }

  async getAuthToken(ticket: string, accountValue: string): Promise<AuthTokenResponse> {
    // Use the account value directly for the API call
    console.log('Getting auth token for account value:', accountValue, 'with ticket:', ticket);
    
    const response = await this.request<AuthTokenResponse>('/account/authorize', {
      method: 'POST',
      body: JSON.stringify({ 
        ticket, 
        account: accountValue 
      }),
    });

    if (response.token) {
      console.log('Auth token received, length:', response.token.length);
      this.authToken = response.token;
    } else {
      console.log('No auth token received in response');
    }

    return response;
  }

  setAuthToken(token: string) {
    console.log('Setting auth token manually, length:', token.length);
    this.authToken = token;
  }

  clearAuthToken() {
    console.log('Clearing auth token');
    this.authToken = null;
  }

  // Addresses
  async createAddress(data: Partial<Address>): Promise<Address> {
    return this.request<Address>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAddress(id: string): Promise<Address> {
    return this.request<Address>(`/addresses/${id}`);
  }

  async getAddresses(limit: number, page: number): Promise<Record<string, Address>> {
    return this.request<Record<string, Address>>(`/addresses/${limit}/${page}`);
  }

  async updateAddress(id: string, data: Partial<Address>): Promise<Address> {
    return this.request<Address>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string): Promise<boolean> {
    return this.request<boolean>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async getCustomerAddresses(customerId: string): Promise<Record<string, Address>> {
    return this.request<Record<string, Address>>(`/addresses/customer/${customerId}`);
  }

  async getCustomerDefaultAddress(customerId: string): Promise<Address> {
    return this.request<Address>(`/addresses/customer/${customerId}/default`);
  }

  async setCustomerDefaultAddress(customerId: string, addressId: string): Promise<boolean> {
    return this.request<boolean>(`/addresses/customer/${customerId}/default/${addressId}`, {
      method: 'PUT',
    });
  }

  // Customers
  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCustomer(id: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.request<boolean>(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  async searchCustomers(query: string): Promise<Record<string, Customer>> {
    return this.request<Record<string, Customer>>(`/customers/search/${query}`);
  }

  async filterCustomers(filters: any[]): Promise<Record<string, Customer>> {
    return this.request<Record<string, Customer>>('/customers/filter', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // Customer Tags
  async getCustomerTags(): Promise<Record<string, Tag>> {
    return this.request<Record<string, Tag>>('/customers/tags');
  }

  // Customer Groups
  async addCustomerToGroup(customerId: string, groupId: string): Promise<boolean> {
    return this.request<boolean>(`/customers/${customerId}/groups/${groupId}`, {
      method: 'PUT',
    });
  }

  async removeCustomerFromGroup(customerId: string, groupId: string): Promise<boolean> {
    return this.request<boolean>(`/customers/${customerId}/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  async getCustomerGroups(customerId: string): Promise<Record<string, Group>> {
    return this.request<Record<string, Group>>(`/customers/${customerId}/groups`);
  }

  async clearCustomerGroups(customerId: string): Promise<boolean> {
    return this.request<boolean>(`/customers/${customerId}/groups`, {
      method: 'DELETE',
    });
  }

  // Groups
  async createGroup(data: Partial<Group>): Promise<Group> {
    return this.request<Group>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGroup(id: string): Promise<Group> {
    return this.request<Group>(`/groups/${id}`);
  }

  async getAllGroups(): Promise<Record<string, Group>> {
    return this.request<Record<string, Group>>('/groups');
  }

  async updateGroup(id: string, data: Partial<Group>): Promise<Group> {
    return this.request<Group>(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(id: string): Promise<boolean> {
    return this.request<boolean>(`/groups/${id}`, {
      method: 'DELETE',
    });
  }

  async getGroupCustomers(id: string): Promise<Record<string, Customer>> {
    return this.request<Record<string, Customer>>(`/groups/${id}/customers`);
  }

  // Orders
  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async searchOrders(query: string): Promise<Record<string, Order>> {
    return this.request<Record<string, Order>>(`/orders/search/${query}`);
  }

  async filterOrders(filters: any[]): Promise<Record<string, Order>> {
    return this.request<Record<string, Order>>('/orders/filter', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<boolean> {
    return this.request<boolean>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelOrder(id: string): Promise<boolean> {
    return this.request<boolean>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Payment Methods
  async createPaymentMethod(data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    return this.request<PaymentMethod>('/payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod> {
    return this.request<PaymentMethod>(`/payment/${id}`);
  }

  async getAllPaymentMethods(): Promise<Record<string, PaymentMethod>> {
    return this.request<Record<string, PaymentMethod>>('/payment');
  }

  async updatePaymentMethod(id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    return this.request<PaymentMethod>(`/payment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    return this.request<boolean>(`/payment/${id}`, {
      method: 'DELETE',
    });
  }

  async getCustomerPaymentMethods(customerId: string): Promise<Record<string, PaymentMethod>> {
    return this.request<Record<string, PaymentMethod>>(`/payment/customer/${customerId}`);
  }

  async getCustomerDefaultPaymentMethod(customerId: string): Promise<PaymentMethod> {
    return this.request<PaymentMethod>(`/payment/customer/${customerId}/default`);
  }

  async setCustomerDefaultPaymentMethod(customerId: string, paymentId: string): Promise<boolean> {
    return this.request<boolean>(`/payment/customer/${customerId}/default/${paymentId}`, {
      method: 'PUT',
    });
  }
}

// Export a function to create new client instances
export function createManagementClient(baseUrl?: string): OffsetManagementClient {
  return new OffsetManagementClient(baseUrl);
}