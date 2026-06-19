"use strict";

/**
 * Minimal XMLHttpRequest shim backed by fetch().
 *
 * Chrome's Manifest V3 background runs in a Service Worker, which does NOT
 * provide XMLHttpRequest (only fetch is available). The translation, auth and
 * text-to-speech code in this extension was written against XMLHttpRequest.
 *
 * To avoid rewriting that proven logic, we install a small XHR-compatible
 * wrapper over fetch. It is ONLY installed when XMLHttpRequest is missing, so
 * Firefox (whose MV3 background is an event page with a native XMLHttpRequest)
 * keeps using the real implementation.
 *
 * Supported surface (only what this extension uses):
 *   open(method, url), setRequestHeader(name, value), send(body),
 *   responseType ("" | "text" | "json" | "blob" | "arraybuffer"),
 *   response, responseText, status, statusText,
 *   getAllResponseHeaders(), getResponseHeader(name),
 *   onload, onerror, onabort, ontimeout, onreadystatechange,
 *   readyState, timeout, addEventListener/removeEventListener.
 */
(function () {
  if (typeof XMLHttpRequest !== "undefined") return;

  const UNSENT = 0;
  const OPENED = 1;
  const HEADERS_RECEIVED = 2;
  const LOADING = 3;
  const DONE = 4;

  class XMLHttpRequestShim {
    constructor() {
      this.UNSENT = UNSENT;
      this.OPENED = OPENED;
      this.HEADERS_RECEIVED = HEADERS_RECEIVED;
      this.LOADING = LOADING;
      this.DONE = DONE;

      this.readyState = UNSENT;
      this.status = 0;
      this.statusText = "";
      this.responseType = "";
      this.response = null;
      this.responseText = "";
      this.responseURL = "";
      this.timeout = 0;
      this.withCredentials = false;

      this.onload = null;
      this.onerror = null;
      this.onabort = null;
      this.ontimeout = null;
      this.onloadend = null;
      this.onreadystatechange = null;

      this._method = "GET";
      this._url = "";
      this._requestHeaders = {};
      this._responseHeaders = null;
      this._listeners = {};
      this._aborted = false;
      this._controller =
        typeof AbortController !== "undefined" ? new AbortController() : null;
    }

    open(method, url) {
      this._method = method || "GET";
      this._url = url;
      this._setReadyState(OPENED);
    }

    setRequestHeader(name, value) {
      this._requestHeaders[name] = value;
    }

    getAllResponseHeaders() {
      if (!this._responseHeaders) return "";
      let out = "";
      this._responseHeaders.forEach((value, key) => {
        out += key + ": " + value + "\r\n";
      });
      return out;
    }

    getResponseHeader(name) {
      if (!this._responseHeaders) return null;
      return this._responseHeaders.get(name);
    }

    addEventListener(type, cb) {
      (this._listeners[type] = this._listeners[type] || []).push(cb);
    }

    removeEventListener(type, cb) {
      const arr = this._listeners[type];
      if (!arr) return;
      const i = arr.indexOf(cb);
      if (i !== -1) arr.splice(i, 1);
    }

    abort() {
      this._aborted = true;
      if (this._controller) this._controller.abort();
      this._dispatch("abort");
    }

    send(body) {
      const init = {
        method: this._method,
        headers: this._requestHeaders,
        signal: this._controller ? this._controller.signal : undefined,
      };
      if (body !== undefined && body !== null) {
        init.body = body;
      }

      let timeoutId = null;
      let timedOut = false;
      if (this.timeout && this.timeout > 0) {
        timeoutId = setTimeout(() => {
          timedOut = true;
          if (this._controller) this._controller.abort();
        }, this.timeout);
      }

      fetch(this._url, init)
        .then(async (resp) => {
          if (timeoutId) clearTimeout(timeoutId);

          this.status = resp.status;
          this.statusText = resp.statusText;
          this.responseURL = resp.url;
          this._responseHeaders = resp.headers;
          this._setReadyState(HEADERS_RECEIVED);
          this._setReadyState(LOADING);

          switch (this.responseType) {
            case "json": {
              const text = await resp.text();
              try {
                this.response = JSON.parse(text);
              } catch (e) {
                this.response = null;
              }
              break;
            }
            case "blob":
              this.response = await resp.blob();
              break;
            case "arraybuffer":
              this.response = await resp.arrayBuffer();
              break;
            case "":
            case "text":
            default: {
              const text = await resp.text();
              this.responseText = text;
              this.response = text;
              break;
            }
          }

          this._setReadyState(DONE);
          this._dispatch("load");
          this._dispatch("loadend");
        })
        .catch((err) => {
          if (timeoutId) clearTimeout(timeoutId);
          this._setReadyState(DONE);
          if (timedOut) {
            this._dispatch("timeout");
          } else if (this._aborted) {
            this._dispatch("abort");
          } else {
            this._dispatch("error");
          }
          this._dispatch("loadend");
        });
    }

    _setReadyState(state) {
      this.readyState = state;
      this._dispatch("readystatechange");
    }

    _dispatch(type) {
      const handler = this["on" + type];
      const event = { type, target: this, currentTarget: this };
      if (typeof handler === "function") {
        try {
          handler.call(this, event);
        } catch (e) {
          console.error(e);
        }
      }
      const arr = this._listeners[type];
      if (arr) {
        arr.slice().forEach((cb) => {
          try {
            cb.call(this, event);
          } catch (e) {
            console.error(e);
          }
        });
      }
    }
  }

  self.XMLHttpRequest = XMLHttpRequestShim;
})();
