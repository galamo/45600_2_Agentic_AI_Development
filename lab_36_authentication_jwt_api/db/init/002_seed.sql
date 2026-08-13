-- Demo user for local testing: demo@example.com / Demo1234!
-- pgcrypto's bcrypt (bf) output is compatible with bcryptjs used by the API.
INSERT INTO users (email, password_hash, role)
VALUES ('demo@example.com', crypt('Demo1234!', gen_salt('bf')), 'user')
ON CONFLICT (email) DO NOTHING;
