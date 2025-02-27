import React, { useState } from 'react';
import { ProductSelector } from './ProductSelector';
import { ProductSelectorDialog } from './ProductSelectorDialog';
import { Button } from '@/components/ui/button';

export function ProductSelectorDemo() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSelection, setDialogSelection] = useState<string[]>([]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Product Selector Component</h2>
        <p className="text-gray-600 mb-6">
          A reusable component for selecting products from the available inventory.
          This component can be used across multiple applications.
        </p>
      </div>

      <div className="space-y-8">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h3 className="text-lg font-medium mb-3">Inline Product Selector</h3>
          <p className="text-gray-600 mb-4">
            This example shows the product selector embedded directly in the page.
          </p>
          
          <ProductSelector
            selectedProducts={selectedProducts}
            onSelectionChange={setSelectedProducts}
            maxHeight="300px"
          />
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Selected Products ({selectedProducts.length})</h4>
            {selectedProducts.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {selectedProducts.map(id => (
                  <li key={id} className="text-sm">{id}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No products selected</p>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h3 className="text-lg font-medium mb-3">Dialog Product Selector</h3>
          <p className="text-gray-600 mb-4">
            This example shows the product selector in a dialog/modal.
          </p>
          
          <Button onClick={() => setDialogOpen(true)}>
            Open Product Selector
          </Button>
          
          <ProductSelectorDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onConfirm={setDialogSelection}
            selectedProducts={dialogSelection}
            title="Select Products for Allocation"
            confirmText="Add Selected Products"
          />
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Dialog Selected Products ({dialogSelection.length})</h4>
            {dialogSelection.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {dialogSelection.map(id => (
                  <li key={id} className="text-sm">{id}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No products selected</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium mb-2 text-blue-800">Usage Examples</h3>
        <p className="text-blue-700 mb-3">
          This component can be used in various parts of the application:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-blue-700">
          <li>Allocation product selection</li>
          <li>Inventory management</li>
          <li>Order creation</li>
          <li>Product catalog management</li>
          <li>Reporting and analytics</li>
        </ul>
      </div>
    </div>
  );
}