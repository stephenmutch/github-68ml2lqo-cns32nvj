import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Key, User, Bell, Shield, Database } from 'lucide-react';

export function SettingsSidebar() {
  const navItems = [
    { icon: Settings, label: 'General', to: '/settings' },
    { icon: Key, label: 'API', to: '/settings/api' },
    { icon: User, label: 'Account', to: '/settings/account' },
    { icon: Bell, label: 'Notifications', to: '/settings/notifications' },
    { icon: Shield, label: 'Security', to: '/settings/security' },
    { icon: Database, label: 'Data', to: '/settings/data' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/5 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
              end={item.to === '/settings'}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}