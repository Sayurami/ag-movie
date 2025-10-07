// Mobile detection utility
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth < 768;
}

// Mobile-optimized iframe loading
export function createMobileOptimizedIframe(src: string, title: string) {
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = title;
  iframe.frameBorder = '0';
  iframe.allowFullScreen = true;
  iframe.loading = 'lazy';
  
  // Mobile-specific attributes
  if (isMobile()) {
    iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.outline = 'none';
  } else {
    iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen; picture-in-picture');
  }
  
  return iframe;
}
