# Authorized snapshot adapter contract

`buildReport` consumes a complete snapshot with arrays `projects`, `tasks`, `features`, `issues`, and optional ISO `updatedAt`. Each record contains its source ID, project ID, title, status, update time and an optional `blockerReason` or description. IDs are scoped by entity kind. Unknown project records are excluded, but this is not a substitute for server authorization. Collect every page of each collection before producing a complete snapshot; a partial response must fail rather than look like an empty report.

The MVP adapter returns synthetic data only. A future backend must authenticate the device, enforce account ownership server-side, redact unsuitable content, rate-limit access, and expose a bounded read-only report response. Do not ship a browser/admin/MCP token inside the glasses bundle. Binding, revocation, account switching and token expiry must clear memory/cache and invalidate outstanding reads. No live API route is invented here.

The controller stores only in-memory reports and never persists private reports. It accepts a Promise-returning source and suppresses results from detached lifetimes. Network adapters must additionally abort requests where supported and use a timeout; the demo resolves immediately. Refresh runs while visible, not inside an Agent Worker. One request may be in flight per visible lifetime; changing lifetime may leave an old source request completing, but its response cannot publish.

`invalidate()` models a signal to re-read, not trusted report data. A real server notification must contain no private report text or secrets and must not grant authorization. A device receiving or selecting a notification still fetches through the authorized source. Duplicate events coalesce. The prototype does not subscribe to any push service or claim silent Widget updates in the background.

Invalidations received during an in-flight refresh currently coalesce with that refresh. A newer snapshot may therefore wait until the next visible 60-second refresh. A live adapter should add a dirty-flag follow-up refresh if stronger freshness is required. This demo implements no live push transport.

## Hub snapshot compatibility (2026-11-13)

The actual Zhixu server `HubService.snapshot()` returns `{entities, requests, history, actions}`, not the grouped arrays consumed by `buildReport`. `normalizeHubSnapshot` now adapts the flat entity list using an explicit field allowlist and excludes unrelated audit/history/proposal data. It rejects incomplete, oversized or ambiguous duplicate inputs. The report timestamp is the receipt time, not a claim that every entity was edited at that time.

`createSnapshotSource({readAuthorizedSnapshot})` is a transport-injected adapter with synthetic contract tests. It does **not** provide live connectivity. The current `/api/snapshot` route is protected by browser session middleware. The existing OAuth bearer token path authenticates `/mcp`, not `/api/snapshot`; copying a browser cookie or embedding an MCP/admin token in the glasses is not an acceptable integration. A separately reviewed device-scoped read-only authorization and redacted report endpoint is still required before connecting real data. Authorization loss/account switching must clear cached reports through the controller's `clear()` method. The Page/Widget remains wired to synthetic data.

Reviewed source: `zcorw/project-release-hub` `server/application/hub.ts` and `server/http/app.ts` on main. This compatibility layer is not an authorization boundary or a substitute for server-side access control.
