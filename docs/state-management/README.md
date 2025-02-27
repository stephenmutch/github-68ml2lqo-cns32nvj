# State Management Documentation

## Overview
The application uses a combination of Zustand for global state and React hooks for local state management.

## Zustand Stores

### Allocation Store
```typescript
interface AllocationStore {
  allocations: Allocation[];
  stats: AllocationStats;
  filters: AllocationFilters;
  loading: boolean;
  error: Error | null;
  fetchAllocations: () => Promise<void>;
  setFilters: (filters: Partial<AllocationFilters>) => void;
}
```

### API Settings Store
```typescript
interface ApiSettings {
  reportingApiKey: string;
  managementUsername: string;
  managementAccount: string;
  managementAccountName: string;
  managementAuthToken: string;
}
```

## Local State Management

### Component State
- Use `useState` for simple state
- Use `useReducer` for complex state
- Implement proper state initialization

### Custom Hooks
```typescript
// Example custom hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## State Updates

### Immutable Updates
```typescript
// Example of immutable state update
const updateTier = (tierId: string, updates: Partial<Tier>) => {
  setTiers(prev => prev.map(tier =>
    tier.id === tierId ? { ...tier, ...updates } : tier
  ));
};
```

### Optimistic Updates
```typescript
// Example of optimistic update
const deleteTier = async (tierId: string) => {
  // Save previous state
  const previousTiers = [...tiers];
  
  // Optimistically update UI
  setTiers(tiers.filter(t => t.id !== tierId));
  
  try {
    // Attempt deletion
    await api.deleteTier(tierId);
  } catch (error) {
    // Restore previous state on error
    setTiers(previousTiers);
    throw error;
  }
};
```

## Performance Optimization

### Memoization
```typescript
// Example of memoized value
const filteredTiers = useMemo(() => 
  tiers.filter(tier => tier.name.includes(searchTerm)),
  [tiers, searchTerm]
);
```

### Context Optimization
- Split contexts by domain
- Minimize context value changes
- Use context selectors