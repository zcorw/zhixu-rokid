# Rokid capability feasibility review

Reviewed: 2026-11-13. Status: documentation research only; no device validation.

## Repository readiness

The initial review found this repository empty. Following explicit owner authorization, a README-only main baseline was created on 2026-11-13. This feature branch adds a synthetic-data prototype and tests. The repository initialization blocker is resolved; device capability validation is not.

## Receipt camera: feasible subject to device validation

The official AIUI media reference documents both `navigator.mediaDevices.getUserMedia({video:true})` with `new ImageCapture(track).takePhoto()` (returns a Blob), and `wx.media.createCameraContext().takePhoto()` (returns encoded ArrayBuffer data and a MIME type). The latter can return undefined, including on wasm32, so browser-only tests cannot establish camera compatibility.

Declare CAMERA in the application manifest. A declaration is not system consent. Permission queries only read session state. Current documentation requires entering the `_blank` target and disallows capture when application lifetime is `cut`. Do not use old blog examples as the current API contract.

For the first prototype, use a visible user-triggered action, system preview, high quality, and compare telephoto and default framing on representative long receipts. The documented telephoto default is 2016x1512, not a promise for every device. Decode the returned image to record actual dimensions. Always stop all acquired Web media tracks in finally blocks; release decoded bitmaps. Handle denial, unavailable camera, cancellation, capture errors, and retry without duplicate uploads.

Acceptance still required on the user's target device/runtime: permission grant/deny, actual capture, framing/readability, encoding/size, camera release, repeat capture, interrupted connection, upload retries and duplicate prevention. Use synthetic receipts without personal financial information. No real upload or camera permission was requested during this review.

## Project-status Widget: feasible with important lifecycle limits

Official documentation explicitly supports 1x1 and 1x2 Widgets and `placement: persistent` (default) versus overlay. Once added to the layout, a persistent Widget retains its position when overlays open or close. This is not proof of continuously illuminated display or uninterrupted network access while the device sleeps.

Use onAttach to refresh visible data, and onDetach/onDestroy to stop timers and cancel unnecessary work. Cache the latest successful response, show its timestamp/staleness, preserve cached data on transient failure, and prevent overlapping requests. Repeated attach/detach must not create duplicate timers.

Agent Workers are not a durable background networking service: only the open trigger is supported; foreground lifetime lasts while a Page or Widget is open; background lifetime is unsupported. The official worker reference says workers do not expose fetch. Network retrieval should therefore live in the Page/Widget, not an invented always-on worker.

The official cloud notification API can send a message to a bound user's glasses and optionally open a registered Page when selected. Its success response is not documented as proof that a Widget rendered or refreshed. Do not equate notifications with silent Widget data delivery. Notifications require the owning account SK, target account ID, agent ID, and a unique message ID. Keep credentials server-side; do not configure or exercise these credentials as part of this review.

Acceptance still required: supported hardware/runtime version, add-to-layout flow, sleep/wake and detach/reattach behavior, stale/offline presentation, connection recovery, battery impact, notification receipt and user-selected page navigation. No hardware, notification, or battery test has been performed.

## Next bounded steps

1. Continue development through feature branches and draft PRs from the approved baseline.
2. Pin the target AIUI runtime and confirm matching documentation. The reference snapshot below is upstream main, not evidence of the user's installed runtime.
3. Implement mock-backed capture error/retry and Widget lifecycle/cache tests; these can run in CI but do not replace the device acceptance checklist.
4. Perform explicit device acceptance before marking either capability-validation task complete.

## Official evidence

Reference snapshot: yodaos-project/AIUI commit `cf2908bf95359bfa76a04d0f6abde9313b6c92f1`.

- https://github.com/yodaos-project/AIUI/blob/cf2908bf95359bfa76a04d0f6abde9313b6c92f1/documentation/3-api/media/media-capture.en-US.md
- https://github.com/yodaos-project/AIUI/blob/cf2908bf95359bfa76a04d0f6abde9313b6c92f1/documentation/3-api/permissions.en-US.md
- https://github.com/yodaos-project/AIUI/blob/cf2908bf95359bfa76a04d0f6abde9313b6c92f1/documentation/1-framework/open-agent-format/widget.en-US.md
- https://github.com/yodaos-project/AIUI/blob/cf2908bf95359bfa76a04d0f6abde9313b6c92f1/documentation/1-framework/open-agent-format/agent-worker.en-US.md
- https://github.com/yodaos-project/AIUI/blob/cf2908bf95359bfa76a04d0f6abde9313b6c92f1/documentation/5-cloud/notifications.en-US.md
