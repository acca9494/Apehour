import type { AuthUser, AuthSession, LoginCredentials, RegisterData, UserRole } from "./types";

const USERS_KEY = "appape_users";
const SESSION_KEY = "appape_session";

interface StoredUser extends AuthUser {
  passwordHash: string;
}

// Demo accounts — remove in production
const SEED_USERS: StoredUser[] = [
  {
    id: "demo-cliente-001",
    email: "cliente@demo.com",
    name: "Marco Rossi",
    role: "cliente",
    createdAt: "2024-01-01T00:00:00.000Z",
    passwordHash: "demo123",
  },
  {
    id: "demo-bar-001",
    email: "bar@demo.com",
    name: "Lucia Bianchi",
    role: "commerciante",
    createdAt: "2024-01-01T00:00:00.000Z",
    passwordHash: "demo123",
  },
];

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const stored: StoredUser[] = raw ? JSON.parse(raw) : [];
    const ids = new Set(stored.map((u) => u.id));
    const merged = [...stored];
    for (const seed of SEED_USERS) {
      if (!ids.has(seed.id)) merged.push(seed);
    }
    return merged;
  } catch {
    return SEED_USERS;
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCookies(user: AuthUser): void {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `appape_role=${user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `appape_uid=${user.id}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookies(): void {
  document.cookie = "appape_role=; path=/; max-age=0";
  document.cookie = "appape_uid=; path=/; max-age=0";
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  await new Promise((r) => setTimeout(r, 420));

  const users = getUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === credentials.email.toLowerCase() &&
      u.passwordHash === credentials.password
  );

  if (!user) throw new Error("invalid_credentials");

  const { passwordHash: _ph, ...safeUser } = user;
  const session: AuthSession = {
    user: safeUser,
    token: `mock-token-${user.id}-${Date.now()}`,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setCookies(safeUser);
  return session;
}

export async function register(data: RegisterData): Promise<AuthSession> {
  await new Promise((r) => setTimeout(r, 520));

  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("email_taken");
  }

  const newUser: StoredUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    email: data.email,
    name: data.name,
    role: data.role,
    createdAt: new Date().toISOString(),
    passwordHash: data.password,
  };

  users.push(newUser);
  saveUsers(users);

  const { passwordHash: _ph, ...safeUser } = newUser;
  const session: AuthSession = {
    user: safeUser,
    token: `mock-token-${newUser.id}-${Date.now()}`,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setCookies(safeUser);
  return session;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  clearCookies();
}

// ── Google mock login ────────────────────────────────────────────────────────
const GOOGLE_MOCK: Record<UserRole, { id: string; email: string; name: string }> = {
  cliente:       { id: "google-cliente-001",    email: "utente.google@gmail.com",  name: "Utente Google" },
  commerciante:  { id: "google-bar-001",         email: "bar.google@gmail.com",     name: "Bar Google Demo" },
};

export async function loginWithGoogle(role: UserRole = "cliente"): Promise<AuthSession> {
  await new Promise((r) => setTimeout(r, 700));

  const mock = GOOGLE_MOCK[role];
  const users = getUsers();
  let existing = users.find((u) => u.id === mock.id);

  if (!existing) {
    existing = { ...mock, role, createdAt: new Date().toISOString(), passwordHash: "__google__" };
    users.push(existing);
    saveUsers(users);
  }

  const { passwordHash: _ph, ...safeUser } = existing;
  const session: AuthSession = { user: safeUser, token: `google-token-${mock.id}-${Date.now()}` };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setCookies(safeUser);
  return session;
}
