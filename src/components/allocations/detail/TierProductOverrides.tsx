import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '@/lib/api/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import type { Product } from '@/lib/api/types';

type Allocation = Database['public']['Tables']['allocations']['Row'];

interface TierProductOverridesProps {
  allocation: Allocation;
  tierId?: string;
  initialOverrides?: Record<string, ProductOverride>;
  onSave?: (overrides: Record<string, ProductOverride>) => void;
  onClose: () => void;
}

interface ProductOverride {
  productId: string;
  overridePrice?: number;
  minPurchase?: number;
  maxPurchase?: number;
  allowWishRequests: boolean;
  wishRequestMin?: number;
  wishRequestMax?: number;
}

export function TierProductOverrides({
  allocation,
  tierId,
  initialOverrides = {},
  onSave,
  onClose
}: TierProductOverridesProps) {
  const { request } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [overrides, setOverrides] = useState<Record<string, ProductOverride>>(initialOverrides);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);

  // Set up cleanup function to prevent state updates after unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!mountedRef.current) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch available products
        const productsResult = await request(
          client => client.getAvailableProducts(),
          {
            cacheKey: `available-products-${retryCount}`,
            cacheDuration: 5 * 60 * 1000, // 5 minutes
            forceRefresh: retryCount > 0 // Force refresh if we're retrying
          }
        );

        if (!mountedRef.current) return;

        if (!productsResult) {
          // Handle empty result
          setProducts([]);
          setLoading(false);
          return;
        }

        const productsArray = Array.isArray(productsResult) 
          ? productsResult 
          : Object.values(productsResult);
        
        setProducts(productsArray);

        // If editing existing tier, fetch current overrides
        if (tierId) {
          const { data: existingOverrides, error: overridesError } = await supabase
            .from('tier_product_overrides')
            .select('*')
            .eq('tier_id', tierId);

          if (!mountedRef.current) return;

          if (overridesError) throw overridesError;

          if (existingOverrides) {
            const overridesMap: Record<string, ProductOverride> = {};
            existingOverrides.forEach(override => {
              overridesMap[override.product_id] = {
                productId: override.product_id,
                overridePrice: override.override_price || undefined,
                minPurchase: override.min_purchase || undefined,
                maxPurchase: override.max_purchase || undefined,
                allowWishRequests: override.allow_wish_requests,
                wishRequestMin: override.wish_request_min || undefined,
                wishRequestMax: override.wish_request_max || undefined
              };
            });
            setOverrides(overridesMap);
          }
        }
      } catch (err) {
        if (!mountedRef.current) return;
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [request, tierId, retryCount]);

  const handleOverrideChange = (productId: string, field: keyof ProductOverride, value: any) => {
    setOverrides(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { productId, allowWishRequests: false }),
        [field]: value
      }
    }));
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleSave = async () => {
    if (onSave) {
      onSave(overrides);
      onClose();
      return;
    }

    if (!tierId) {
      console.error('No tier ID provided for save operation');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Delete existing overrides
      await supabase
        .from('tier_product_overrides')
        .delete()
        .eq('tier_id', tierId);

      // Insert new overrides
      const overridesToInsert = Object.entries(overrides).map(([productId, override]) => ({
        tier_id: tierId,
        product_id: productId,
        override_price: override.overridePrice,
        min_purchase: override.minPurchase,
        max_purchase: override.maxPurchase,
        allow_wish_requests: override.allowWishRequests,
        wish_request_min: override.wishRequestMin,
        wish_request_max: override.wishRequestMax
      }));

      if (overridesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('tier_product_overrides')
          .insert(overridesToInsert);

        if (insertError) throw insertError;
      }

      // Update tier_overrides to indicate product overrides exist
      await supabase
        .from('tier_overrides')
        .upsert({
          tier_id: tierId,
          has_product_overrides: true
        });

      onClose();
    } catch (err) {
      console.error('Error saving overrides:', err);
      setError(err instanceof Error ? err.message : 'Failed to save overrides');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-gray-600">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          <p className="font-medium">Error loading products</p>
          <p className="mt-1">{error}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleRetry}>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg mb-4">
          <p className="font-medium">No products available</p>
          <p className="mt-1">There are no products available to configure for this tier.</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleRetry}>Refresh Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-background p-4 border-b z-10">
        <h3 className="text-lg font-medium">Product Settings</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure product-specific settings for this tier.
        </p>
      </div>

      <div className="space-y-6 p-4">
        {products.map(product => {
          const override = overrides[product.id] || {
            productId: product.id,
            allowWishRequests: false
          };

          return (
            <div key={product.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    SKU: {product.sku}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Base Price: ${parseFloat(product.price).toFixed(2)}
                  </p>
                </div>
                <Checkbox
                  id={`override-${product.id}`}
                  checked={!!overrides[product.id]}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleOverrideChange(product.id, 'productId', product.id);
                    } else {
                      const newOverrides = { ...overrides };
                      delete newOverrides[product.id];
                      setOverrides(newOverrides);
                    }
                  }}
                />
              </div>

              {overrides[product.id] && (
                <div className="ml-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Override Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7"
                          value={override.overridePrice || ''}
                          onChange={(e) => handleOverrideChange(
                            product.id,
                            'overridePrice',
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )}
                          placeholder={product.price}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Min Purchase</Label>
                      <Input
                        type="number"
                        min="0"
                        value={override.minPurchase || ''}
                        onChange={(e) => handleOverrideChange(
                          product.id,
                          'minPurchase',
                          e.target.value ? parseInt(e.target.value) : undefined
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Purchase</Label>
                      <Input
                        type="number"
                        min="0"
                        value={override.maxPurchase || ''}
                        onChange={(e) => handleOverrideChange(
                          product.id,
                          'maxPurchase',
                          e.target.value ? parseInt(e.target.value) : undefined
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`wishRequests-${product.id}`}
                        checked={override.allowWishRequests}
                        onCheckedChange={(checked) => handleOverrideChange(
                          product.id,
                          'allowWishRequests',
                          checked
                        )}
                      />
                      <Label htmlFor={`wishRequests-${product.id}`}>Allow Wish Requests</Label>
                    </div>

                    {override.allowWishRequests && (
                      <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Min Wish Request</Label>
                          <Input
                            type="number"
                            min="0"
                            value={override.wishRequestMin || ''}
                            onChange={(e) => handleOverrideChange(
                              product.id,
                              'wishRequestMin',
                              e.target.value ? parseInt(e.target.value) : undefined
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Wish Request</Label>
                          <Input
                            type="number"
                            min="0"
                            value={override.wishRequestMax || ''}
                            onChange={(e) => handleOverrideChange(
                              product.id,
                              'wishRequestMax',
                              e.target.value ? parseInt(e.target.value) : undefined
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 bg-background p-4 border-t flex justify-end gap-3 z-10">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}