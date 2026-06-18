
# <img src="https://github.com/FilipePS/Traduzir-paginas-web/blob/master/src/icons/icon-128.png" height="50"> TWP - Translate Web Pages (MV3 Fork)

> **This is a fork** of [FilipePS/Traduzir-paginas-web](https://github.com/FilipePS/Traduzir-paginas-web) — one of the best browser translation extensions available.  
> All credit for the original extension goes to **FilipePS** and all contributors.  
> **Manifest V3 migration** by [KaladinDMP](https://github.com/kaladindmp).

---

Translate your page in real time using Google, Bing or Yandex.

## What's different in this fork?

The original extension was Manifest V2, which Chrome/Edge are phasing out (and Firefox is also moving away from). This fork updates the extension to **Manifest V3**, the current extension standard supported by all major browsers.

**Changes made for MV3:**
- `manifest_version` bumped to `3`
- Background page replaced with a **service worker** (`background-sw.js`)
- `browser_action` + `page_action` consolidated into the unified `action` API
- `chrome.browserAction.*` and `chrome.pageAction.*` calls replaced with `chrome.action.*`
- `host_permissions` separated from `permissions` (MV3 requirement)
- `web_accessible_resources` updated to the MV3 object format with `matches`
- Context menu contexts updated (`browser_action`/`page_action` → `action`)
- `matchMedia` guarded for service worker compatibility

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
