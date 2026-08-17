-- ============================================================
-- GoGreen Nursery Admin — PostgreSQL Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------
-- PRODUCTS TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY DEFAULT ('P-' || to_char(nextval('product_seq'), 'FM000')),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  price       INTEGER NOT NULL,         -- in INR (paise-less)
  stock       INTEGER NOT NULL DEFAULT 0,
  low_at      INTEGER NOT NULL DEFAULT 5, -- threshold for low-stock alert
  available   BOOLEAN NOT NULL DEFAULT TRUE,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS product_seq START 1;

-- -------------------------------------------------------
-- ORDERS TABLE
-- -------------------------------------------------------
CREATE TYPE order_status AS ENUM (
  'Pending', 'Accepted', 'Preparing', 'Packed', 'Cancelled', 'Failed'
);

CREATE TYPE pay_status AS ENUM (
  'Paid', 'Pending', 'Failed', 'Refunded'
);

CREATE TABLE IF NOT EXISTS orders (
  id          TEXT PRIMARY KEY DEFAULT ('ORD-' || to_char(nextval('order_seq'), 'FM0000')),
  customer    TEXT NOT NULL,
  phone       TEXT,
  address     TEXT,
  pay_status  pay_status NOT NULL DEFAULT 'Pending',
  status      order_status NOT NULL DEFAULT 'Pending',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS order_seq START 1000;

-- -------------------------------------------------------
-- ORDER ITEMS TABLE
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  qty         INTEGER NOT NULL,
  price       INTEGER NOT NULL           -- unit price at time of order
);

-- -------------------------------------------------------
-- PAYMENTS TABLE
-- -------------------------------------------------------
CREATE TYPE refund_status AS ENUM ('None', 'Initiated', 'Completed');

CREATE TABLE IF NOT EXISTS payments (
  id          TEXT PRIMARY KEY DEFAULT ('PAY-' || to_char(nextval('payment_seq'), 'FM000')),
  txn_id      TEXT UNIQUE NOT NULL,
  order_id    TEXT REFERENCES orders(id),
  customer    TEXT NOT NULL,
  amount      INTEGER NOT NULL,           -- total amount in INR
  method      TEXT NOT NULL DEFAULT 'UPI', -- UPI, Card, COD, NetBanking
  status      pay_status NOT NULL DEFAULT 'Pending',
  refund      refund_status NOT NULL DEFAULT 'None',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  razorpay_order_id  TEXT,
  razorpay_payment_id TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS payment_seq START 500;

-- -------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- Allow authenticated admins full access; deny public
-- -------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies: service_role bypasses RLS automatically
-- For anon/authenticated users from the admin panel:
CREATE POLICY "Admin full access - products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access - orders"
  ON orders FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access - order_items"
  ON order_items FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access - payments"
  ON payments FOR ALL
  USING (auth.role() = 'authenticated');

-- -------------------------------------------------------
-- REALTIME
-- Enable realtime for live dashboard updates
-- -------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;

-- -------------------------------------------------------
-- AUTO-UPDATE updated_at trigger
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -------------------------------------------------------
-- SEED DATA (same as mock data.ts)
-- -------------------------------------------------------
INSERT INTO products (id, name, category, stock, low_at, price, available) VALUES
  ('P-001', 'Monstera Deliciosa', 'Indoor',   42, 10,  649,  TRUE),
  ('P-002', 'Snake Plant',        'Indoor',    8, 10,  349,  TRUE),
  ('P-003', 'Peace Lily',         'Indoor',   25,  8,  429,  TRUE),
  ('P-004', 'Rose Bush (Red)',    'Outdoor',   0,  5,  299,  FALSE),
  ('P-005', 'Tulsi Plant',        'Herbal',   60, 15,  149,  TRUE),
  ('P-006', 'Areca Palm',         'Indoor',    4,  6,  799,  TRUE),
  ('P-007', 'Bougainvillea',      'Outdoor',  18,  5,  379,  TRUE),
  ('P-008', 'Jade Plant',         'Succulent', 2,  5,  249,  TRUE),
  ('P-009', 'Fiddle Leaf Fig',    'Indoor',   14,  5,  899,  TRUE),
  ('P-010', 'Aloe Vera',          'Succulent',55, 12,  199,  TRUE),
  ('P-011', 'Lavender',           'Herbal',   30,  8,  249,  TRUE),
  ('P-012', 'Bird of Paradise',   'Indoor',    7,  5, 1199,  TRUE),
  ('P-013', 'Hibiscus (Pink)',    'Outdoor',  22,  6,  329,  TRUE),
  ('P-014', 'Cactus (Mixed)',     'Succulent', 3,  8,  179,  TRUE),
  ('P-015', 'Curry Leaf Plant',   'Herbal',   40, 10,  169,  TRUE),
  ('P-016', 'Pothos (Golden)',    'Indoor',    0,  8,  279,  FALSE),
  ('P-017', 'Ficus Benjamina',    'Indoor',   11,  5,  749,  TRUE),
  ('P-018', 'Marigold (Yellow)',  'Outdoor',  75, 20,   99,  TRUE),
  ('P-019', 'Lucky Bamboo',       'Indoor',    5,  6,  449,  TRUE),
  ('P-020', 'Water Lily',         'Aquatic',   0,  4,  599,  FALSE)
ON CONFLICT (id) DO NOTHING;
