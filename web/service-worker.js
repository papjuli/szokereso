self.addEventListener('install', function(event) { console.log("Install in service worker"}));
self.addEventListener('fetch', function(event) { console.log("Fetch in service worker")});
