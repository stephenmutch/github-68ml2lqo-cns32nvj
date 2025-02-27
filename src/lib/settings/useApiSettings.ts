import { useState, useEffect } from 'react';

interface ApiSettings {
  reportingApiKey: string;
  managementUsername: string;
  managementAccount: string;
  managementAccountName: string;
  managementAuthToken: string;
}

const defaultSettings: ApiSettings = {
  reportingApiKey: '',
  managementUsername: '',
  managementAccount: '',
  managementAccountName: '',
  managementAuthToken: ''
};

export function useApiSettings() {
  const [settings, setSettings] = useState<ApiSettings>(() => {
    const savedSettings = localStorage.getItem('apiSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    // Load settings from localStorage on component mount
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSettings = (newSettings: Partial<ApiSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('apiSettings', JSON.stringify(settings));
  };

  const clearSettings = () => {
    localStorage.removeItem('apiSettings');
    setSettings(defaultSettings);
  };

  return {
    settings,
    updateSettings,
    saveSettings,
    clearSettings
  };
}