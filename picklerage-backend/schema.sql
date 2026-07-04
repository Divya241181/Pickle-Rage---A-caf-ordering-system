-- Picklerage QR Ordering System - Supabase Schema

-- Custom Types
CREATE TYPE table_status AS ENUM ('available', 'occupied');
CREATE TYPE food_type AS ENUM ('veg', 'non_veg', 'jain');
CREATE TYPE session_status AS ENUM ('active', 'closed');
CREATE TYPE order_type AS ENUM ('dine_in', 'takeout');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled');
CREATE TYPE call_type AS ENUM ('water', 'new_order', 'bill');
CREATE TYPE call_status AS ENUM ('pending', 'acknowledged');

-- Tables
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_number INTEGER NOT NULL UNIQUE,
    qr_token TEXT NOT NULL UNIQUE,
    status table_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10, 2) NOT NULL,
    food_type food_type NOT NULL DEFAULT 'veg',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE table_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    guest_count INTEGER NOT NULL,
    status session_status NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
    order_type order_type NOT NULL,
    customer_name TEXT,
    mobile TEXT,
    round_number INTEGER NOT NULL DEFAULT 1,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status order_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE waiter_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
    call_type call_type NOT NULL,
    status call_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table (for billing counter)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE waiter_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE table_sessions;

-- RLS
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiter_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies (one per table, no conflicts)
CREATE POLICY "public_all" ON tables FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON categories FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON menu_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON table_sessions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON orders FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON order_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON waiter_calls FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON payments FOR ALL TO anon USING (true) WITH CHECK (true);

-- Seed categories
INSERT INTO categories (name, sort_order) VALUES
  ('Thai Street Flavor', 1),
  ('Korean Street Kitchen', 2),
  ('Chinese Favorites', 3),
  ('Italian Kitchen', 4),
  ('Mongolian Box Selection', 5),
  ('Mexican Station', 6),
  ('American Street Bites', 7),
  ('Desserts', 8);