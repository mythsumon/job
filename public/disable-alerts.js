// Complete alert and error modal suppression
(function() {
  'use strict';
  
  // Store original functions
  const originalAlert = window.alert;
  const originalConfirm = window.confirm;
  const originalPrompt = window.prompt;
  
  // Override all alert functions
  window.alert = function() { return undefined; };
  window.confirm = function() { return true; };
  window.prompt = function() { return ''; };
  
  // Prevent error dialogs
  window.addEventListener('error', function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  }, true);
  
  window.addEventListener('unhandledrejection', function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  }, true);
  
  // Override console methods that might trigger alerts
  const originalError = console.error;
  console.error = function(...args) {
    // Silent logging only
    if (typeof originalError === 'function') {
      originalError.apply(console, args);
    }
  };
  
  // Disable React error overlay
  if (typeof window !== 'undefined') {
    window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = null;
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = function() {};
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = function() {};
  }
  
  // Monkey patch fetch to prevent network error alerts
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(function(error) {
      // Silently handle fetch errors
      return Promise.reject(error);
    });
  };
})();