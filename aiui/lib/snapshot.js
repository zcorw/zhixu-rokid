// Converts an already-authorized HubService.snapshot() result. No authentication or I/O.
const collections = {project: 'projects', task: 'tasks', feature: 'features', issue: 'issues'};
export function normalizeHubSnapshot(payload, {receivedAt = new Date().toISOString(), maxEntities = 10000} = {}) {
  if (!payload || !Array.isArray(payload.entities) || payload.nextOffset != null || payload.partial === true ||
      !Number.isInteger(maxEntities) || maxEntities < 1 || payload.entities.length > maxEntities ||
      !Number.isFinite(Date.parse(receivedAt))) throw new Error('Incomplete or invalid authorized snapshot');
  const result = {projects: [], tasks: [], features: [], issues: [], updatedAt: new Date(receivedAt).toISOString()};
  const seen = new Set();
  for (const item of payload.entities) {
    if (!item || typeof item.kind !== 'string') throw new Error('Invalid entity');
    const collection = Object.hasOwn(collections, item.kind) ? collections[item.kind] : undefined;
    if (!collection) continue;
    if (typeof item.id !== 'string' || !item.id || (item.kind !== 'project' && (typeof item.projectId !== 'string' || !item.projectId))) throw new Error('Invalid entity identity');
    const key = `${item.kind}:${item.id}`;
    if (seen.has(key)) throw new Error('Ambiguous duplicate entity');
    seen.add(key);
    // Never propagate audit history, pending proposals, credentials, or arbitrary entity fields.
    const record = {id: item.id};
    const fields = item.kind === 'project' ? ['name'] : ['projectId', 'title', 'status', 'updatedAt', 'blockerReason', 'description'];
    for (const field of fields) if (typeof item[field] === 'string') record[field] = item[field];
    result[collection].push(record);
  }
  return result;
}

// The caller must supply an authorization-enforcing reader; this is not a fetch/auth client.
export function createSnapshotSource({readAuthorizedSnapshot, now = () => new Date().toISOString()}) {
  if (typeof readAuthorizedSnapshot !== 'function') throw new TypeError('Authorized snapshot reader required');
  return async () => normalizeHubSnapshot(await readAuthorizedSnapshot(), {receivedAt: now()});
}
