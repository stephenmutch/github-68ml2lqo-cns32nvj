import React from 'react';
import { Outlet } from 'react-router-dom';
import { SettingsSidebar } from './SettingsSidebar';

export function SettingsLayout() {
  return (
    <div className="grid grid-cols-[240px,1fr] gap-6">
      <SettingsSidebar />
      <div className="space-y-6">
        <Outlet />
      </div>
    </div>
  );
}