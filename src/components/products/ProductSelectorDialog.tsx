import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProductSelector, ProductSelectorProps } from './ProductSelector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ProductSelectorDialogProps extends Omit<ProductSelectorProps, 'className'> {
  /**
   * Is the dialog open
   */
  open: boolean;
  /**
   * Callback when dialog is closed
   */
  onClose: () => void;
  /**
   * Callback when selection is confirmed
   */
  onConfirm: (selectedIds: string[]) => void;
  /**
   * Dialog title
   */
  title?: string;
  /**
   * Confirm button text
   */
  confirmText?: string;
  /**
   * Cancel button text
   */
  cancelText?: string;
}

export function ProductSelectorDialog({
  open,
  onClose,
  onConfirm,
  selectedProducts = [],
  title = 'Select Products',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  ...props
}: ProductSelectorDialogProps) {
  const [internalSelection, setInternalSelection] = useState<string[]>(selectedProducts);

  // Reset internal selection when dialog opens with new selection
  useEffect(() => {
    if (open) {
      setInternalSelection(selectedProducts);
    }
  }, [selectedProducts, open]);

  const handleConfirm = () => {
    onConfirm(internalSelection);
    onClose();
  };

  // Only render the content when the dialog is open to improve performance
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ProductSelector
            selectedProducts={internalSelection}
            onSelectionChange={setInternalSelection}
            maxHeight="50vh"
            {...props}
          />
        </div>
        
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} type="button">
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} type="button">
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}