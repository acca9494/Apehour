export type UserRole = "cliente" | "commerciante";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  bees?: number;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_taken"
  | "unknown";
