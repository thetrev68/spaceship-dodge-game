# PWA (Progressive Web App) Implementation Plan

## Overview

Transform Spaceship Dodge into a fully-featured Progressive Web App that can be installed on mobile home screens and work offline.

## PWA Benefits

### User Experience

- **Add to Home Screen**: One-tap install from browser
- **Native-like Feel**: Runs in standalone mode (no browser UI)
- **Offline Play**: Works without internet connection
- **Fast Loading**: Service worker caching
- **App Store Alternative**: No approval process needed

### Technical

- **Better Performance**: Cached resources load instantly
- **Push Notifications**: (Future) Notify users of updates
- **Background Sync**: (Future) Save high scores offline
- **Auto-updates**: Service worker updates automatically

## Requirements Checklist

### Essential (P0)

- [x] HTTPS deployment (GitHub Pages provides this)
- [ ] Web App Manifest (`manifest.json`)
- [ ] Service Worker for offline functionality
- [ ] App icons (multiple sizes)
- [ ] Proper viewport meta tags
- [ ] Installability criteria met

### Nice-to-Have (P1)

- [ ] Offline fallback page
- [ ] Update notification system
- [ ] Share API integration
- [ ] Persistent high scores (IndexedDB)

### Future (P2)

- [ ] Push notifications for events
- [ ] Background sync for scores
- [ ] App shortcuts for quick actions

## Implementation Steps

### Step 1: Create Web App Manifest

Create `public/manifest.json`:

```json
{
  "name": "Spaceship Dodge",
  "short_name": "SpaceDodge",
  "description": "Dodge and shoot incoming asteroids in this classic arcade-style game",
  "start_url": "/spaceship-dodge-game/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#00ffff",
  "orientation": "any",
  "scope": "/spaceship-dodge-game/",
  "icons": [
    {
      "src": "/spaceship-dodge-game/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/spaceship-dodge-game/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/spaceship-dodge-game/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/spaceship-dodge-game/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/spaceship-dodge-game/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/spaceship-dodge-game/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/spaceship-dodge-game/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/spaceship-dodge-game/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["games", "entertainment"],
  "screenshots": [
    {
      "src": "/spaceship-dodge-game/screenshots/gameplay-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "label": "Gameplay screenshot"
    }
  ]
}
```

### Step 2: Add Manifest to HTML

Update `index.html`:

```html
<head>
  <!-- Existing meta tags -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />

  <!-- PWA Manifest -->
  <link rel="manifest" href="/spaceship-dodge-game/manifest.json" />

  <!-- Theme color for browser UI -->
  <meta name="theme-color" content="#00ffff" />

  <!-- Apple-specific meta tags -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="SpaceDodge" />
  <link rel="apple-touch-icon" href="/spaceship-dodge-game/icons/icon-180x180.png" />

  <!-- Microsoft-specific meta tags -->
  <meta name="msapplication-TileColor" content="#000000" />
  <meta name="msapplication-TileImage" content="/spaceship-dodge-game/icons/icon-144x144.png" />
</head>
```

### Step 3: Create App Icons

Generate icons from a base 512x512 design using a tool like [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator).

**Icon Design Concept**:

```
┌─────────────────────────────┐
│                             │
│         ▲                   │
│        ╱ ╲                  │  Simplified spaceship
│       ╱   ╲                 │  Cyan outline
│      ╱     ╲                │  Black background
│     ╱───────╲               │
│    ╱    ▼    ╲              │
│                             │
└─────────────────────────────┘
```

**Icon sizes needed**:

- 72x72, 96x96, 128x128, 144x144, 152x152 (Android)
- 180x180 (iOS)
- 192x192, 384x384, 512x512 (All platforms)

**Generation script**:

```bash
# Install icon generator
npm install -D @pwa/asset-generator

# Generate all icon sizes
npx pwa-asset-generator public/icon-source.png public/icons \
  --icon-only \
  --background "#000000" \
  --padding "10%"
```

### Step 4: Implement Service Worker

Create `public/service-worker.js`:

