-- QUALITETMARKET PLATFORMA – seed initial supplier: BigBuy
-- Run after 007_suppliers_import.sql

-- Insert BigBuy dropshipping supplier if it does not already exist
INSERT INTO suppliers (id, name, integration_type, active, status, created_at)
SELECT
  gen_random_uuid(),
  'BigBuy',
  'dropshipping',
  true,
  'active',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers WHERE name = 'BigBuy'
);
