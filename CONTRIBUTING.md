# Contributing

Thanks for helping. Keep the promise of the project: **no uploads, no tracking, no third-party network calls at runtime.**

## Setup

```sh
git clone https://github.com/surajrajput1024/toolbox.git && cd toolbox
npm ci
npm test
npm run serve   # http://localhost:8080
```

Node 20+. Browser tests (`npm run test:e2e`) need Chrome; set `CHROME_PATH` to its binary if it is not found.

## Layout

| Path | Purpose |
|---|---|
| `index.html`, `css/`, `js/core.js` | App shell, styles, helpers (`TB`) |
| `js/tools.js` | Tool registry (metadata, English and Hindi names) |
| `js/tools/*.js` | Tool implementations, loaded lazily by module |
| `lib/` | Pure logic with no DOM (`logic.js`, `compress.js`, `presets.js`) |
| `test/` | `logic.test.js` (fast), `e2e.js` and `site.js` (browser) |
| `tools/build_site.js` | Generates the deployable site into `dist/` |

## Add a tool (one module + one test + one entry)

1. **Entry:** add a `T(id, cat, icon, en, hi, de, dh, keywords)` line in `js/tools.js`. Always give English and Hindi text.
2. **Module:** in the module for its category (`calc`, `dev`, `image`, `pdf`, `text`) add `TB.register('<id>', (el) => { ... })`. Use the helpers in `js/core.js` (`h`, `tr`, `field`, `num`, `seg`) so UI and bilingual text stay consistent.
3. **Test:** put the computation in `lib/logic.js` as a pure function and assert it in `test/logic.test.js`.
4. Run `npm test`, then `npm run test:e2e` if you touched the UI. The build creates the tool's own page automatically.

## Exam presets

Edit `lib/presets.js`. Set `verified: true` only when the numbers were read from the official notice, and list that notice URL in `src` with the date in `checked`. Unverified presets show a warning to users.

## Code style

- Plain browser JavaScript, `'use strict'`, no frameworks, no bundler, no new runtime dependencies. Libraries are vendored in `vendor/` and recorded in `LICENSES.md`.
- Never send user data over the network. No `fetch`, XHR or beacons with user content.
- Handle bad input with a friendly message, not a thrown error. Keep tools usable at 360 px width, in dark mode, and by keyboard.
- Small functions, comments only for the why.

## Pull request checklist

- [ ] `npm test` passes (and `npm run test:e2e` for UI changes)
- [ ] Hindi and English text both provided
- [ ] No network calls with user data; no new tracking
- [ ] Test added for new logic
- [ ] Presets: official notice link and `verified` set honestly
- [ ] Screenshot attached for UI changes

Commit messages: short, imperative ("Add GST reverse calculation").

By contributing you agree your work is released under the [MIT license](LICENSE). Be kind: see the [Code of Conduct](CODE_OF_CONDUCT.md).
