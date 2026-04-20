# `@soundrussian/interop`

Drop-in browser interop helpers for pages that need a global `window.AsgInterop`.

## Install

```bash
npm install @soundrussian/interop
```

## CDN usage

Load the browser bundle from a CDN and it will initialize `window.AsgInterop` on page load.

```html
<script src="https://unpkg.com/@soundrussian/interop"></script>
```

```html
<script src="https://cdn.jsdelivr.net/npm/@soundrussian/interop"></script>
```

After the script loads:

```js
window.AsgInterop.getCurrentUrl();
window.AsgInterop.getReferrer();
```

## Bundler usage

Import the package for its side effect. Your final browser bundle will initialize the same global at runtime.

```js
import "@soundrussian/interop";

window.AsgInterop.getCurrentUrl();
window.AsgInterop.getReferrer();
```

## Behavior

- `window.AsgInterop.getCurrentUrl()` returns the value of `window.location.href` captured when the package initializes
- `window.AsgInterop.getReferrer()` returns the value of `document.referrer` captured when the package initializes
- Importing or loading the package more than once is safe
- This package is browser-only and may throw if evaluated outside a browser environment

## Notes

Some sites use Content Security Policy rules that block third-party scripts. In those environments, prefer bundling the package into your own assets instead of loading it from a CDN.

## Development

- `npm test` builds the package and runs the test suite
- `dist/` is generated during build and publish, not committed as source
- Release steps are documented in [`RELEASING.md`](./RELEASING.md)
