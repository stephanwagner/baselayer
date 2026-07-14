(() => {
  // themes/baselayer/src/js/service-worker/offline-page.js
  var FALLBACK_HTML = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Offline</title></head><body><p>Offline</p></body></html>';
  function pickOfflineHtml() {
    const map = self.__BL_OFFLINE_HTML__;
    const pref = self.__BL_OFFLINE_LANG__;
    if (!map || typeof map !== "object") {
      return FALLBACK_HTML;
    }
    if (pref === "de" && typeof map.de === "string" && map.de.trim() !== "") {
      return map.de;
    }
    if (typeof map.en === "string" && map.en.trim() !== "") {
      return map.en;
    }
    return FALLBACK_HTML;
  }
  function handleOfflineNavigation(event) {
    if (event.request.method !== "GET" || event.request.mode !== "navigate") {
      return false;
    }
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(pickOfflineHtml(), {
          status: 503,
          statusText: "Offline",
          headers: {
            "Content-Type": "text/html; charset=utf-8"
          }
        });
      })
    );
    return true;
  }

  // themes/baselayer/src/js/service-worker/index.js
  self.addEventListener("install", () => {
    self.skipWaiting();
  });
  self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
  });
  self.addEventListener("fetch", (event) => {
    if (handleOfflineNavigation(event)) {
      return;
    }
  });
})();
//# sourceMappingURL=service-worker.js.map
