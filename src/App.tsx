import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { Layout } from './components/layout/Layout';
import { HomePage } from './components/home/HomePage';
import { AllocationListingPage } from './components/allocations/AllocationListingPage';
import { CreateAllocation } from './components/allocations/CreateAllocation';
import { AllocationDetailPage } from './components/allocations/detail/AllocationDetailPage';
import { OpenAllocationDetailPage } from './components/allocations/detail/open/OpenAllocationDetailPage';
import { PreviousAllocationDetailPage } from './components/allocations/detail/previous/PreviousAllocationDetailPage';
import { TierDetailPage } from './components/allocations/detail/open/TierDetailPage';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import ApiTestPage from './components/api/ApiTestPage';
import { SettingsLayout } from './components/settings/SettingsLayout';
import { GeneralSettings } from './components/settings/GeneralSettings';
import { ApiSettings } from './components/settings/ApiSettings';
import { ProductSelectorDemo } from './components/products/ProductSelectorDemo';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="allocations">
              <Route index element={<AllocationListingPage />} />
              <Route path="new" element={<CreateAllocation />} />
              <Route path=":id" element={<AllocationDetailPage />} />
              <Route path=":id/open" element={<OpenAllocationDetailPage />} />
              <Route path=":id/previous" element={<PreviousAllocationDetailPage />} />
              <Route path=":id/open/tier/:tierId" element={<TierDetailPage />} />
            </Route>
            <Route path="api" element={<ApiTestPage />} />
            <Route path="queries" element={<div>Queries</div>} />
            <Route path="products" element={<ProductSelectorDemo />} />
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<GeneralSettings />} />
              <Route path="api" element={<ApiSettings />} />
              <Route path="account" element={<div>Account Settings</div>} />
              <Route path="notifications" element={<div>Notification Settings</div>} />
              <Route path="security" element={<div>Security Settings</div>} />
              <Route path="data" element={<div>Data Settings</div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;