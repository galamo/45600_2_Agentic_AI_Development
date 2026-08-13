import { pool } from "../db/connection";
import { User } from "./user.types";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
}

function fromRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    "SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    "SELECT id, email, password_hash, role, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] ? fromRow(result.rows[0]) : null;
}

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const result = await pool.query<UserRow>(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'user')
     RETURNING id, email, password_hash, role, created_at`,
    [email, passwordHash]
  );
  return fromRow(result.rows[0]);
}
