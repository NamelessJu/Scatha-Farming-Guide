
// Bump this to invalidate caches when new versions are released
const CACHE_NAME = 'scatha-farming-guide-v1';

const BASE_PATH = '/Scatha-Farming-Guide/';

function shouldCache(path) {
    if (!path.startsWith(BASE_PATH)) return false;
    path = path.substring(BASE_PATH.length);

    if (
        path.endsWith('LICENSE')
        && path == 'README.md'
    ) return false;

    if ([
            '/',
            '/index.html',
            '/guide.md',
            '/manifest.json'
        ].includes(path)
    ) return true;

    if (path.startsWith('/src/')) return true;

    if (
        path.startsWith('/assets')
        && !path.startsWith('/assets/images/pet-drop/')
        && !path.startsWith('/assets/images/_original/')
    ) return true;

    return false;
}

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(CACHE_NAME).then(cache =>
            cache.match(event.request).then(cached => {
                // console.log(`${cached ? 'Cached' : 'NEW'}: ${event.request.url}`)

                if (cached) return cached;

                return fetch(event.request).then(response => {
                    if (shouldCache(new URL(event.request.url).pathname)) {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                });
            })
        )
    );
});