# Allocation Tiers Component Documentation

## Overview
The Allocation Tiers system manages customer tiers within wine allocations, allowing businesses to create and manage tiered access to their wine offerings.

## Component Structure

### Main Components
1. **AllocationTiers**
   - Main container component
   - Manages tier state and operations
   - Handles tier creation and deletion

2. **TierForm**
   - Handles tier creation/editing
   - Manages tier settings and configuration
   - Handles customer source selection

3. **CustomerSourceSelector**
   - UI for selecting customer sources
   - Supports multiple source types
   - Handles source selection events

4. **SelectedSourcesList**
   - Displays selected customer sources
   - Shows customer counts and details
   - Handles source removal

5. **TierList**
   - Displays existing tiers
   - Handles tier expansion/collapse
   - Shows tier details and settings

## State Management

### Local State
```typescript
// Main state in AllocationTiers
const [showTierForm, setShowTierForm] = useState(false);
const [selectedSource, setSelectedSource] = useState('query');
const [selectedItems, setSelectedItems] = useState<string[]>([]);
const [tiers, setTiers] = useState<TierData[]>([]);
```

### Database Schema
```sql
CREATE TABLE allocation_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_id UUID REFERENCES allocations(id),
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  access_start TIMESTAMPTZ NOT NULL,
  access_end TIMESTAMPTZ NOT NULL,
  customer_count INTEGER DEFAULT 0
);

CREATE TABLE tier_overrides (
  tier_id UUID PRIMARY KEY REFERENCES allocation_tiers(id),
  requirements JSONB,
  discounts JSONB,
  shipping JSONB,
  has_product_overrides BOOLEAN DEFAULT false
);
```

## Usage Example

```tsx
// Creating a new tier
<AllocationTiers allocation={allocation} />

// Tier form usage
<TierForm
  formData={formData}
  selectedSource={selectedSource}
  selectedSources={selectedSources}
  onSubmit={handleSubmit}
/>
```

## Customer Sources
Available customer sources for tier assignment:
1. **Queries**: Dynamic customer queries
2. **Tags**: Customer tag-based selection
3. **Groups**: Customer group selection
4. **Clubs**: Wine club memberships
5. **Search**: Direct customer search

## Events and Handlers

### Tier Creation
```typescript
const handleSubmit = async () => {
  // Validate form data
  // Create tier in database
  // Handle customer assignments
  // Update UI
};
```

### Customer Selection
```typescript
const handleItemSelect = (id: string) => {
  // Update selected items
  // Update selected sources
  // Calculate totals
};
```

## Error Handling
1. Form validation errors
2. Database operation errors
3. API errors
4. Concurrent modification handling

## Performance Considerations
1. Debounced search
2. Pagination for large lists
3. Optimized re-renders
4. Memoized calculations