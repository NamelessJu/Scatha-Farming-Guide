
// Bump either of these to invalidate caches when changes are made
const CACHE_GUIDE = 'guide-v4';
const CACHE_PAGE = 'page-v4';

const BASE_PATH = '/Scatha-Farming-Guide/';


function getCacheName(urlString) {
    const localPath = getLocalPath(urlString);
    console.log(`${urlString} -> Local path: ${localPath}`);
    if (localPath == null) return null;

    if (
        localPath.endsWith('LICENSE') || localPath == 'README.md'
    ) return null;

    if (
        localPath == 'guide.md' || localPath.startsWith('assets/guide/')
    ) return CACHE_GUIDE;

    if (
        ['', 'index.html', 'manifest.json']
        .includes(localPath)
    ) return CACHE_PAGE;
    if (
        localPath.startsWith('assets/')
            && !localPath.startsWith('assets/images/pet-drop/')
            && !localPath.startsWith('assets/images/_original/')
        || localPath.startsWith('src/')
    ) return CACHE_PAGE;

    return null;
}

function getLocalPath(urlString) {
    const url = new URL(urlString);
    let path = url.pathname;

    if (url.hostname != 'localhost' && url.hostname != '127.0.0.1') {
        let basePath = BASE_PATH;
        if (basePath.endsWith('/')) basePath = basePath.substring(0, basePath.length - 1);
        if (!path.startsWith(basePath)) return null;
        path = path.substring(basePath.length);
    }

    if (path.startsWith('/')) path = path.substring(1);
    return path;
}


self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {

    const currentValidCaches = [CACHE_GUIDE, CACHE_PAGE];

    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => !currentValidCaches.includes(key)).map(key => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});

self.addEventListener('fetch', event => {

    const cacheName = getCacheName(event.request.url);

    console.log(`${event.request.url} -> Cache: ${cacheName}`);

    if (cacheName != null) {
        event.respondWith(caches.open(cacheName).then(cache =>
            cache.match(event.request).then(cached => {
                console.log(`[Cache ${cacheName}] ${cached ? 'Found in cache' : 'NEW (added to cache)'}: ${event.request.url}`);

                if (cached) return cached;

                return fetch(event.request).then(response => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
        ));
    }
    else event.respondWith(fetch(event.request));
});