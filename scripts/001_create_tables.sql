-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  available_requests INT NOT NULL DEFAULT 2,
  helped_count INT NOT NULL DEFAULT 0,
  requested_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id),
  picker_id UUID REFERENCES users(id),
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  pickup_point TEXT NOT NULL CHECK (pickup_point IN ('gate', 'fence_a9', 'fence_ag3')),
  building TEXT NOT NULL,
  room TEXT NOT NULL,
  drop_point TEXT NOT NULL CHECK (drop_point IN ('ground', 'room')),
  shipper_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picked', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order_tags table
CREATE TABLE IF NOT EXISTS order_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tag TEXT NOT NULL CHECK (tag IN ('small', 'medium', 'bulky', 'heavy', 'long'))
);

-- Disable RLS since there is no authentication
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_tags DISABLE ROW LEVEL SECURITY;
