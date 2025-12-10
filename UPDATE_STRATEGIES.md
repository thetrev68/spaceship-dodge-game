# PWA Update Strategies

## Current Strategy: Auto-Update (Silent)

Your game uses `registerType: 'autoUpdate'` which provides **silent, automatic updates**.

### How It Works:

- Service worker checks for updates periodically
- Downloads new version in background
- Activates on next page reload/close
- **No user prompts**

### Pros:

- ✅ No interruptions during gameplay
- ✅ Users always get latest version eventually
- ✅ Simple, no UI needed
- ✅ Good for frequent small updates

### Cons:

- ⚠️ User might use old version for hours
- ⚠️ No immediate notification of new features
- ⚠️ Can't force critical security updates

---

## Alternative: Prompt Update Strategy

To **prompt users** when updates are available, you'd need to change the configuration.

### 1. Update vite.config.js

```typescript
VitePWA({
  registerType: 'prompt', // Changed from 'autoUpdate'
  workbox: {
    // ... existing config
  },
});
```

### 2. Add Update UI Component

Create `src/ui/pwaUpdatePrompt.ts`:

```typescript
import { registerSW } from 'virtual:pwa-register';

export function initPWAUpdatePrompt(): void {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Show custom update prompt
      if (confirm('New version available! Reload to update?')) {
        updateSW(true); // Reload and activate new version
      }
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });
}
```

### 3. Initialize in main.ts

```typescript
import { initPWAUpdatePrompt } from '@ui/pwaUpdatePrompt';

// In your initialization code:
initPWAUpdatePrompt();
```

### 4. Custom Update UI Example

Instead of `confirm()`, create a better UI:

```typescript
function showUpdateBanner(): void {
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.innerHTML = `
    <div class="update-banner">
      <p>🎮 New version available!</p>
      <button id="update-now">Update Now</button>
      <button id="update-later">Later</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('update-now')?.addEventListener('click', () => {
    updateSW(true);
  });

  document.getElementById('update-later')?.addEventListener('click', () => {
    banner.remove();
  });
}
```

---

## Recommended Strategy for Your Game

For **Spaceship Dodge**, I recommend **keeping autoUpdate** because:

1. **Gaming Context**: Players don't want interruptions mid-game
2. **Frequent Updates**: You're actively developing, silent updates are better
3. **No Critical Data**: Game state is local, no sync issues
4. **Simple UX**: One less thing for users to think about

### When to Use Prompt Instead:

- ✅ Critical bug fixes that need immediate deployment
- ✅ Multiplayer games with version compatibility
- ✅ Games with server-side state that might break
- ✅ Major feature releases you want to announce

---

## Forcing Immediate Updates

If you need to force an immediate update (rare):

### 1. Skip Waiting

```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    skipWaiting: true, // Activate immediately
    clientsClaim: true, // Take control of clients
  },
});
```

⚠️ **Warning**: This can interrupt active users mid-game!

### 2. Programmatic Update

```typescript
// Check for updates on game over screen
navigator.serviceWorker.getRegistration().then((reg) => {
  reg?.update();
});
```

---

## Testing Updates Locally

### 1. Build initial version:

```bash
npm run build
npm run preview
```

### 2. Install PWA in browser

### 3. Make changes to code

### 4. Build again:

```bash
npm run build
```

### 5. Refresh preview server

### 6. Watch console:

- autoUpdate: Silent update, reload to see changes
- prompt: Should see update prompt

---

## Update Frequency

With `autoUpdate`, service worker checks for updates:

- On page load/reload
- Every ~24 hours (browser dependent)
- When navigating to PWA from external link

---

## Cache Invalidation

Updates automatically invalidate old cache:

- New service worker deletes old cached files
- Downloads fresh copies of changed files
- Workbox handles versioning automatically

---

## Best Practices

1. **Version your builds**: Add version to manifest or UI
2. **Test updates**: Always test in local PWA before deploying
3. **Monitor service worker**: Check Application → Service Workers in DevTools
4. **Clear old caches**: Workbox does this automatically
5. **Announce updates**: Use GitHub releases or changelog

---

## Current Recommendation

**Keep `autoUpdate` for now.** It provides the best user experience for your game type.

If you later need user prompts, you can easily switch to `prompt` mode and add UI.
