const CACHE_NAME = 'mission-schach-v1';
const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'manifest.json',
  'css/main.css',
  'js/game.js',
  'js/hints.js',
  'js/solution.js',
  'js/storage.js',
  'js/speech.js',
  'js/ui.js',
  'js/main.js',
  'js/mission-loader.js',
  'js/mission-manager.js',
  'js/missions/rules_track.json',
  'js/missions/strategy_track.json',
  'js/missions/tracks.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

