# Acceptance checklist

## Automated prototype checks

- Model filtering, project isolation, duplicate IDs, malformed snapshots and pagination.
- Repeated attach/detach, overlapping refresh, stale responses after detach and reattach, offline retention and recovery.
- Manifest Widget family and entry consistency (not a compiler check).
- Chromium preview: pagination, offline/reconnect, hidden events, empty state and 360px layout.

## Required before live integration

- Agree and implement the server-side device authorization/report protocol.
- Revoke/account switch while a request is outstanding: no previous-account report must reappear.
- Real snapshot pagination and invalidation: no partial data mislabeled complete.
- Test foreground refresh and notification-selected Page navigation separately from Widget refresh.

## Required on target glasses

Record model, firmware and AIUI version. Compile/package using the official toolchain. Add the persistent Widget to the layout and check actual text clipping, focus/input, pagination and controls. Verify repeated attach/detach, sleep/wake, process restart, offline/reconnect and battery impact. No device availability or permissions were assumed during this prototype.

Do not label home-screen background push supported without a measured, reproducible test. If unavailable, retain a last-known report with timestamp and refresh on Page/Widget attach; use user-selected notification navigation only after separately authorized integration.
