# Zhixu Rokid

A Rokid companion for concise project progress and blocker reports.

## Prototype status

This is a **synthetic-data prototype**, not a deployed or authenticated Zhixu integration. It includes an AIUI Page and persistent 1x2 Widget source, a shared report model, visible-lifetime refresh controller, and browser preview. The manifest requests no permissions. There are no embedded credentials, real project records, background workers, push subscriptions, or production endpoints.

Implemented and testable locally:

- Separate running tasks and blocked tasks/features/issues, grouped by known project context.
- Deterministic ordering, bounded text, pagination, update timestamp and empty state.
- Coalesced refresh, repeat-safe attach/detach, ignored late responses, stale cached report on transient failure.
- Mock invalidation events while visible; hidden components do not poll.

**Not implemented/verified:** real account binding, live snapshot API, cloud notification integration, runtime compilation/packaging, hardware input/layout, sleep/wake battery behavior or on-device persistent placement. A Widget remaining in layout is not a guarantee of always-on rendering or background connectivity. The browser preview is a separate renderer using the same core model; it is not an AIUI emulator.

## Run

Use Node.js 22 or later.

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run preview
# Open http://127.0.0.1:4173
npx playwright install chromium
npm run test:browser
```

The PR workflow runs isolated tests and Chromium preview checks. It does not publish, deploy or use secrets.

## AIUI source

The application root is `aiui/`. The Widget uses `onCreate/onAttach/onDetach/onDestroy`; the Page maps the same controller to `onLoad/onShow/onHide/onUnload`. Load through an official AIUI development environment compatible with the documented Widget API. No package is claimed device-ready until the checklist in `docs/ACCEPTANCE.md` is completed.

See [contract](docs/CONTRACT.md), [acceptance](docs/ACCEPTANCE.md) and [official capability evidence](docs/FEASIBILITY.md).
