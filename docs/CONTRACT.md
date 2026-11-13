# Authorized snapshot adapter contract

`buildReport` consumes a complete snapshot with arrays `projects`, `tasks`, `features`, `issues`, and optional ISO `updatedAt`. Each record contains its source ID, project ID, title, status, update time and an optional `blockerReason` or description. IDs are scoped by entity kind. Unknown project records are excluded, but this is not a substitute for server authorization. Collect every page of each collection before producing a complete snapshot; a partial response must fail rather than look like an empty report.

The MVP adapter returns synthetic data only. A future backend must authenticate the device, enforce account ownership server-side, redact unsuitable content, rate-limit access, and expose a bounded read-only report response. Do not ship a browser/admin/MCP token inside the glasses bundle. Binding, revocation, account switching and token expiry must clear memory/cache and invalidate outstanding reads. No live API route is invented here.

The controller stores only in-memory reports and never persists private reports. It accepts a Promise-returning source and suppresses results from detached lifetimes. Network adapters must additionally abort requests where supported and use a timeout; the demo resolves immediately. Refresh runs while visible, not inside an Agent Worker. One request may be in flight per visible lifetime; changing lifetime may leave an old source request completing, but its response cannot publish.

`invalidate()` models a signal to re-read, not trusted report data. A real server notification must contain no private report text or secrets and must not grant authorization. A device receiving or selecting a notification still fetches through the authorized source. Duplicate events coalesce. The prototype does not subscribe to any push service or claim silent Widget updates in the background.

Invalidations received during an in-flight refresh currently coalesce with that refresh. A newer snapshot may therefore wait until the next visible 60-second refresh. A live adapter should add a dirty-flag follow-up refresh if stronger freshness is required. This demo implements no live push transport.
