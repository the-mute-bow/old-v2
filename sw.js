// 22.04.10

const use_cache = true;

// Install event
self.addEventListener('install', async e => {
	console.log('Service worker installed');
	self.skipWaiting();
});

// Activate event
self.addEventListener('activate', async e => {
	console.log('Service worker activated');

	// Delete main cache
	caches.delete('main');

	self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', e => e.respondWith(respond(e)));

async function fetchAndCache(req, cache_name) {
	// Fetch request
	const fetch_res = await fetch(req).catch(e => {
		console.error(req.url, e);
		return null;
	});

	if (use_cache) {
		console.info('Caching', req.url);

		// Open cache and save a cloned result
		const cache = await caches.open(cache_name);
		cache.put(req, fetch_res.clone());
	}

	return fetch_res;
}

async function respond(e) {
	// Try to get response from cache
	const cached_res = await caches.match(e.request);

	// If response is found, return it
	if (cached_res) return cached_res;

	// If request is not found, try to fetch it
	return await fetchAndCache(e.request, 'main');
}
