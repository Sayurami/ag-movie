// Utility to disable console logs in production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {}
  console.warn = () => {}
  console.error = () => {}
  console.debug = () => {}
  console.info = () => {}
}

// Remove debugger statements in production
if (process.env.NODE_ENV === 'production') {
  // Override debugger to prevent it from executing
  window.debugger = () => {}
}
