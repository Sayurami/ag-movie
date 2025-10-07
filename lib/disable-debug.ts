// Utility to disable console logs and debugger in production
if (typeof window !== 'undefined') {
  // Remove debugger statements completely
  const originalDebugger = window.debugger;
  window.debugger = () => {
    // Do nothing - effectively disable debugger
  };

  // Override console methods in production
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {}
    console.warn = () => {}
    console.error = () => {}
    console.debug = () => {}
    console.info = () => {}
  }

  // Remove any existing debugger statements from the page
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    if (script.textContent && script.textContent.includes('debugger')) {
      script.textContent = script.textContent.replace(/debugger\s*;?/g, '');
    }
  });

  // Override Function constructor to prevent debugger injection
  const originalFunction = window.Function;
  window.Function = function(...args: any[]) {
    const code = args[args.length - 1];
    if (typeof code === 'string' && code.includes('debugger')) {
      args[args.length - 1] = code.replace(/debugger\s*;?/g, '');
    }
    return originalFunction.apply(this, args);
  } as any;
}
