const KEY = "appape_activity_signups";

interface SignupMap {
  [userId: string]: string[];
}

function getMap(): SignupMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMap(map: SignupMap): void {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function getSignups(userId: string): string[] {
  return getMap()[userId] ?? [];
}

export function joinActivity(userId: string, activityId: string): string[] {
  const map = getMap();
  const current = map[userId] ?? [];
  if (!current.includes(activityId)) {
    map[userId] = [...current, activityId];
    saveMap(map);
  }
  return map[userId] ?? current;
}

export function leaveActivity(userId: string, activityId: string): string[] {
  const map = getMap();
  const current = map[userId] ?? [];
  map[userId] = current.filter((id) => id !== activityId);
  saveMap(map);
  return map[userId];
}

// ── Storico attività completate ──────────────────────────────────────────────

export interface CompletedActivity {
  id: string;
  title: string;
  location: string;
  date: string;
  category: string;
  bees: number;
  icon: string;
}

const COMPLETED_KEY = "appape_activity_completed";

function completedKey(userId: string) { return `${COMPLETED_KEY}_${userId}`; }

export function getCompletedActivities(userId: string): CompletedActivity[] {
  try {
    const raw = localStorage.getItem(completedKey(userId));
    return raw ? (JSON.parse(raw) as CompletedActivity[]) : [];
  } catch {
    return [];
  }
}