```javascript
const CACHE_NAME = 'spaceship-dodge-v1.0.0';
const BASE_PATH = '/spaceship-dodge-game/';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  `${BASE_PATH}`,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}styles/main-tailwind.css`,
  `${BASE_PATH}styles/inline.css`,
  `${BASE_PATH}sounds/bg-music.mp3`,
  `${BASE_PATH}sounds/fire.mp3`,
  `${BASE_PATH}sounds/break.mp3`,
  `${BASE_PATH}sounds/levelup.mp3`,
  `${BASE_PATH}sounds/gameover.mp3`,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force activation immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', event.request.url);
        return cachedResponse;
      }

      // Not in cache, fetch from network and cache it
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Network failed, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match(`${BASE_PATH}offline.html`);
          }
        });
    })
  );
});

// Listen for messages from client (for manual cache updates)
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
```

### Step 5: Register Service Worker

Update `src/core/main.ts`:

```typescript
/**
 * Registers service worker for PWA functionality.
 * Enables offline play and caching.
 */
async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    log.warn('Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}service-worker.js`,
      { scope: import.meta.env.BASE_URL }
    );

    log.info(`Service Worker registered with scope: ${registration.scope}`);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          showUpdateNotification();
        }
      });
    });
  } catch (error) {
    log.error('Service Worker registration failed:', error);
  }
}

/**
 * Shows notification when app update is available.
 */
function showUpdateNotification(): void {
  const notification = document.createElement('div');
  notification.id = 'updateNotification';
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = 'rgba(0, 255, 255, 0.9)';
  notification.style.color = 'black';
  notification.style.padding = '1rem 2rem';
  notification.style.borderRadius = '8px';
  notification.style.zIndex = '1000';
  notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  notification.innerHTML = `
    <p style="margin: 0 0 0.5rem 0; font-weight: bold;">Update Available!</p>
    <button id="updateButton" style="padding: 0.5rem 1rem; cursor: pointer;">
      Reload to Update
    </button>
  `;

  document.body.appendChild(notification);

  document.getElementById('updateButton')?.addEventListener('click', () => {
    navigator.serviceWorker.controller?.postMessage({ action: 'skipWaiting' });
    window.location.reload();
  });
}

// Call in initialization
async function init() {
  // ... existing init code ...
  await registerServiceWorker();
}
```

### Step 6: Create Offline Fallback Page

Create `public/offline.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Spaceship Dodge - Offline</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: black;
        color: #00ffff;
        font-family: 'Inter', sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        text-align: center;
      }
      .offline-container {
        max-width: 400px;
        padding: 2rem;
      }
      h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }
      p {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        opacity: 0.8;
      }
      button {
        padding: 1rem 2rem;
        font-size: 1.125rem;
        background: #00ffff;
        color: black;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
      }
      button:hover {
        background: #00cccc;
      }
    </style>
  </head>
  <body>
    <div class="offline-container">
      <h1>You're Offline</h1>
      <p>Spaceship Dodge requires an internet connection to load new resources.</p>
      <button onclick="window.location.reload()">Retry Connection</button>
    </div>
  </body>
</html>
```

### Step 7: Add Install Prompt

Create `src/ui/pwaInstallPrompt.ts`:

```typescript
/**
 * Handles PWA installation prompt.
 */
let deferredPrompt: Event | null = null;

export function initPWAInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser install prompt
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install button
    showInstallButton();
  });

  // Listen for successful install
  window.addEventListener('appinstalled', () => {
    log.info('PWA installed successfully');
    deferredPrompt = null;
    hideInstallButton();
  });
}

function showInstallButton(): void {
  const installButton = document.createElement('button');
  installButton.id = 'pwaInstallButton';
  installButton.textContent = '📱 Install App';
  installButton.className = 'game-button';
  installButton.style.position = 'fixed';
  installButton.style.top = '20px';
  installButton.style.right = '20px';
  installButton.style.zIndex = '1000';

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    (deferredPrompt as any).prompt();

    // Wait for user choice
    const { outcome } = await (deferredPrompt as any).userChoice;
    log.info(`PWA install outcome: ${outcome}`);

    deferredPrompt = null;
    hideInstallButton();
  });

  document.body.appendChild(installButton);
}

