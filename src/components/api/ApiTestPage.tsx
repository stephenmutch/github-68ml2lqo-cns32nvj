import React, { useState, useEffect } from 'react';
import { useApi } from '@/lib/api/hooks';
import { useManagementApi } from '@/lib/api/management/hooks';
import { useApiSettings } from '@/lib/settings/useApiSettings';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Endpoint {
  id: string; // Unique identifier for each endpoint
  name: string;
  path: string;
  method: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  api: 'reporting' | 'management';
  requiresAuth?: boolean;
}

const ENDPOINTS: Endpoint[] = [
  // Reporting API Endpoints
  {
    id: 'reporting-groups-all',
    name: 'Get All Groups',
    path: '/groups',
    method: 'GET',
    description: 'Get a list of all available groups',
    parameters: [],
    api: 'reporting'
  },
  {
    id: 'reporting-group-get',
    name: 'Get Group',
    path: '/groups/{id}',
    method: 'GET',
    description: 'Get details for a specific group',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Group ID'
      }
    ],
    api: 'reporting'
  },
  {
    id: 'reporting-clubs-all',
    name: 'Get All Clubs',
    path: '/clubs',
    method: 'GET',
    description: 'Get a list of all available clubs',
    parameters: [],
    api: 'reporting'
  },
  {
    id: 'reporting-club-get',
    name: 'Get Club',
    path: '/clubs/{id}',
    method: 'GET',
    description: 'Get details for a specific club',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Club ID'
      }
    ],
    api: 'reporting'
  },
  {
    id: 'reporting-customer-get',
    name: 'Get Customer',
    path: '/customers/{id}',
    method: 'GET',
    description: 'Get details for a specific customer',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Customer ID'
      }
    ],
    api: 'reporting'
  },
  {
    id: 'reporting-customers-signup',
    name: 'Get Customers by Signup Date',
    path: '/customers/created/{start}/{end}/{limit}/{page}',
    method: 'GET',
    description: 'Get customers filtered by signup date',
    parameters: [
      {
        name: 'start',
        type: 'string',
        required: true,
        description: 'Start date (YYYY-MM-DD)'
      },
      {
        name: 'end',
        type: 'string',
        required: true,
        description: 'End date (YYYY-MM-DD)'
      },
      {
        name: 'limit',
        type: 'number',
        required: true,
        description: 'Number of records per page'
      },
      {
        name: 'page',
        type: 'number',
        required: true,
        description: 'Page number'
      }
    ],
    api: 'reporting'
  },
  {
    id: 'reporting-products-all',
    name: 'Get All Products',
    path: '/products',
    method: 'GET',
    description: 'Get a list of all available products',
    parameters: [],
    api: 'reporting'
  },
  // Management API Endpoints
  {
    id: 'management-auth-user',
    name: 'Authenticate User',
    path: '/account/authenticate',
    method: 'POST',
    description: 'Authenticate a user with username and password',
    parameters: [
      {
        name: 'username',
        type: 'string',
        required: true,
        description: 'User email address'
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        description: 'User password'
      },
      {
        name: 'account',
        type: 'string',
        required: false,
        description: 'Optional account name'
      }
    ],
    api: 'management',
    requiresAuth: false
  },
  {
    id: 'management-auth-2fa',
    name: 'Authenticate 2FA',
    path: '/account/authenticate/2fa',
    method: 'POST',
    description: 'Complete two-factor authentication',
    parameters: [
      {
        name: 'ticket',
        type: 'string',
        required: true,
        description: 'Authentication ticket'
      },
      {
        name: 'pin',
        type: 'string',
        required: true,
        description: '2FA code'
      }
    ],
    api: 'management',
    requiresAuth: false
  },
  {
    id: 'management-auth-token',
    name: 'Get Auth Token',
    path: '/account/authorize',
    method: 'POST',
    description: 'Get an authentication token for an account',
    parameters: [
      {
        name: 'ticket',
        type: 'string',
        required: true,
        description: 'Authentication ticket'
      },
      {
        name: 'account',
        type: 'string',
        required: true,
        description: 'Account name'
      }
    ],
    api: 'management',
    requiresAuth: false
  },
  // Customer Tags Endpoint
  {
    id: 'management-customer-tags',
    name: 'Get Customer Tags',
    path: '/customers/tags',
    method: 'GET',
    description: 'Get all customer tags',
    parameters: [],
    api: 'management',
    requiresAuth: true
  },
  // Address Endpoints
  {
    id: 'management-address-create',
    name: 'Create Address',
    path: '/addresses',
    method: 'POST',
    description: 'Create a new address',
    parameters: [
      {
        name: 'address',
        type: 'string',
        required: true,
        description: 'Street address'
      },
      {
        name: 'city',
        type: 'string', 
        required: true,
        description: 'City'
      },
      {
        name: 'state',
        type: 'string',
        required: true, 
        description: 'State'
      },
      {
        name: 'zip',
        type: 'string',
        required: true,
        description: 'Zip code'
      },
      {
        name: 'customer_id',
        type: 'string',
        required: true,
        description: 'Customer ID'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  {
    id: 'management-address-get',
    name: 'Get Address',
    path: '/addresses/{id}',
    method: 'GET',
    description: 'Get address details',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Address ID'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  {
    id: 'management-address-update',
    name: 'Update Address',
    path: '/addresses/{id}',
    method: 'PUT',
    description: 'Update an existing address',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Address ID'
      },
      {
        name: 'address',
        type: 'string',
        required: false,
        description: 'Street address'
      },
      {
        name: 'city',
        type: 'string',
        required: false,
        description: 'City'
      },
      {
        name: 'state',
        type: 'string',
        required: false,
        description: 'State'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  // Customer Endpoints
  {
    id: 'management-customer-create',
    name: 'Create Customer',
    path: '/customers',
    method: 'POST',
    description: 'Create a new customer',
    parameters: [
      {
        name: 'email',
        type: 'string',
        required: true,
        description: 'Customer email'
      },
      {
        name: 'first_name',
        type: 'string',
        required: true,
        description: 'First name'
      },
      {
        name: 'last_name',
        type: 'string',
        required: true,
        description: 'Last name'
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        description: 'Customer password'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  {
    id: 'management-customer-get',
    name: 'Get Customer',
    path: '/customers/{id}',
    method: 'GET',
    description: 'Get customer details',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Customer ID'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  {
    id: 'management-customer-search',
    name: 'Search Customers',
    path: '/customers/search/{query}',
    method: 'GET',
    description: 'Search for customers',
    parameters: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Search query'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  // Group Endpoints
  {
    id: 'management-group-create',
    name: 'Create Group',
    path: '/groups',
    method: 'POST',
    description: 'Create a new customer group',
    parameters: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Group name'
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Group description'
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Group status'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  {
    id: 'management-group-get',
    name: 'Get Group',
    path: '/groups/{id}',
    method: 'GET',
    description: 'Get group details',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Group ID'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  {
    id: 'management-groups-all',
    name: 'Get All Groups',
    path: '/groups',
    method: 'GET',
    description: 'Get all customer groups',
    parameters: [],
    api: 'management',
    requiresAuth: true
  },
  // Order Endpoints
  {
    id: 'management-order-get',
    name: 'Get Order',
    path: '/orders/{id}',
    method: 'GET',
    description: 'Get order details',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Order ID'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  {
    id: 'management-order-search',
    name: 'Search Orders',
    path: '/orders/search/{query}',
    method: 'GET',
    description: 'Search for orders',
    parameters: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Search query'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  {
    id: 'management-order-cancel',
    name: 'Cancel Order',
    path: '/orders/{id}',
    method: 'DELETE',
    description: 'Cancel an order',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Order ID'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  // Payment Method Endpoints
  {
    id: 'management-payment-create',
    name: 'Create Payment Method',
    path: '/payment',
    method: 'POST',
    description: 'Create a new payment method',
    parameters: [
      {
        name: 'customer_id',
        type: 'string',
        required: true,
        description: 'Customer ID'
      },
      {
        name: 'card_token',
        type: 'string',
        required: true,
        description: 'Stripe card token'
      },
      {
        name: 'card_type',
        type: 'string',
        required: true,
        description: 'Card type (e.g., Visa)'
      },
      {
        name: 'credit_number',
        type: 'string',
        required: true,
        description: 'Last 4 digits'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  {
    id: 'management-payment-get',
    name: 'Get Payment Method',
    path: '/payment/{id}',
    method: 'GET',
    description: 'Get payment method details',
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Payment method ID'
      }
    ],
    api: 'management',
    requiresAuth: true
  },
  {
    id: 'management-payment-customer',
    name: 'Get Customer Payment Methods',
    path: '/payment/customer/{customer_id}',
    method: 'GET',
    description: 'Get all payment methods for a customer',
    parameters: [
      {
        name: 'customer_id',
        type: 'string',
        required: true,
        description: 'Customer ID'
      }
    ],
    api: 'management',
    requiresAuth: true
  }
];

export function ApiTestPage() {
  const { request: reportingRequest, loading: reportingLoading } = useApi();
  const { request: managementRequest, loading: managementLoading, client: managementClient } = useManagementApi();
  const { settings } = useApiSettings();
  
  const [selectedApi, setSelectedApi] = useState<'reporting' | 'management'>('reporting');
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string>('');

  // Initialize auth token from settings
  useEffect(() => {
    if (settings.managementAuthToken) {
      setAuthToken(settings.managementAuthToken);
    }
  }, [settings.managementAuthToken]);

  const filteredEndpoints = ENDPOINTS.filter(e => e.api === selectedApi);

  const handleEndpointChange = (value: string) => {
    const endpoint = ENDPOINTS.find(e => e.id === value);
    setSelectedEndpoint(endpoint || null);
    setParamValues({});
    setResponse(null);
    setError(null);
  };

  const handleParamChange = (name: string, value: string) => {
    setParamValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTest = async () => {
    if (!selectedEndpoint) return;

    try {
      setError(null);
      setResponse(null);

      // Validate required parameters
      const missingParams = selectedEndpoint.parameters
        .filter(p => p.required && !paramValues[p.name]);

      if (missingParams.length > 0) {
        setError(`Missing required parameters: ${missingParams.map(p => p.name).join(', ')}`);
        return;
      }

      // Check if auth token is required but not provided
      if (selectedEndpoint.api === 'management' && 
          selectedEndpoint.requiresAuth === true && 
          !authToken) {
        setError('Authentication token is required for this endpoint. Please authenticate first and set the token.');
        return;
      }

      // Set auth token if provided
      if (selectedEndpoint.api === 'management' && authToken) {
        console.log('Setting auth token for request:', authToken.substring(0, 10) + '...');
        managementClient.setAuthToken(authToken);
      }

      // Build the path with parameters
      let path = selectedEndpoint.path;
      selectedEndpoint.parameters.forEach(param => {
        path = path.replace(`{${param.name}}`, paramValues[param.name] || '');
      });

      // Make the request based on selected API
      if (selectedApi === 'reporting') {
        const result = await reportingRequest(async (client) => {
          switch (selectedEndpoint.id) {
            case 'reporting-groups-all':
              return client.getGroups();
            case 'reporting-group-get':
              return client.getGroup(paramValues.id);
            case 'reporting-clubs-all':
              return client.getClubs();
            case 'reporting-club-get':
              return client.getClub(paramValues.id);
            case 'reporting-customer-get':
              return client.getCustomer(paramValues.id);
            case 'reporting-customers-signup':
              return client.getCustomersBySignup(
                paramValues.start,
                paramValues.end,
                parseInt(paramValues.limit),
                parseInt(paramValues.page)
              );
            case 'reporting-products-all':
              return client.getAvailableProducts();
            default:
              throw new Error('Unknown endpoint');
          }
        });
        setResponse(result);
      } else {
        const result = await managementRequest(async (client) => {
          switch (selectedEndpoint.id) {
            case 'management-auth-user':
              return client.authenticate(
                paramValues.username,
                paramValues.password,
                paramValues.account
              );
            case 'management-auth-2fa':
              return client.authenticate2FA(
                paramValues.ticket,
                paramValues.pin
              );
            case 'management-auth-token':
              const authResponse = await client.getAuthToken(
                paramValues.ticket,
                paramValues.account
              );
              if (authResponse && authResponse.token) {
                setAuthToken(authResponse.token);
              }
              return authResponse;
            case 'management-customer-tags':
              return client.getCustomerTags();
            case 'management-address-create':
              return client.createAddress(paramValues);
            case 'management-address-get':
              return client.getAddress(paramValues.id);
            case 'management-address-update':
              return client.updateAddress(paramValues.id, paramValues);
            case 'management-customer-create':
              return client.createCustomer(paramValues);
            case 'management-customer-get':
              return client.getCustomer(paramValues.id);
            case 'management-customer-search':
              return client.searchCustomers(paramValues.query);
            case 'management-group-create':
              return client.createGroup(paramValues);
            case 'management-group-get':
              return client.getGroup(paramValues.id);
            case 'management-groups-all':
              return client.getAllGroups();
            case 'management-order-get':
              return client.getOrder(paramValues.id);
            case 'management-order-search':
              return client.searchOrders(paramValues.query);
            case 'management-order-cancel':
              return client.cancelOrder(paramValues.id);
            case 'management-payment-create':
              return client.createPaymentMethod(paramValues);
            case 'management-payment-get':
              return client.getPaymentMethod(paramValues.id);
            case 'management-payment-customer':
              return client.getCustomerPaymentMethods(paramValues.customer_id);
            default:
              throw new Error('Unknown endpoint');
          }
        });
        setResponse(result);
      }
    } catch (err) {
      console.error('API Test Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">API Test Console</h1>
          <p className="mt-2 text-gray-600">
            Test and explore the Offset APIs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Panel */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Select API</Label>
              <RadioGroup
                value={selectedApi}
                onValueChange={(value: 'reporting' | 'management') => {
                  setSelectedApi(value);
                  setSelectedEndpoint(null);
                  setParamValues({});
                  setResponse(null);
                  setError(null);
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reporting" id="reporting" />
                  <Label htmlFor="reporting">Reporting API</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="management" id="management" />
                  <Label htmlFor="management">Management API</Label>
                </div>
              </RadioGroup>
            </div>

            {selectedApi === 'management' && (
              <div className="space-y-2">
                <Label htmlFor="authToken">Auth Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="authToken"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="Enter authentication token"
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAuthToken('');
                      managementClient.clearAuthToken();
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {authToken 
                    ? "Token set. Will be used for authenticated endpoints." 
                    : "No token set. Authenticate first or enter a token manually."}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Label>Select Endpoint</Label>
              <Select
                value={selectedEndpoint?.id}
                onValueChange={handleEndpointChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an endpoint" />
                </SelectTrigger>
                <SelectContent>
                  {filteredEndpoints.map(endpoint => (
                    <SelectItem key={endpoint.id} value={endpoint.id}>
                      {endpoint.name} {endpoint.requiresAuth ? '🔒' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEndpoint && (
              <>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {selectedEndpoint.method}
                    </span>
                    <code className="font-mono text-gray-800">
                      {selectedEndpoint.path}
                    </code>
                    {selectedEndpoint.requiresAuth && (
                      <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        Requires Auth
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedEndpoint.description}
                  </p>
                </div>

                {selectedEndpoint.parameters.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Parameters</h3>
                    <div className="space-y-3">
                      {selectedEndpoint.parameters.map(param => (
                        <div key={param.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {param.name}
                            {param.required && <span className="text-red-500">*</span>}
                          </label>
                          <Input
                            type={param.type === 'number' ? 'number' : 'text'}
                            value={paramValues[param.name] || ''}
                            onChange={(e) => handleParamChange(param.name, e.target.value)}
                            placeholder={param.description}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleTest}
                  disabled={reportingLoading || managementLoading}
                  className="w-full"
                >
                  {(reportingLoading || managementLoading) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Endpoint'
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Response Panel */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Response</h3>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
              {(reportingLoading || managementLoading) ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-red-600 whitespace-pre-wrap">
                  {error}
                </div>
              ) : response ? (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <div className="text-gray-500 text-center">
                  Select an endpoint and click "Test Endpoint" to see the response
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiTestPage;