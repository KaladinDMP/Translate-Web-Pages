
# <img src="https://github.com/FilipePS/Traduzir-paginas-web/blob/master/src/icons/icon-128.png" height="50"> TWP - Translate Web Pages (MV3 Fork)

> **This is a fork** of [FilipePS/Traduzir-paginas-web](https://github.com/FilipePS/Traduzir-paginas-web) — one of the best browser translation extensions available.  
> All credit for the original extension goes to **FilipePS** and all contributors.  
> **Manifest V3 migration** by [KaladinDMP](https://github.com/kaladindmp).

---

Translate your page in real time using Google, Bing or Yandex.

## What's different in this fork?

The original extension was Manifest V2, which Chrome/Edge are phasing out (and Firefox is also moving away from). This fork updates the extension to **Manifest V3**, the current extension standard supported by all major browsers.

> **Target:** This MV3 build is for **Chromium browsers (Chrome / Edge / Brave)**. Firefox does not yet support extension service workers, so it would need a separate event-page build — see *Known limitations* below.

**Changes made for MV3:**
- `manifest_version` bumped to `3`
- The two separate manifests (`manifest.json` for Firefox + `chrome_manifest.json` for Chrome) were **unified into a single MV3 `manifest.json`**
- Persistent background page replaced with a **service worker** (`background-sw.js`) that `importScripts()` the existing background scripts
- A small `fetch`-based **`XMLHttpRequest` shim** (`lib/xhrShim.js`) is loaded first in the service worker, since Chrome MV3 service workers don't provide `XMLHttpRequest` (the translation/auth/TTS code relies on it). The shim only activates where `XMLHttpRequest` is missing, so native XHR is used wherever it exists
- Bing's response parser was rewritten to not use `DOMParser` (unavailable in a service worker)
- `browser_action` + `page_action` consolidated into the unified `action` API
- `chrome.browserAction.*` and `chrome.pageAction.*` calls replaced with `chrome.action.*`
- Keyboard shortcuts changed from `Ctrl+Alt+…` to `Alt+…` — Chrome rejects `Ctrl+Alt` combinations
- Dynamic toolbar icon uses SVG on Firefox (theme-aware) and PNG on Chrome (which doesn't support SVG action icons)
- `host_permissions` separated from `permissions` (MV3 requirement)
- `web_accessible_resources` updated to the MV3 object format with `matches`
- Context menu contexts updated (`browser_action`/`page_action` → `action`)
- `matchMedia` and `AudioContext`/DOM references guarded for service worker compatibility

### Known limitations
- **Text-to-speech** audio playback uses DOM APIs (`Audio`, `AudioContext`) that don't exist in a service worker. It does not play audio under Chrome MV3 without an offscreen document (a possible future addition). Page/text translation is unaffected.
- **Firefox**: this single manifest uses `background.service_worker`, which Firefox doesn't support yet. A Firefox build would need a `background.scripts` event-page manifest.

## Releases

A GitHub Actions workflow (**Actions → Release → Run workflow**) builds versioned releases on demand:
1. You enter a version (e.g. `1.0.0`)
2. It rewrites the version in `manifest.json` and `package.json`, commits and tags `v<version>`
3. It builds an **unpacked** zip (`TWP-<version>-unpacked.zip`) and a **packed** `.crx` (`TWP-<version>.crx`)
4. It publishes a GitHub Release with those assets

To keep a stable extension ID across releases, add your signing key as a repository secret named `CRX_PRIVATE_KEY`. If you don't, the workflow generates one and attaches it to the release so you can reuse it.

## Original Project

**Author:** FilipePS  
**Original repo:** https://github.com/FilipePS/Traduzir-paginas-web  
**License:** Same as original (see LICENSE file)

## Install

Load the `src/` folder as an unpacked extension in Chrome/Edge/Brave (developer mode), or Firefox (about:debugging).

## Screenshots
| Menu 1 | Menu 2 | Translated |
| :--: | :--: | :--: |
| <img src="https://addons.mozilla.org/user-media/previews/full/258/258434.png" height="200"> | <img src="https://addons.mozilla.org/user-media/previews/full/258/258435.png" height="200"> | <img src="https://addons.mozilla.org/user-media/previews/full/258/258436.png" height="200"> |

## Contributing

- To help translate the extension UI use [Crowdin](https://crowdin.com/project/translate-web-pages).

## Build instructions
- See [build-instructions.md](build-instructions.md) for build steps.

## FAQ

**What can this extension do?**

Your current page is translated without opening new tabs. You can change the translation language, set auto-translate, and switch between translation engines.

**Why does it need access to all websites?**

To translate any website the extension must read and modify the page text. That requires broad host access.

**How are pages translated?**

Using Google, Bing, or Yandex translation APIs (your choice).

**Privacy?**

No data is collected by the extension. Page content is sent to whichever translation service you select.

**Limitations**

Some pages (e.g. `support.mozilla.org`) cannot be translated for browser security reasons.
