-- Seed a default user for development
INSERT INTO users (id, name, phone, available_requests, helped_count, requested_count)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Nguyen Van A',
  '0901234567',
  2,
  0,
  0
)
ON CONFLICT (id) DO NOTHING;
