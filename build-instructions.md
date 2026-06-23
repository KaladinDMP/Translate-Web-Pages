# Build Instructions

## The short version

You don't need a build step to use or develop the extension. Load the `src/` folder directly as an unpacked extension and it works as-is.

---

## Loading for development (no build needed)

1. Clone the repo:
   ```
   git clone https://github.com/kaladindmp/translate-web-pages.git
   ```
2. Open Chrome, Edge, or Brave and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked** and select the `src/` folder

The extension loads immediately. Any edits to files in `src/` take effect after clicking the reload button on the extensions page.

---

## Building a release zip (unpacked)

This produces the same zip the GitHub Actions release workflow generates — a zip you can share that anyone can load via *Load unpacked*.

**Prerequisites:** Node.js 18+ and npm

```bash
npm install
VERSION=0.0.6   # replace with your version
cd src && zip -r -X "../TWP-${VERSION}-unpacked.zip" . -x '*.DS_Store'
```

---

## Building a signed .crx

A signed `.crx` lets users install without enabling Developer mode (by dragging it onto the extensions page).

**Prerequisites:** Node.js 18+

```bash
npm install

# Generate a signing key (only needed once — save this for future releases)
openssl genrsa -out key.pem 2048

# Build the crx
node -e "
const crx3 = require('crx3');
crx3(['src/manifest.json'], {
  keyPath: 'key.pem',
  crxPath: 'TWP-0.0.6.crx',
}).then(() => console.log('Done')).catch(console.error);
"
```

**Keep `key.pem` safe.** Chrome ties the extension ID to the key — if you lose it, the ID changes and existing installs won't update. If you're using the GitHub Actions release workflow, save the key as the `CRX_PRIVATE_KEY` repository secret.

---

## Using the release workflow (recommended)

The easiest way to cut a release is through GitHub Actions:

1. Go to your repo → **Actions** → **Release** → **Run workflow**
2. Enter the version number (e.g. `0.0.6`)
3. Click **Run workflow**

The workflow will:
- Pull commit messages since the last release as the changelog
- Inject a dated changelog entry into the in-app release notes
- Bump the version in `manifest.json` and `package.json`
- Build both the unpacked zip and the signed `.crx`
- Publish a GitHub Release with all assets attached

See the [readme](readme.md) for how to set up the `CRX_PRIVATE_KEY` secret for a stable extension ID across releases.

---

## About polyfill.js

`src/lib/polyfill.js` is a precompiled bundle of core-js polyfills committed to the repo. You do **not** need to rebuild it unless you want to change which polyfills are included. If you do:

```bash
npm install
npm run polyfill
```

This is rarely needed — the bundled version covers everything the extension uses.
