export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

export interface PublicUser {
  id: string;
  email: string;
  role: string;
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, role: user.role };
}
