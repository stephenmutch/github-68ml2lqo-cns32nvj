import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomerSourceSelector } from './tier-components/CustomerSourceSelector';
import { SelectedSourcesList } from './tier-components/SelectedSourcesList';
import { TierConfiguration } from './TierConfiguration';
import type { TierFormData, SelectedSource } from './tier-components/types';

interface TierFormProps {
  formData: TierFormData;
  selectedSource: string;
  selectedSources: SelectedSource[];
  selectedItems: string[];
  totalCustomers: number;
  onSourceChange: (source: string) => void;
  onItemSelect: (id: string) => void;
  onFormDataChange: (data: Partial<TierFormData>) => void;
  onSourceRemove: (sourceId: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onShowProductOverrides: () => void;
}

export function TierForm({
  formData,
  selectedSource,
  selectedSources,
  selectedItems,
  totalCustomers,
  onSourceChange,
  onItemSelect,
  onFormDataChange,
  onSourceRemove,
  onCancel,
  onSubmit,
  onShowProductOverrides
}: TierFormProps) {
  return (
    <div className="bg-card rounded-lg border p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create New Tier</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure tier settings and add customers.
        </p>
      </div>

      {/* Basic Information */}
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tierName">Tier Name</Label>
            <Input
              id="tierName"
              value={formData.name}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              placeholder="e.g., Premium Members"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tierLevel">Tier Level</Label>
            <Input
              type="number"
              id="tierLevel"
              min="1"
              value={formData.level}
              onChange={(e) => onFormDataChange({ level: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accessStart">Access Start</Label>
            <Input
              type="datetime-local"
              id="accessStart"
              value={formData.accessStart}
              onChange={(e) => onFormDataChange({ accessStart: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessEnd">Access End</Label>
            <Input
              type="datetime-local"
              id="accessEnd"
              value={formData.accessEnd}
              onChange={(e) => onFormDataChange({ accessEnd: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Tier Configuration */}
      <div className="border-t pt-6">
        <TierConfiguration
          allocation={formData.allocation}
          value={formData}
          onChange={onFormDataChange}
        />
      </div>

      {formData.overrides?.products && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Product Settings</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure product-specific settings for this tier.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onShowProductOverrides}
            >
              Configure Products
            </Button>
          </div>
        </div>
      )}

      {/* Customer Selection */}
      <div className="border-t pt-6 space-y-4">
        <div>
          <Label>Add Customers</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            Select customers to add to this tier.
          </p>
        </div>

        <CustomerSourceSelector
          selectedSource={selectedSource}
          onSourceChange={onSourceChange}
        />

        <div className="mt-4 border rounded-lg">
          {/* Customer source content will be rendered here */}
        </div>

        <SelectedSourcesList
          selectedSources={selectedSources}
          totalCustomers={totalCustomers}
          onSourceRemove={onSourceRemove}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>Create Tier</Button>
      </div>
    </div>
  );
}