function hideInstallButton(): void {
  const installButton = document.getElementById('pwaInstallButton');
  installButton?.remove();
}
```

### Step 8: Update Vite Configuration

Update `vite.config.ts` to copy service worker:

```typescript
export default defineConfig({
  // ... existing config ...
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Ensure service worker is in root
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'service-worker.js') {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
```

### Step 9: Testing PWA

#### Local Testing:

```bash
# Build production version
npm run build

# Serve with HTTPS (required for service worker)
npx serve -s dist --ssl-cert localhost.pem --ssl-key localhost-key.pem
```

#### Chrome DevTools:

1. Open DevTools → Application tab
2. Check "Manifest" section - verify all data
3. Check "Service Workers" - verify registration
4. Use "Lighthouse" to run PWA audit
5. Aim for 100% PWA score

#### Mobile Testing:

1. Deploy to GitHub Pages
2. Open on mobile browser
3. Look for "Add to Home Screen" prompt (Android)
4. Look for "Add to Home Screen" in share menu (iOS)
5. Install and test offline functionality

### Step 10: iOS Considerations

iOS has limited PWA support, so add these enhancements:

```html
<!-- index.html -->
<head>
  <!-- Prevent iOS auto-zoom on form inputs -->
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
  />

  <!-- iOS splash screens (optional but recommended) -->
  <link
    rel="apple-touch-startup-image"
    href="/spaceship-dodge-game/splash/iphone5.png"
    media="(device-width: 320px)"
  />
  <link
    rel="apple-touch-startup-image"
    href="/spaceship-dodge-game/splash/iphone6.png"
    media="(device-width: 375px)"
  />
  <link
    rel="apple-touch-startup-image"
    href="/spaceship-dodge-game/splash/iphoneplus.png"
    media="(device-width: 414px)"
  />
  <link
    rel="apple-touch-startup-image"
    href="/spaceship-dodge-game/splash/iphonex.png"
    media="(device-width: 375px) and (device-height: 812px)"
  />
  <link
    rel="apple-touch-startup-image"
    href="/spaceship-dodge-game/splash/iphonexr.png"
    media="(device-width: 414px) and (device-height: 896px)"
  />
  <link
    rel="apple-touch-startup-image"
    href="/spaceship-dodge-game/splash/iphonexsmax.png"
    media="(device-width: 414px) and (device-height: 896px)"
  />
  <link
    rel="apple-touch-startup-image"
    href="/spaceship-dodge-game/splash/ipad.png"
    media="(device-width: 768px)"
  />
  <link
    rel="apple-touch-startup-image"
    href="/spaceship-dodge-game/splash/ipadpro1.png"
    media="(device-width: 834px)"
  />
  <link
    rel="apple-touch-startup-image"
    href="/spaceship-dodge-game/splash/ipadpro2.png"
    media="(device-width: 1024px)"
  />
</head>
```

## Implementation Timeline

### Week 1: Foundation

- [x] HTTPS deployment (already on GitHub Pages)
- [ ] Create manifest.json
- [ ] Design and generate app icons
- [ ] Add manifest link to HTML
- [ ] Test manifest in Chrome DevTools

### Week 2: Service Worker

- [ ] Implement basic service worker
- [ ] Add offline fallback page
- [ ] Test caching strategy
- [ ] Register service worker in main.ts
- [ ] Test offline functionality

### Week 3: Polish & Testing

- [ ] Add install prompt UI
- [ ] Create update notification system
- [ ] Generate iOS splash screens
- [ ] Run Lighthouse PWA audit
- [ ] Test on real devices

### Week 4: Deployment

- [ ] Deploy to production
- [ ] Monitor installation metrics
- [ ] Gather user feedback
- [ ] Iterate based on feedback

## Success Metrics

- **Lighthouse PWA Score**: 100/100
- **Install Rate**: Track via analytics
- **Offline Functionality**: 100% of assets cached
- **Update Success Rate**: Monitor update completion
- **User Retention**: Compare installed vs web users

## Maintenance

### Updating the PWA

1. Increment cache version in service-worker.js
2. Deploy updated code
3. Service worker detects changes
4. Users see update notification
5. Click to reload and get latest version

### Cache Strategy

- **Static assets**: Cache-first
- **API calls**: Network-first (future)
- **Images**: Cache-first with network fallback
- **Audio files**: Cache-first (essential for offline)

## Resources

- [PWA Builder](https://www.pwabuilder.com/) - Test and package PWA
- [Workbox](https://developers.google.com/web/tools/workbox) - Advanced service worker library
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) - Icon generation
- [Can I Use - PWA](https://caniuse.com/web-app-manifest) - Browser compatibility

## Next Steps

1. Create `manifest.json` with correct paths
2. Design app icon (512x512 base)
3. Generate all required icon sizes
4. Implement service worker
5. Test locally with HTTPS
6. Deploy and test on mobile devices
