import { ApiError } from './client';

const API_BASE_URL = 'https://api.securecheckout.com/v1/reporting';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

/**
 * Proxy service for making API requests
 */
export async function proxyRequest(path: string, options: RequestInit = {}): Promise<any> {
  try {
    // Add leading slash if missing
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Prepend the CORS proxy URL
    const proxyUrl = `${CORS_PROXY}${API_BASE_URL}${normalizedPath}`;
    
    // Add retry logic for network errors
    const MAX_RETRIES = 3;
    let lastError;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Add exponential backoff for retries
        if (attempt > 0) {
          const backoffTime = Math.min(100 * Math.pow(2, attempt), 3000); // Max 3 seconds
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
        
        const response = await fetch(proxyUrl, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest', // Required by cors-anywhere
            'Origin': window.location.origin,
            'X-Auth-Token': options.headers?.['X-Auth-Token'], // Preserve auth token
            ...options.headers,
          },
          mode: 'cors',
          credentials: 'omit'
        });

        // Handle CORS proxy errors
        if (response.status === 403) {
          const text = await response.text();
          if (text.includes('cors-anywhere')) {
            throw new ApiError(
              'CORS proxy access not enabled. Please visit https://cors-anywhere.herokuapp.com/corsdemo to enable temporary access.',
              403,
              'Forbidden'
            );
          }
        }

        // Handle rate limiting with exponential backoff
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10);
          const waitTime = retryAfter * 1000 || Math.min(1000 * Math.pow(2, attempt), 10000);
          
          console.log(`Rate limited. Retrying after ${waitTime}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue; // Retry the request
        }

        // Handle API errors
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorMessage = response.statusText;

          if (contentType?.includes('application/json')) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.error?.message || errorData.message || errorMessage;
            } catch {
              // If JSON parsing fails, use the status text
            }
          }

          throw new ApiError(
            `API request failed: ${errorMessage}`,
            response.status,
            response.statusText
          );
        }

        // Handle successful response
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          
          if (data.error) {
            throw new ApiError(
              data.error.message || 'API Error',
              data.error.code || response.status
            );
          }
          
          return data;
        }
        
        // Return null for non-JSON responses
        return null;
      } catch (error) {
        lastError = error;
        
        // Only retry on network errors or rate limiting
        if (
          (error instanceof TypeError && error.message === 'Failed to fetch') ||
          (error instanceof ApiError && error.status === 429)
        ) {
          continue;
        }
        
        throw error;
      }
    }
    
    // If we've exhausted all retries
    throw lastError;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError(
        'Network error - unable to reach API. Please check your internet connection and try again.',
        0,
        'Network Error'
      );
    }
    
    // Re-throw ApiErrors
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle unknown errors
    throw new ApiError(
      error instanceof Error ? error.message : 'An unknown error occurred',
      500,
      'Internal Error'
    );
  }
}