import React, { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApi } from '@/lib/api/hooks';
import { Loader2, AlertCircle } from 'lucide-react';
import { Product } from '@/lib/api/types';

interface ProductData {
  id: string;
  name: string;
  price: number;
  overridePrice?: number;
  minPurchase?: number;
  maxPurchase?: number;
  allowWishRequests: boolean;
  wishRequestMin?: number;
  wishRequestMax?: number;
}

interface ProductSelectionData {
  products: ProductData[];
}

interface ProductSelectionProps {
  data: ProductSelectionData;
  onUpdate: (data: ProductSelectionData) => void;
}

export function ProductSelection({ data, onUpdate }: ProductSelectionProps) {
  const { request, loading, error } = useApi();
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  // Fetch products from the API only once
  useEffect(() => {
    // Use a ref to prevent multiple fetches
    if (fetchedRef.current) return;
    
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError(null);
        
        const products = await request(client => client.getAvailableProducts(), {
          cacheKey: 'available-products',
          cacheDuration: 5 * 60 * 1000 // 5 minutes cache
        });
        
        if (products) {
          // Ensure products is an array
          const productsArray = Array.isArray(products) 
            ? products 
            : Object.values(products);
          
          setAvailableProducts(productsArray);
        } else {
          setProductError('No products returned from API');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setProductError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoadingProducts(false);
        fetchedRef.current = true;
      }
    };

    fetchProducts();
  }, []); // Empty dependency array to run only once

  const addProduct = () => {
    if (!selectedProductId) return;

    const productToAdd = availableProducts.find(p => p.id === selectedProductId);
    if (!productToAdd) return;

    const newProduct: ProductData = {
      id: productToAdd.id,
      name: productToAdd.name,
      price: parseFloat(productToAdd.price) || 0,
      allowWishRequests: false,
    };

    onUpdate({
      products: [...(data.products || []), newProduct]
    });
    setSelectedProductId('');
  };

  const updateProduct = (index: number, updates: Partial<ProductData>) => {
    const updatedProducts = [...(data.products || [])];
    updatedProducts[index] = { ...updatedProducts[index], ...updates };
    onUpdate({ products: updatedProducts });
  };

  const removeProduct = (index: number) => {
    const updatedProducts = [...(data.products || [])];
    updatedProducts.splice(index, 1);
    onUpdate({ products: updatedProducts });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Product Selection</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select products and configure their purchase limits.
        </p>
        <div className="mt-2 p-4 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">
            Note: These settings can be customized at the tier level later.
          </p>
        </div>
      </div>

      {/* Add Product */}
      <div className="space-y-4">
        {loadingProducts ? (
          <div className="flex items-center justify-center p-6 border rounded-lg">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin mr-2" />
            <span>Loading products...</span>
          </div>
        ) : productError ? (
          <div className="flex items-center p-6 border rounded-lg bg-red-50 text-red-700">
            <AlertCircle className="h-6 w-6 mr-2" />
            <div>
              <p className="font-medium">Failed to load products</p>
              <p className="text-sm">{productError}</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <Select
              value={selectedProductId}
              onValueChange={setSelectedProductId}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.length > 0 ? (
                  availableProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${parseFloat(product.price).toFixed(2)}
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                    No products available
                  </div>
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={addProduct}
              disabled={!selectedProductId}
            >
              Add Product
            </Button>
          </div>
        )}
      </div>

      {/* Product List */}
      <div className="space-y-6">
        {(data.products || []).map((product, index) => (
          <div key={`${product.id}-${index}`} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{product.name}</h3>
                <p className="text-sm text-muted-foreground">Base Price: ${product.price.toFixed(2)}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => removeProduct(index)}
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Override Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={product.overridePrice || ''}
                    onChange={(e) => updateProduct(index, {
                      overridePrice: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    className="pl-7"
                    placeholder={product.price.toString()}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Purchase</Label>
                  <Input
                    type="number"
                    value={product.minPurchase || ''}
                    onChange={(e) => updateProduct(index, {
                      minPurchase: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Purchase</Label>
                  <Input
                    type="number"
                    value={product.maxPurchase || ''}
                    onChange={(e) => updateProduct(index, {
                      maxPurchase: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`wishRequests-${index}`}
                  checked={product.allowWishRequests}
                  onCheckedChange={(checked) => updateProduct(index, { 
                    allowWishRequests: checked as boolean 
                  })}
                />
                <Label htmlFor={`wishRequests-${index}`}>Allow Wish Requests</Label>
              </div>

              {product.allowWishRequests && (
                <div className="ml-6 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Wish Request</Label>
                    <Input
                      type="number"
                      value={product.wishRequestMin || ''}
                      onChange={(e) => updateProduct(index, {
                        wishRequestMin: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Wish Request</Label>
                    <Input
                      type="number"
                      value={product.wishRequestMax || ''}
                      onChange={(e) => updateProduct(index, {
                        wishRequestMax: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      min="0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {(data.products || []).length === 0 && !loadingProducts && (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-gray-500">No products added yet. Select a product from the dropdown above.</p>
          </div>
        )}
      </div>
    </div>
  );
}