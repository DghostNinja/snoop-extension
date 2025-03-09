const isFirefox = typeof browser !== "undefined"; // Detect Firefox

const webRequest = isFirefox ? browser.webRequest : chrome.webRequest;

webRequest.onBeforeRequest.addListener(
  function (details) {
    let url = new URL(details.url);
    let redirectParams = ["redirect", "url", "next", "return", "returnTo", "destination", "goto"];

    for (let param of redirectParams) {
      if (url.searchParams.has(param)) {
        console.warn(`[!!] Possible Open Redirect Detected: ${details.url}`);
      }
    }
  },
  { urls: ["<all_urls>"] },
  isFirefox ? [] : ["blocking"] // Firefox doesn't support "blocking"
);
