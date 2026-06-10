/* ═══════════════════════════════════════════════════════════
   PersonalOps — Service Worker V1
   Basic cache-first for static assets
═══════════════════════════════════════════════════════════ */

const CACHE_NAME = 'personalops-v1-cache-005';
const ASSETS = [
  './',
  './index.html',
  './assets/css/app.css',
  './assets/js/app.js',
  './assets/js/data-store.js',
  './assets/data/users.json',
  './assets/data/professionals.json',
  './assets/data/students.json',
  './assets/data/plans.json',
  './assets/data/subscriptions.json',
  './assets/data/invoices.json',
  './assets/data/payment-events.json',
  './assets/data/notification-rules.json',
  './assets/data/notification-events.json',
  './assets/data/exercises.json',
  './assets/data/workout-library.json',
  './assets/data/workout-templates.json',
  './assets/data/weekly-schedules.json',
  './assets/data/prescribed-workouts.json',
  './assets/data/workout-events.json',
  './assets/data/feedbacks.json',
  './assets/data/assessments.json',
  './assets/data/voice-drafts.json',
  './manifest.webmanifest',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
