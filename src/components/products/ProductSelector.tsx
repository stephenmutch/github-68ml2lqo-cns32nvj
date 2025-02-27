import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { useApi } from '@/lib/api/hooks';
import { Product } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';

export interface ProductSelectorProps {
  /**
   * Selected product IDs
   */
  selectedProducts: string[];
  /**
   * Callback when selection changes
   */
  onSelectionChange: (selectedIds: string[]) => void;
  /**
   * Allow multiple selection
   */
  multiple?: boolean;
  /**
   * Show price in product list
   */
  showPrice?: boolean;
  /**
   * Show SKU in product list
   */
  showSku?: boolean;
  /**
   * Initial filter value
   */
  initialFilter?: string;
  /**
   * Maximum height of the product list
   */
  maxHeight?: string;
  /**
   * Placeholder text for search input
   */
  searchPlaceholder?: string;
  /**
   * Custom class name for the component
   */
  className?: string;
}

export function ProductSelector({
  selectedProducts = [],
  onSelectionChange,
  multiple = true,
  showPrice = true,
  showSku = true,
  initialFilter = '',
  maxHeight = '400px',
  searchPlaceholder = 'Search products...',
  className = ''
}: ProductSelectorProps) {
  const { request, loading: apiLoading } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(initialFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [productsFetched, setProductsFetched] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch products from API - only when needed
  const fetchProducts = useCallback(async () => {
    if (productsFetched && retryCount === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await request(
        client => client.getAvailableProducts(),
        {
          cacheKey: `available-products-${retryCount}`,
          cacheDuration: 5 * 60 * 1000, // 5 minutes
          forceRefresh: retryCount > 0 // Force refresh if we're retrying
        }
      );
      
      if (!result) {
        setProducts([]);
        setError('No products found');
      } else {
        const productsArray = Array.isArray(result) ? result : Object.values(result);
        setProducts(productsArray);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
      setProductsFetched(true);
    }
  }, [request, retryCount, productsFetched]);

  // Initial fetch - only once
  useEffect(() => {
    if (!productsFetched) {
      fetchProducts();
    }
  }, [fetchProducts, productsFetched]);

  // Memoize filtered products to prevent unnecessary re-renders
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    
    let filtered = [...products];
    
    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.sku.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply type filter
    if (filterType) {
      filtered = filtered.filter(product => product.status === filterType);
    }
    
    return filtered;
  }, [debouncedSearchTerm, filterType, products]);

  // Handle product selection
  const handleProductSelect = useCallback((productId: string) => {
    if (multiple) {
      onSelectionChange(
        selectedProducts.includes(productId)
          ? selectedProducts.filter(id => id !== productId)
          : [...selectedProducts, productId]
      );
    } else {
      onSelectionChange([productId]);
    }
  }, [multiple, onSelectionChange, selectedProducts]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedProducts.length === filteredProducts.length) {
      // If all are selected, deselect all
      onSelectionChange([]);
    } else {
      // Otherwise select all filtered products
      onSelectionChange(filteredProducts.map(p => p.id));
    }
  }, [filteredProducts, onSelectionChange, selectedProducts.length]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('');
  }, []);

  // Memoize the product list to prevent unnecessary re-renders
  const productList = useMemo(() => {
    if (loading || apiLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-sm text-gray-500">Loading products...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 font-medium">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          No products found matching your criteria
        </div>
      );
    }

    return (
      <div>
        {multiple && (
          <div className="p-2 border-b bg-muted/30">
            <div className="flex items-center px-2">
              <Checkbox
                id="select-all"
                checked={
                  filteredProducts.length > 0 && 
                  selectedProducts.length === filteredProducts.length
                }
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="ml-2 text-sm">
                Select all ({filteredProducts.length})
              </Label>
              {selectedProducts.length > 0 && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {selectedProducts.length} selected
                </span>
              )}
            </div>
          </div>
        )}
        <ul className="divide-y">
          {filteredProducts.map(product => (
            <li 
              key={product.id}
              className={`flex items-start p-4 hover:bg-muted/30 ${
                selectedProducts.includes(product.id) ? 'bg-primary/5' : ''
              }`}
            >
              <Checkbox
                id={`product-${product.id}`}
                checked={selectedProducts.includes(product.id)}
                onCheckedChange={() => handleProductSelect(product.id)}
                className="mt-1"
              />
              <div className="ml-3 flex-1">
                <Label 
                  htmlFor={`product-${product.id}`}
                  className="font-medium cursor-pointer"
                >
                  {product.name}
                </Label>
                <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                  {showSku && (
                    <span>SKU: {product.sku}</span>
                  )}
                  {showPrice && (
                    <span>Price: ${parseFloat(product.price).toFixed(2)}</span>
                  )}
                  {product.status && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  )}
                </div>
                {product.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
              {selectedProducts.includes(product.id) && (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }, [
    loading, 
    apiLoading, 
    error, 
    filteredProducts, 
    handleRetry, 
    multiple, 
    selectedProducts, 
    handleSelectAll, 
    handleProductSelect, 
    showSku, 
    showPrice
  ]);

  // Memoize the footer to prevent unnecessary re-renders
  const footer = useMemo(() => {
    if (selectedProducts.length === 0) return null;
    
    return (
      <div className="p-3 border-t bg-muted/30 flex justify-between items-center">
        <span className="text-sm">
          {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
        </span>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onSelectionChange([])}
        >
          Clear selection
        </Button>
      </div>
    );
  }, [selectedProducts.length, onSelectionChange]);

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Header with search and filters */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                type="button"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-muted' : ''}
            type="button"
          >
            <Filter size={18} />
          </Button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="filter-type" className="text-sm">Product Status</Label>
              <Select
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="ml-auto"
                type="button"
              >
                Clear filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product list */}
      <div 
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {productList}
      </div>

      {/* Footer with selection info */}
      {footer}
    </div>
  );
}