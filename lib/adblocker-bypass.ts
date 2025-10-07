// Ad-blocker bypass utility
export function createAdBlockerBypass(src: string, title: string) {
  // Create iframe with multiple fallback strategies
  const iframe = document.createElement('iframe');
  
  // Set basic attributes
  iframe.src = src;
  iframe.title = title;
  iframe.frameBorder = '0';
  iframe.allowFullScreen = true;
  iframe.loading = 'lazy';
  
  // Ad-blocker bypass attributes
  iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-forms');
  iframe.setAttribute('referrerPolicy', 'no-referrer-when-downgrade');
  
  // Additional bypass techniques
  iframe.setAttribute('data-src', src); // Backup src
  iframe.setAttribute('data-adblock-bypass', 'true');
  
  // Style to prevent detection
  iframe.style.border = 'none';
  iframe.style.outline = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  
  // Add class to prevent ad-blocker detection
  iframe.className = 'video-player-iframe';
  
  return iframe;
}

// Function to reload iframe if blocked
export function reloadIframe(iframe: HTMLIFrameElement) {
  const src = iframe.src;
  iframe.src = '';
  setTimeout(() => {
    iframe.src = src;
  }, 100);
}

// Check if iframe is blocked by ad-blocker
export function isIframeBlocked(iframe: HTMLIFrameElement): boolean {
  try {
    // Try to access iframe content
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    return !doc || doc.body.innerHTML.includes('blocked') || doc.body.innerHTML.includes('adblock');
  } catch (e) {
    // If we can't access the content, it might be blocked
    return true;
  }
}
