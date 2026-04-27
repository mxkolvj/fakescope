// Reserved for background tasks (cache invalidation, alarms).
// Today the popup talks to the backend directly via chrome.scripting.executeScript.
chrome.runtime.onInstalled.addListener(() => {
  console.log('FakeScope installed');
});

export {};
