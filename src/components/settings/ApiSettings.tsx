import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useManagementApi } from '@/lib/api/management/hooks';
import { useApiSettings } from '@/lib/settings/useApiSettings';
import { Loader2, Check, AlertCircle, Key, User, Building, Search, Copy, RefreshCw } from 'lucide-react';
import { Account } from '@/lib/api/management/types';

export function ApiSettings() {
  const { settings, updateSettings, saveSettings } = useApiSettings();
  const { request, loading, error, client } = useManagementApi();
  
  const [reportingApiKey, setReportingApiKey] = useState(settings.reportingApiKey || '');
  const [managementUsername, setManagementUsername] = useState(settings.managementUsername || '');
  const [managementPassword, setManagementPassword] = useState('');
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [authMessage, setAuthMessage] = useState('');
  const [accounts, setAccounts] = useState<Record<string, Account>>({});
  const [selectedAccount, setSelectedAccount] = useState(settings.managementAccount || '');
  const [authToken, setAuthToken] = useState(settings.managementAuthToken || '');
  const [ticket, setTicket] = useState('');
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Sort and filter accounts
  const sortedAndFilteredAccounts = useMemo(() => {
    return Object.entries(accounts)
      .filter(([_, account]) => {
        const searchTerm = accountSearchTerm.toLowerCase();
        return (
          account.name.toLowerCase().includes(searchTerm) ||
          account.account.toLowerCase().includes(searchTerm)
        );
      })
      .sort((a, b) => {
        // Sort by name
        return a[1].name.localeCompare(b[1].name);
      });
  }, [accounts, accountSearchTerm]);

  useEffect(() => {
    // If we have a token, update the client
    if (settings.managementAuthToken) {
      client.setAuthToken(settings.managementAuthToken);
    }
  }, [settings.managementAuthToken, client]);

  const handleSaveReportingApi = () => {
    updateSettings({ reportingApiKey });
    saveSettings();
  };

  const handleAuthenticate = async () => {
    try {
      setAuthStatus('loading');
      setAuthMessage('Authenticating...');
      
      console.log('Starting authentication process with username:', managementUsername);
      
      const response = await request(client => 
        client.authenticate(managementUsername, managementPassword)
      );
      
      console.log('Authentication response:', response);
      
      if (response?.ticket && response?.accounts) {
        setTicket(response.ticket);
        setAccounts(response.accounts);
        setAuthStatus('success');
        setAuthMessage('Authentication successful! Please select an account.');
        
        // Save username to settings
        updateSettings({ managementUsername });
      } else {
        setAuthStatus('error');
        setAuthMessage('Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setAuthStatus('error');
      setAuthMessage(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleSelectAccount = async () => {
    if (!ticket || !selectedAccount) {
      setAuthStatus('error');
      setAuthMessage('Please authenticate and select an account first');
      return;
    }

    try {
      setAuthStatus('loading');
      setAuthMessage('Getting auth token...');
      
      // Get the account object for the selected account ID
      const selectedAccountObj = accounts[selectedAccount];
      console.log('Selected account:', selectedAccountObj);
      
      if (!selectedAccountObj) {
        throw new Error('Selected account not found');
      }
      
      // Use the account value from the account object for the API call
      console.log('Getting auth token for account:', selectedAccountObj.account, 'with ticket:', ticket);
      
      const response = await request(client => 
        client.getAuthToken(ticket, selectedAccountObj.account)
      );
      
      console.log('Auth token response:', response);
      
      if (response?.token) {
        setAuthToken(response.token);
        setAuthStatus('success');
        setAuthMessage('Authentication token received successfully!');
        
        // Save account and token to settings
        updateSettings({ 
          managementAccount: selectedAccount,
          managementAuthToken: response.token,
          managementAccountName: selectedAccountObj.name
        });
        saveSettings();
      } else {
        setAuthStatus('error');
        setAuthMessage('Failed to get authentication token');
      }
    } catch (err) {
      console.error('Get auth token error:', err);
      setAuthStatus('error');
      setAuthMessage(err instanceof Error ? err.message : 'Failed to get authentication token');
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(authToken);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      
      // Try to get all groups as a simple test
      console.log('Testing connection with current auth token...');
      
      const result = await request(client => client.getAllGroups());
      
      console.log('Test connection result:', result);
      
      if (result) {
        setAuthStatus('success');
        setAuthMessage('Connection test successful! API is working correctly.');
      } else {
        setAuthStatus('error');
        setAuthMessage('Connection test failed. No data returned.');
      }
    } catch (err) {
      console.error('Test connection error:', err);
      setAuthStatus('error');
      setAuthMessage(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">API Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure API credentials for Offset Reporting and Management APIs
        </p>
      </div>

      <Tabs defaultValue="reporting">
        <TabsList>
          <TabsTrigger value="reporting">Reporting API</TabsTrigger>
          <TabsTrigger value="management">Management API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reporting" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Key className="h-5 w-5 mt-0.5 text-blue-600" />
              <div>
                <h3 className="text-lg font-medium">Reporting API Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your Offset Reporting API credentials
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reportingApiKey">API Key</Label>
              <Input
                id="reportingApiKey"
                value={reportingApiKey}
                onChange={(e) => setReportingApiKey(e.target.value)}
                placeholder="Enter your Reporting API key"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                Your API key is used to authenticate requests to the Offset Reporting API
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveReportingApi}>
                Save API Key
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="management" className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 mt-0.5 text-purple-600" />
              <div>
                <h3 className="text-lg font-medium">Management API Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Authenticate with your Offset account credentials
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="managementUsername">Username</Label>
                <Input
                  id="managementUsername"
                  value={managementUsername}
                  onChange={(e) => setManagementUsername(e.target.value)}
                  placeholder="Enter your Offset username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="managementPassword">Password</Label>
                <Input
                  id="managementPassword"
                  value={managementPassword}
                  onChange={(e) => setManagementPassword(e.target.value)}
                  placeholder="Enter your Offset password"
                  type="password"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleAuthenticate}
                  disabled={loading || !managementUsername || !managementPassword}
                >
                  {loading && authStatus === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : 'Authenticate'}
                </Button>
              </div>
            </div>

            {authStatus !== 'idle' && (
              <div className={`p-4 rounded-lg ${
                authStatus === 'success' ? 'bg-green-50 text-green-800' :
                authStatus === 'error' ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
              }`}>
                <div className="flex items-center gap-2">
                  {authStatus === 'success' ? (
                    <Check className="h-5 w-5" />
                  ) : authStatus === 'error' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                  <span>{authMessage}</span>
                </div>
              </div>
            )}

            {Object.keys(accounts).length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-start gap-2">
                  <Building className="h-5 w-5 mt-0.5 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-medium">Select Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose the account you want to use with the Management API
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountSearch">Search Accounts</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="accountSearch"
                      placeholder="Search by name or account ID..."
                      value={accountSearchTerm}
                      onChange={(e) => setAccountSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Select 
                    value={selectedAccount} 
                    onValueChange={setSelectedAccount}
                  >
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {sortedAndFilteredAccounts.map(([id, account]) => (
                        <SelectItem key={id} value={id}>
                          {account.name} ({account.account})
                        </SelectItem>
                      ))}
                      {sortedAndFilteredAccounts.length === 0 && (
                        <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                          No accounts found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {Object.keys(accounts).length} accounts available
                    {accountSearchTerm && ` • ${sortedAndFilteredAccounts.length} matches`}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSelectAccount}
                    disabled={loading || !selectedAccount}
                  >
                    {loading && authStatus === 'loading' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Getting token...
                      </>
                    ) : 'Get Auth Token'}
                  </Button>
                </div>
              </div>
            )}

            {authToken && (
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="authToken">Authentication Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="authToken"
                    value={authToken}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleCopyToken}
                  >
                    {copySuccess ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This token will be used for all Management API requests
                </p>
              </div>
            )}

            {settings.managementAccountName && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Current Account:</span> {settings.managementAccountName}
                </p>
                {settings.managementAuthToken && (
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm">
                      <span className="font-medium">Auth Status:</span> Authenticated
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                    >
                      {testingConnection ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}