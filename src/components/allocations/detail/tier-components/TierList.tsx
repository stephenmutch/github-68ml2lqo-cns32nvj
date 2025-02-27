import React from 'react';
import { Edit, Trash, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { TierData } from './types';

interface TierListProps {
  tiers: TierData[];
  expandedTiers: Set<string>;
  onTierExpand: (tierId: string) => void;
  onTierEdit: (tierId: string) => void;
  onTierDelete: (tierId: string) => void;
}

export function TierList({
  tiers,
  expandedTiers,
  onTierExpand,
  onTierEdit,
  onTierDelete
}: TierListProps) {
  if (tiers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tiers created yet. Click "Create Tier" to add your first tier.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tiers.map(tier => (
        <div key={tier.id} className="border rounded-lg">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => onTierExpand(tier.id)}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                {tier.level}
              </div>
              <div>
                <h3 className="font-medium">{tier.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {tier.customer_count.toLocaleString()} customers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onTierEdit(tier.id);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onTierDelete(tier.id);
                }}
              >
                <Trash className="w-4 h-4" />
              </Button>
              {expandedTiers.has(tier.id) ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>

          {expandedTiers.has(tier.id) && (
            <div className="border-t p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Access Start</Label>
                  <p className="mt-1">
                    {new Date(tier.access_start).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Access End</Label>
                  <p className="mt-1">
                    {new Date(tier.access_end).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Render tier overrides */}
              {tier.overrides && (
                <>
                  {tier.overrides.requirements && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Purchase Requirements</Label>
                      <div className="mt-1 space-y-1">
                        {tier.overrides.requirements.cartMin && (
                          <p>Minimum Bottles: {tier.overrides.requirements.cartMin}</p>
                        )}
                        {tier.overrides.requirements.cartMax && (
                          <p>Maximum Bottles: {tier.overrides.requirements.cartMax}</p>
                        )}
                        {tier.overrides.requirements.minAmount && (
                          <p>Minimum Amount: ${tier.overrides.requirements.minAmount}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {tier.overrides.discounts && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Discounts</Label>
                      <div className="mt-1 space-y-1">
                        <p>
                          Order Discount: {tier.overrides.discounts.amount}
                          {tier.overrides.discounts.type === 'percentage' ? '%' : '$'}
                        </p>
                      </div>
                    </div>
                  )}

                  {tier.overrides.shipping && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Shipping</Label>
                      <div className="mt-1 space-y-1">
                        <p>Method: {tier.overrides.shipping.method}</p>
                        <p>
                          Discount: {tier.overrides.shipping.amount}
                          {tier.overrides.shipping.type === 'percentage' ? '%' : '$'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm text-muted-foreground">Product Settings</Label>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onTierEdit(tier.id)}
                      >
                        {tier.overrides.has_product_overrides ? 'Edit Product Overrides' : 'Configure Products'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}