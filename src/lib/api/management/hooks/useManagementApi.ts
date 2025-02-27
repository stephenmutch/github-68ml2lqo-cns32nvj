import { useState, useCallback, useEffect } from 'react';
import { OffsetManagementClient, createManagementClient } from '../client';
import { ApiError } from '../../client';
import { useApiSettings } from '@/lib/settings/useApiSettings';

interface UseManagementApiOptions {
  baseUrl?: string;
}

interface ManagementApiError {
  message: string;
  status?: number;
  statusText?: string;
  details?: any;
}

export function useManagementApi(options: UseManagementApiOptions = {}) {
  const { settings } = useApiSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ManagementApiError | null>(null);

  // Create API client instance
  const client = createManagementClient(options.baseUrl);

  // Set auth token from settings if available
  useEffect(() => {
    if (settings.managementAuthToken) {
      console.log('Setting auth token from settings:', settings.managementAuthToken.substring(0, 10) + '...');
      client.setAuthToken(settings.managementAuthToken);
    }
  }, [client, settings.managementAuthToken]);

  /**
   * Generic request wrapper that handles loading and error states
   */
  const request = useCallback(async <T>(
    apiCall: (client: OffsetManagementClient) => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(client);
      return result;
    } catch (err) {
      console.error('Management API Error:', err);
      
      if (err instanceof ApiError) {
        setError({
          message: err.message,
          status: err.status,
          statusText: err.statusText,
          details: err
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
      throw err; // Re-throw to allow component to handle error
    } finally {
      setLoading(false);
    }
  }, [client]);

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
    clearError
  };
}