'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"main.dart.js": "88cba8215110c93da1933d4833ed4d3c",
"assets/AssetManifest.json": "feb8c48849bb119feb0b838f495acf2f",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "647d60218c575513d514d0e7ce17eafb",
"assets/assets/second.png": "83ef29102beefeeed7fdc302dd7fb342",
"assets/assets/Otapps.jpg": "6fae6e128cf9bd5f6ea0bf699dfb3f6b",
"assets/assets/wasafi1.jpg": "da42d637b2bf7ae0a329caff7f1ec542",
"assets/assets/logo.png": "981940b729373e681c3046c6d158b247",
"assets/assets/music_event.png": "f9a590c3a439c28b9840743a177336ab",
"assets/assets/menu.png": "2235a5e169f22b83b879af70800ae6d6",
"assets/assets/education.png": "293efffbccaab310435aeca4f9555307",
"assets/assets/calender.png": "a0f0e3c5c5dcb8853538bd39e3402e54",
"assets/assets/sports.png": "e862871bad566f37a35a201fff23b5db",
"assets/assets/exclusiveless.jpg": "e7b613f0b1868835412f29537bd525e4",
"assets/assets/wasafi5.jpg": "074c2d08977248bb68c53e84e0ebe15f",
"assets/assets/tileimg.png": "9860588b7f4ffcfcf6107302ddfc964d",
"assets/assets/profilepic.jpg": "c5f48002521b3e42b251ef56e21e0b9a",
"assets/assets/Conf.png": "431b68603cb4fd9014f6a85e6ab84746",
"assets/assets/Otapp.png": "50018278cf891316fcf5ed5138b4058f",
"assets/assets/connect.PNG": "9b75ddd437478a2637b08f98ab806818",
"assets/assets/raya3.jpeg": "34d9732a786827d5ae57631808d22668",
"assets/assets/background.png": "120015ef6c1058433e23be4e3f9e51a0",
"assets/assets/wasafi2.jfif": "5bd0625a93a0e1b01add3bc84788cfe4",
"assets/assets/Otapp1.jpg": "ea6cfa1c2046daaf292888b1beb32568",
"assets/assets/mushi.jpg": "d86b51c5683cec0ff9e1c1fdf5811cda",
"assets/assets/notify.png": "4956d3e9d3616f48b69930a1bb9b5c2d",
"assets/assets/location.png": "2039d9d799a48d3954ae130d8225d4ed",
"assets/assets/concert.png": "60c6a1fec04c166b9fd3c607277c75a4",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"index.html": "968ae639f990adf9a51fd1eff4f2655a",
"/": "968ae639f990adf9a51fd1eff4f2655a",
"version.json": "4c73ed5af6730f8b3a9bf235e0ba9c4e",
"manifest.json": "444e203ab9bb2b940bd7175e6bb5bfed"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
