const CACHE_NAME = "monitoring-board-v1";
const urlsToCache = [
  "/",
  "/monitoring-board.html",
  "/logo.jpg",
  "/manifest.json",
  "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap",
];

// نصب Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache باز شد");
      return cache.addAll(urlsToCache);
    })
  );
});

// فعال‌سازی Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Cache قدیمی پاک شد:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// درخواست‌های شبکه
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // اگر در cache موجود است، آن را برگردان
      if (response) {
        return response;
      }

      // در غیر این صورت، از شبکه دریافت کن
      return fetch(event.request).then((response) => {
        // بررسی اینکه آیا پاسخ معتبر است
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // کپی کردن پاسخ برای cache
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// مدیریت اعلان‌ها
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "بروزرسانی جدید",
    icon: "logo.jpg",
    badge: "logo.jpg",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "مشاهده",
        icon: "logo.jpg",
      },
      {
        action: "close",
        title: "بستن",
        icon: "logo.jpg",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("مانیتورینگ", options));
});

// کلیک روی اعلان
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});
