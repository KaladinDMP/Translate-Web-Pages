"use strict";

// Service worker entry point for Manifest V3.
// Loads all background scripts in the same order as the MV2 background page did.
importScripts(
  "/lib/polyfill.js",
  "/lib/checkedLastError.js",
  "/lib/stuff.js",
  "/lib/languages.js",
  "/lib/config.js",
  "/lib/platformInfo.js",
  "/lib/i18n.js",
  "/background/translationCache.js",
  "/background/translationService.js",
  "/background/textToSpeech.js",
  "/background/background.js"
);
