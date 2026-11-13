const clean = (value, max = 120) => typeof value === 'string' ? Array.from(value.replace(/[\u0000-\u001f\u007f]/g, ' ')).slice(0, max).join('') : '';
const date = value => Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : '';

// Only consume an already-authorized snapshot. This module is not an authorization boundary.
export function buildReport(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.projects) || !Array.isArray(snapshot.tasks) || !Array.isArray(snapshot.features) || !Array.isArray(snapshot.issues)) throw new Error('Invalid snapshot');
  const projects = new Map(snapshot.projects.filter(p => p && typeof p.id === 'string').map(p => [p.id, clean(p.name, 40)]));
  const seen = new Set();
  const rows = [];
  for (const [kind, records] of [['task', snapshot.tasks], ['feature', snapshot.features], ['issue', snapshot.issues]]) {
    for (const r of records) {
      if (!r || !projects.has(r.projectId) || typeof r.id !== 'string') continue;
      if (r.status !== 'blocked' && !(kind === 'task' && r.status === 'in_progress')) continue;
      const key = `${kind}:${r.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({key, kind, project: projects.get(r.projectId), title: clean(r.title), status: r.status, reason: r.status === 'blocked' ? clean(r.blockerReason || r.description, 200) || '未填写阻塞原因' : '', updatedAt: date(r.updatedAt)});
    }
  }
  rows.sort((a, b) => (a.status === b.status ? 0 : a.status === 'blocked' ? -1 : 1) || b.updatedAt.localeCompare(a.updatedAt) || a.key.localeCompare(b.key));
  return {rows, updatedAt: date(snapshot.updatedAt), running: rows.filter(r => r.status === 'in_progress').length, blocked: rows.filter(r => r.status === 'blocked').length};
}
export function pageOf(report, page = 0, size = 3) {
  const length = Math.max(1, Math.floor(size) || 3);
  const pages = Math.max(1, Math.ceil(report.rows.length / length));
  const index = Math.max(0, Math.min(pages - 1, Math.floor(page) || 0));
  return {rows: report.rows.slice(index * length, (index + 1) * length), page: index, pages};
}

// Visible-lifetime refresh only. Detaching invalidates late responses, even if the source cannot abort.
export function createController({source, publish, now = Date.now, schedule = setInterval, cancel = clearInterval, interval = 60000}) {
  let active = false, epoch = 0, timer, pending, cached, receivedAt = 0, error = '';
  const emit = () => publish({report: cached || {rows: [], running: 0, blocked: 0, updatedAt: ''}, loading: !!pending, error, stale: !cached || !!error || now() - receivedAt >= interval});
  function refresh() {
    if (!active) return Promise.resolve();
    if (pending) return pending;
    const current = epoch;
    const request = Promise.resolve().then(source).then(snapshot => {
      const report = buildReport(snapshot);
      if (!active || current !== epoch) return;
      cached = report; receivedAt = now(); error = '';
    }).catch(() => { if (active && current === epoch) error = '更新失败，保留上次报告'; }).finally(() => {
      if (active && current === epoch) { pending = undefined; emit(); }
    });
    pending = request; emit(); return request;
  }
  return {
    attach() { if (active) return; active = true; epoch++; emit(); timer = schedule(() => { emit(); void refresh(); }, interval); void refresh(); },
    detach() { active = false; epoch++; if (timer !== undefined) cancel(timer); timer = undefined; pending = undefined; },
    refresh,
    invalidate() { return refresh(); },
    clear() { epoch++; pending = undefined; cached = undefined; receivedAt = 0; error = ''; if (active) emit(); }
  };
}
