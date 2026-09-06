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
  // Extra da salvare in user_metadata (es. dati del locale per i commercianti,
  // usati per creare il record restaurants al primo accesso confermato).
  metadata?: Record<string, string>;
}

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_taken"
  | "email_confirmation_required"
  | "unknown";
