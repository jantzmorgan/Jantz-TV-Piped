const CACHE_NAME = "jantz-tv-piped-cache-v4";

const FILES_TO_CACHE = [
	"./",
	"./index.html",
	"./style.css",
	"./script.js",
	"./manifest.json",
	"./icon-192.PNG",
	"./icon-512.PNG"
];

self.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function(cache) {
			return cache.addAll(FILES_TO_CACHE);
		})
	);
	self.skipWaiting();
});

self.addEventListener("activate", function(event) {
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.map(function(cacheName) {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
	self.clients.claim();
});

self.addEventListener("fetch", function(event) {
	const requestUrl = new URL(event.request.url);

	if (
		requestUrl.hostname.indexOf("googleapis.com") !== -1 ||
		requestUrl.hostname.indexOf("youtube.com") !== -1 ||
		requestUrl.hostname.indexOf("ytimg.com") !== -1 ||
		requestUrl.hostname.indexOf("i.ytimg.com") !== -1 ||
		requestUrl.hostname.indexOf("googlevideo.com") !== -1 ||
		requestUrl.hostname.indexOf("piped") !== -1
	) {
		return;
	}

	if (event.request.method !== "GET") {
		return;
	}

	event.respondWith(
		fetch(event.request)
		.then(function(networkResponse) {
			const responseClone = networkResponse.clone();
			caches.open(CACHE_NAME).then(function(cache) {
				cache.put(event.request, responseClone);
			});
			return networkResponse;
		})
		.catch(function() {
			return caches.match(event.request);
		})
	);
});