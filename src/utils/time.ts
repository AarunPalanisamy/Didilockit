// Manual formatting keeps output identical across Hermes/iOS/Android
// regardless of device locale quirks.

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function splitClock(date: Date): { hhmm: string; period: 'AM' | 'PM' } {
  const h24 = date.getHours();
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(date.getMinutes()).padStart(2, '0');
  return { hhmm: `${h12}:${mm}`, period: h24 < 12 ? 'AM' : 'PM' };
}

/** "9:41 PM" */
export function formatTime12(timestamp: number): string {
  const { hhmm, period } = splitClock(new Date(timestamp));
  return `${hhmm} ${period}`;
}

/** "Thursday, 22 October" */
export function formatLongDate(date: Date): string {
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "just now", "12 min ago", "3 h ago" */
export function formatAgo(timestamp: number, now: number): string {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)} h ago`;
}

/** "Clears in 23 h" / "Clears in 40 min" */
export function formatExpiresIn(expiresAt: number, now: number): string {
  const minutes = Math.max(0, Math.ceil((expiresAt - now) / 60_000));
  if (minutes >= 60) return `Clears in ${Math.floor(minutes / 60)} h`;
  return `Clears in ${minutes} min`;
}
