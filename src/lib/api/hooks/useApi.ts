import { useState, useCallback, useRef, useEffect } from 'react';
import { OffsetApiClient, createApiClient, ApiError } from '../client';
import { useApiSettings } from '@/lib/settings/useApiSettings';

interface ApiErrorState {
  message: string;
  status?: number;
  statusText?: string;
  details?: any;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook for making API requests using the Offset Reporting API client
 */
export function useApi() {
  const { settings } = useApiSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());
  const requestInProgressRef = useRef<Map<string, Promise<any>>>(new Map());

  // Create API client instance with the token from settings
  const client = createApiClient(settings.reportingApiKey || '');

  // Cleanup function to abort pending requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Clear the cache entry for a specific key
   */
  const invalidateCache = useCallback((cacheKey: string) => {
    cacheRef.current.delete(cacheKey);
  }, []);

  /**
   * Clear all cache entries
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * Generic request wrapper that handles loading and error states
   */
  const request = useCallback(async <T>(
    apiCall: (client: OffsetApiClient) => Promise<T>,
    options: {
      cacheKey?: string;
      cacheDuration?: number;
      forceRefresh?: boolean;
    } = {}
  ): Promise<T | null> => {
    const { cacheKey, cacheDuration = CACHE_DURATION, forceRefresh = false } = options;

    // Check cache if cacheKey is provided and not forcing refresh
    if (cacheKey && !forceRefresh) {
      const cached = cacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        return cached.data;
      }
      
      // If there's already a request in progress for this cache key, return that promise
      if (requestInProgressRef.current.has(cacheKey)) {
        return requestInProgressRef.current.get(cacheKey);
      }
    }

    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    // Create the promise for this request
    const requestPromise = (async () => {
      try {
        // Validate API token
        if (!settings.reportingApiKey) {
          throw new Error('API token is missing. Please configure it in the API Settings.');
        }

        const result = await apiCall(client);

        // Handle empty or invalid responses
        if (!result) {
          throw new ApiError('No data received from server', 0, 'Empty Response');
        }

        if (typeof result === 'object' && Object.keys(result).length === 0) {
          throw new ApiError('Empty data received from server', 0, 'Empty Data');
        }

        // Cache the result if cacheKey is provided
        if (cacheKey) {
          cacheRef.current.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
        }

        return result;
      } catch (err) {
        console.error('API Error:', err);
        
        if (err instanceof ApiError) {
          setError({
            message: err.message,
            status: err.status,
            statusText: err.statusText,
            details: err.data
          });
        } else if (err instanceof Error) {
          setError({
            message: err.message,
            details: err
          });
        } else {
          setError({
            message: 'An unknown error occurred',
            details: err
          });
        }
        return null;
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
        
        // Remove this request from the in-progress map
        if (cacheKey) {
          requestInProgressRef.current.delete(cacheKey);
        }
      }
    })();

    // Store the promise in the in-progress map if we have a cache key
    if (cacheKey) {
      requestInProgressRef.current.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }, [client, settings.reportingApiKey]);

  /**
   * Clear any existing error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    client,
    loading,
    error,
    request,
    clearError,
    invalidateCache,
    clearCache
  };
}