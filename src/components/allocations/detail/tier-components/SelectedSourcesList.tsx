import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CUSTOMER_SOURCES } from './CustomerSourceSelector';
import type { SelectedSource } from './types';

interface SelectedSourcesListProps {
  selectedSources: SelectedSource[];
  totalCustomers: number;
  onSourceRemove: (sourceId: string) => void;
}

export function SelectedSourcesList({
  selectedSources,
  totalCustomers,
  onSourceRemove
}: SelectedSourcesListProps) {
  if (selectedSources.length === 0) return null;

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Selected Sources</h4>
        <span className="text-sm text-muted-foreground">
          {totalCustomers.toLocaleString()} total customers
        </span>
      </div>
      <div className="space-y-3">
        {selectedSources.map(source => {
          const sourceInfo = CUSTOMER_SOURCES.find(s => s.id === source.sourceId);
          const sourceTotal = source.items.reduce((sum, item) => sum + (item.count || 1), 0);
          
          return (
            <div key={source.sourceId} className="bg-background rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {sourceInfo && <sourceInfo.icon className="w-4 h-4" />}
                  <span className="font-medium">{sourceInfo?.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({sourceTotal.toLocaleString()} customers)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSourceRemove(source.sourceId)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {source.items.map(item => (
                  <div key={item.id} className="text-sm flex items-center justify-between">
                    <span>{item.name}</span>
                    {item.count && (
                      <span className="text-muted-foreground">
                        {item.count.toLocaleString()} customers
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}