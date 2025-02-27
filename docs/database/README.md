# Database Documentation

## Overview
The application uses Supabase as the primary database, with a focus on real-time capabilities and secure data access.

## Schema

### Core Tables

#### allocations
```sql
CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  allocation_type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  confirmation_message TEXT,
  cart_min INTEGER,
  cart_max INTEGER,
  min_amount DECIMAL,
  order_discount_type TEXT,
  order_discount_amount DECIMAL,
  shipping_discount_type TEXT,
  shipping_discount_amount DECIMAL,
  shipping_discount_method TEXT,
  total_customers INTEGER DEFAULT 0,
  current_revenue DECIMAL DEFAULT 0,
  expected_revenue DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### allocation_tiers
```sql
CREATE TABLE allocation_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_id UUID REFERENCES allocations(id),
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  access_start TIMESTAMPTZ NOT NULL,
  access_end TIMESTAMPTZ NOT NULL,
  customer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Security

#### Row Level Security (RLS)
```sql
-- Example RLS policy
CREATE POLICY "Users can only access their own allocations"
  ON allocations
  FOR ALL
  USING (auth.uid() = user_id);
```

### Migrations
- Version controlled
- Reversible changes
- Data preservation
- Safe deployment

### Backups
- Automated backups
- Point-in-time recovery
- Disaster recovery plan