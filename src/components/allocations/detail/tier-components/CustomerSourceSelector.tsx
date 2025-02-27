import React from 'react';
import { FileSearch, Tag, Users, Wine, Search } from 'lucide-react';

export const CUSTOMER_SOURCES = [
  {
    id: 'query',
    name: 'Queries',
    icon: FileSearch,
    description: 'Choose queries to add matching customers to this tier'
  },
  {
    id: 'tag',
    name: 'Tags',
    icon: Tag,
    description: 'Select customer tags to add tagged customers to this tier'
  },
  {
    id: 'group',
    name: 'Groups',
    icon: Users,
    description: 'Add customers from selected customer groups'
  },
  {
    id: 'club',
    name: 'Clubs',
    icon: Wine,
    description: 'Add customers from wine club memberships'
  },
  {
    id: 'search',
    name: 'Search',
    icon: Search,
    description: 'Search and select individual customers to add'
  }
] as const;

interface CustomerSourceSelectorProps {
  selectedSource: string;
  onSourceChange: (source: string) => void;
}

export function CustomerSourceSelector({
  selectedSource,
  onSourceChange
}: CustomerSourceSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {CUSTOMER_SOURCES.map(source => (
        <button
          key={source.id}
          onClick={() => onSourceChange(source.id)}
          className={`
            relative group rounded-lg border bg-white p-6 transition-all duration-200
            ${selectedSource === source.id 
              ? 'bg-primary/5 border-primary/20' 
              : 'bg-card hover:bg-accent/50'}
          `}
        >
          <source.icon className="w-6 h-6" />
          <span className="text-sm font-medium text-center">{source.name}</span>
        </button>
      ))}
    </div>
  );
}