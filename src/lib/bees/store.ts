const KEY = "appape_bees";

interface BeesMap {
  [userId: string]: number;
}

function getMap(): BeesMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMap(map: BeesMap): void {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function getBees(userId: string): number {
  return getMap()[userId] ?? 0;
}

export function addBees(userId: string, amount: number): number {
  const map = getMap();
  map[userId] = (map[userId] ?? 0) + amount;
  saveMap(map);
  return map[userId];
}

export function setBees(userId: string, amount: number): void {
  const map = getMap();
  map[userId] = amount;
  saveMap(map);
}
