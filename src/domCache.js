// domCache.js
// Utility for caching DOM elements to avoid repeated getElementById calls

class DOMCache {
  constructor() {
    this.cache = new Map();
    this.defaultElements = [
      'gameCanvas',
      'starfieldCanvas', 
      'startOverlay',
      'pauseOverlay',
      'levelTransitionOverlay',
      'gameOverOverlay',
      'startButton',
      'restartButton',
      'continueButton',
      'quitButton',
      'levelUpMessage',
      'currentLevelInfo',
      'currentScoreInfo',
      'livesInfoStart',
      'livesInfoLevel',
      'livesInfoPause',
      'finalScore',
      'tapToContinueMobile',
      'pauseResumeMessage',
      'desktopControlHint',
      'startHint',
      'mobilePauseBtn'
    ];
  }

  // Get element from cache or query DOM and cache it
  get(id) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    const element = document.getElementById(id);
    if (element) {
      this.cache.set(id, element);
    }
    
    return element;
  }

  // Pre-cache common elements
  preCache() {
    this.defaultElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        this.cache.set(id, element);
      }
    });
  }

  // Clear cache (useful for SPA navigation or cleanup)
  clear() {
    this.cache.clear();
  }

  // Get multiple elements at once
  getMultiple(ids) {
    const elements = {};
    ids.forEach(id => {
      elements[id] = this.get(id);
    });
    return elements;
  }

  // Check if element exists and is visible
  isVisible(id) {
    const element = this.get(id);
    return element && element.offsetParent !== null;
  }

  // Get element with fallback
  getWithFallback(id, fallbackValue = null) {
    return this.get(id) || fallbackValue;
  }
}

// Create singleton instance
export const domCache = new DOMCache();

// Export convenience functions
export const getCanvas = () => domCache.get('gameCanvas');
export const getStarfieldCanvas = () => domCache.get('starfieldCanvas');
export const getOverlay = (name) => domCache.get(`${name}Overlay`);
export const getButton = (name) => domCache.get(`${name}Button`);

export default domCache;