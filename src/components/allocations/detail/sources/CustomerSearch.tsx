import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useDebounce } from '@/hooks/useDebounce';

interface CustomerSearchProps {
  selectedItems: string[];
  onItemSelect: (id: string) => void;
}

const MOCK_CUSTOMERS = [
  { id: 'cust1', name: 'John Doe', email: 'john@example.com' },
  { id: 'cust2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: 'cust3', name: 'Bob Wilson', email: 'bob@example.com' },
  { id: 'cust4', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 'cust5', name: 'Charlie Brown', email: 'charlie@example.com' },
  { id: 'cust6', name: 'Diana Prince', email: 'diana@example.com' },
  { id: 'cust7', name: 'Edward Norton', email: 'edward@example.com' },
  { id: 'cust8', name: 'Fiona Apple', email: 'fiona@example.com' }
];

export default function CustomerSearch({ selectedItems, onItemSelect }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredCustomers = useMemo(() => 
    MOCK_CUSTOMERS.filter(customer =>
      customer.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      customer.email.toLowerCase().includes(debouncedSearch.toLowerCase())
    ),
    [debouncedSearch]
  );

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="divide-y">
        {filteredCustomers.map(customer => (
          <div
            key={customer.id}
            className="flex items-center gap-4 py-3"
          >
            <Checkbox
              id={customer.id}
              checked={selectedItems.includes(customer.id)}
              onCheckedChange={() => onItemSelect(customer.id)}
            />
            <div>
              <Label htmlFor={customer.id} className="font-medium">
                {customer.name}
              </Label>
              <div className="text-sm text-muted-foreground">
                {customer.email}
              </div>
            </div>
          </div>
        ))}
        
        {filteredCustomers.length === 0 && (
          <div className="py-4 text-center text-muted-foreground">
            No customers found matching your search
          </div>
        )}
      </div>
    </div>
  );
}