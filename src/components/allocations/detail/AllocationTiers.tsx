import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { TierForm } from './TierForm';
import { TierList } from './tier-components/TierList';
import { TierProductOverrides } from './TierProductOverrides';
import type { Allocation } from '@/types/allocation';
import type { TierFormData, TierData, SelectedSource } from './tier-components/types';

interface AllocationTiersProps {
  allocation: Allocation;
}

export function AllocationTiers({ allocation }: AllocationTiersProps) {
  const [showTierForm, setShowTierForm] = useState(false);
  const [selectedSource, setSelectedSource] = useState('query');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<SelectedSource[]>([]);
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showProductOverrides, setShowProductOverrides] = useState<string | null>(null);
  const [showProductOverridesForm, setShowProductOverridesForm] = useState(false);
  const [formData, setFormData] = useState<TierFormData>({
    name: '',
    level: 1,
    accessStart: '',
    accessEnd: '',
    allocation,
    overrides: {}
  });

  useEffect(() => {
    fetchTiers();
  }, [allocation.id]);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const { data: tiersData, error: tiersError } = await supabase
        .from('allocation_tiers')
        .select(`
          id,
          name,
          level,
          access_start,
          access_end,
          customer_count
        `)
        .eq('allocation_id', allocation.id)
        .order('level', { ascending: true });

      if (tiersError) throw tiersError;

      const tiersWithOverrides = await Promise.all((tiersData || []).map(async (tier) => {
        const { data: overrides } = await supabase
          .from('tier_overrides')
          .select('*')
          .eq('tier_id', tier.id)
          .maybeSingle();

        return {
          ...tier,
          overrides: overrides || undefined
        };
      }));

      setTiers(tiersWithOverrides);
    } catch (error) {
      console.error('Error fetching tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => {
      const newItems = prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id];

      // Update selected sources
      const currentSource = selectedSource;
      
      if (newItems.length === 0) {
        setSelectedSources(prev => prev.filter(s => s.sourceId !== currentSource));
      } else {
        setSelectedSources(prev => {
          const sourceIndex = prev.findIndex(s => s.sourceId === currentSource);
          const selectedSourceItems = newItems
            .filter(itemId => true) // Replace with actual item data lookup
            .map(itemId => ({
              id: itemId,
              name: 'Item Name', // Replace with actual item name
              count: 100 // Replace with actual count
            }));

          if (sourceIndex === -1) {
            return [...prev, { sourceId: currentSource, items: selectedSourceItems }];
          }

          const newSources = [...prev];
          newSources[sourceIndex] = { sourceId: currentSource, items: selectedSourceItems };
          return newSources;
        });
      }

      return newItems;
    });
  };

  const handleSubmit = async () => {
    try {
      const { data: tier, error: tierError } = await supabase
        .from('allocation_tiers')
        .insert({
          allocation_id: allocation.id,
          name: formData.name,
          level: formData.level,
          access_start: formData.accessStart,
          access_end: formData.accessEnd,
          customer_count: selectedSources.reduce((total, source) => 
            total + source.items.reduce((sum, item) => sum + (item.count || 1), 0), 0
          )
        })
        .select()
        .single();

      if (tierError) throw tierError;

      if (Object.keys(formData.overrides).length > 0) {
        const { error: overridesError } = await supabase
          .from('tier_overrides')
          .insert({
            tier_id: tier.id,
            requirements: formData.overrides.requirements || null,
            discounts: formData.overrides.discounts || null,
            shipping: formData.overrides.shipping || null,
            has_product_overrides: !!formData.overrides.products
          });

        if (overridesError) throw overridesError;
      }

      await fetchTiers();
      setShowTierForm(false);
      resetForm();
    } catch (error) {
      console.error('Error creating tier:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: 1,
      accessStart: '',
      accessEnd: '',
      allocation,
      overrides: {}
    });
    setSelectedSources([]);
    setSelectedItems([]);
  };

  const handleTierDelete = async (tierId: string) => {
    try {
      const { error } = await supabase
        .from('allocation_tiers')
        .delete()
        .eq('id', tierId);

      if (error) throw error;
      await fetchTiers();
    } catch (error) {
      console.error('Error deleting tier:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Allocation Tiers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage customer tiers for this allocation.
          </p>
        </div>
        <Button onClick={() => setShowTierForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Tier
        </Button>
      </div>

      {showTierForm && (
        <TierForm
          formData={formData}
          selectedSource={selectedSource}
          selectedSources={selectedSources}
          selectedItems={selectedItems}
          totalCustomers={selectedSources.reduce((total, source) => 
            total + source.items.reduce((sum, item) => sum + (item.count || 1), 0), 0
          )}
          onSourceChange={setSelectedSource}
          onItemSelect={handleItemSelect}
          onFormDataChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
          onSourceRemove={(sourceId) => {
            setSelectedSources(prev => prev.filter(s => s.sourceId !== sourceId));
            if (sourceId === selectedSource) {
              setSelectedItems([]);
            }
          }}
          onCancel={() => {
            setShowTierForm(false);
            resetForm();
          }}
          onSubmit={handleSubmit}
          onShowProductOverrides={() => setShowProductOverridesForm(true)}
        />
      )}

      <TierList
        tiers={tiers}
        expandedTiers={expandedTiers}
        onTierExpand={(tierId) => {
          setExpandedTiers(prev => {
            const next = new Set(prev);
            if (next.has(tierId)) {
              next.delete(tierId);
            } else {
              next.add(tierId);
            }
            return next;
          });
        }}
        onTierEdit={(tierId) => setShowProductOverrides(tierId)}
        onTierDelete={handleTierDelete}
      />

      {(showProductOverrides || showProductOverridesForm) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 rounded-lg">
            <TierProductOverrides
              allocation={allocation}
              tierId={showProductOverrides || undefined}
              initialOverrides={{}}
              onSave={(overrides) => {
                if (showProductOverridesForm) {
                  setFormData(prev => ({
                    ...prev,
                    productOverrides: overrides
                  }));
                }
                setShowProductOverrides(null);
                setShowProductOverridesForm(false);
              }}
              onClose={() => {
                setShowProductOverrides(null);
                setShowProductOverridesForm(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}