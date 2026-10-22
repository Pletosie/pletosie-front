/* Push only: no offline cache of accounts, conversations or purchases. */
self.addEventListener("install", (event) =>
  event.waitUntil(self.skipWaiting()),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {}
  let url = "/compte";
  try {
    const target = new URL(data.url || url, self.location.origin);
    if (target.origin === self.location.origin)
      url = target.pathname + target.search;
  } catch {}
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(data.title || "Pletosie", {
        body: data.body || "Une nouvelle information vous attend.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: data.id || "pletosie",
        data: { url },
        renotify: false,
      });
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows)
        client.postMessage({ type: "PLETOSIE_PUSH", id: data.id });
    })(),
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const target = new URL(
        event.notification.data?.url || "/compte",
        self.location.origin,
      );
      if (target.origin !== self.location.origin) return;
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows) {
        if (
          new URL(client.url).origin === target.origin &&
          "navigate" in client
        ) {
          await client.navigate(target.href);
          await client.focus();
          return;
        }
      }
      await self.clients.openWindow(target.href);
    })(),
  );
});
