// src/utils/time.js
export function formatRemaining(deadline, nowTs = Date.now()) {
  if (!deadline) return '—';
  const end = new Date(deadline).getTime();
  if (Number.isNaN(end)) return '—';

  const diff = end - nowTs;
  if (diff <= 0) return 'انتهى الأجل';

  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (d > 0) return `متبقي ${d}ي ${h}س ${m}د`;
  return `متبقي ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
