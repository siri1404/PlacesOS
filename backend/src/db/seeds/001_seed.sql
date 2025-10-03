INSERT INTO users (email, full_name, role, created_at, updated_at)
VALUES
  ('admin@placesos.local', 'Platform Admin', 'admin', NOW(), NOW()),
  ('manager@placesos.local', 'Facilities Manager', 'manager', NOW(), NOW()),
  ('member@placesos.local', 'Workspace Member', 'member', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO resource_types (name, description, bookable_window_days, max_booking_minutes, created_at, updated_at)
VALUES
  ('room', 'Meeting room inventory', 45, 180, NOW(), NOW()),
  ('desk', 'Bookable desk inventory', 30, 480, NOW(), NOW()),
  ('equipment', 'Shared equipment inventory', 14, 240, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO resources (name, location, floor, capacity, status, metadata_json, resource_type_id, created_at, updated_at)
SELECT 'Atlas Room', 'HQ East', '5', 10, 'active', '{"projector": true, "vc": true}'::jsonb, rt.id, NOW(), NOW()
FROM resource_types rt
WHERE rt.name = 'room'
  AND NOT EXISTS (SELECT 1 FROM resources WHERE name = 'Atlas Room');

INSERT INTO resources (name, location, floor, capacity, status, metadata_json, resource_type_id, created_at, updated_at)
SELECT 'Desk Pod A-14', 'HQ East', '2', 1, 'active', '{"monitor_count": 2}'::jsonb, rt.id, NOW(), NOW()
FROM resource_types rt
WHERE rt.name = 'desk'
  AND NOT EXISTS (SELECT 1 FROM resources WHERE name = 'Desk Pod A-14');

INSERT INTO recurring_rules (user_id, resource_id, pattern, starts_on, ends_on, created_at, updated_at)
SELECT u.id, r.id, 'FREQ=WEEKLY;BYDAY=MO', CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', NOW(), NOW()
FROM users u
JOIN resources r ON r.name = 'Atlas Room'
WHERE u.email = 'manager@placesos.local'
  AND NOT EXISTS (SELECT 1 FROM recurring_rules rr WHERE rr.user_id = u.id AND rr.resource_id = r.id);

INSERT INTO bookings (user_id, resource_id, recurring_rule_id, starts_at, ends_at, purpose, status, created_at, updated_at)
SELECT u.id,
       r.id,
       NULL,
       date_trunc('hour', NOW()) + INTERVAL '1 day' + INTERVAL '9 hours',
       date_trunc('hour', NOW()) + INTERVAL '1 day' + INTERVAL '10 hours',
       'Weekly planning',
       'confirmed',
       NOW(),
       NOW()
FROM users u
JOIN resources r ON r.name = 'Atlas Room'
WHERE u.email = 'member@placesos.local'
  AND NOT EXISTS (
    SELECT 1
    FROM bookings b
    WHERE b.user_id = u.id
      AND b.resource_id = r.id
      AND b.purpose = 'Weekly planning'
  );

INSERT INTO audit_log (actor_user_id, entity_name, entity_id, action, before_state, after_state, created_at)
SELECT u.id, 'bootstrap', u.id, 'seed', NULL, jsonb_build_object('email', u.email), NOW()
FROM users u
WHERE u.email = 'admin@placesos.local'
  AND NOT EXISTS (
    SELECT 1 FROM audit_log a WHERE a.entity_name = 'bootstrap' AND a.entity_id = u.id
  );
