const isFirefox = typeof browser !== "undefined";
const webRequest = isFirefox ? browser.webRequest : chrome.webRequest;

// Function to handle web requests
function detectOpenRedirect(details) {
    let url = new URL(details.url);
    let redirectParams = ["redirect", "url", "next", "return", "returnTo", "destination", "goto"];

    for (let param of redirectParams) {
        if (url.searchParams.has(param)) {
            console.warn(`[!!] Possible Open Redirect Detected: ${details.url}`);
        }
    }
}

// Function to enable or disable detection
function updateListener(enabled) {
    try {
        webRequest.onBeforeRequest.removeListener(detectOpenRedirect);
    } catch (e) {}

    if (enabled) {
        webRequest.onBeforeRequest.addListener(
            detectOpenRedirect,
            { urls: ["<all_urls>"] },
            isFirefox ? [] : ["blocking"]
        );
    }
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "enable") {
        chrome.storage.local.set({ enabled: true }, () => updateListener(true));
    } else if (message.action === "disable") {
        chrome.storage.local.set({ enabled: false }, () => updateListener(false));
    }
});

// Load stored state on startup
chrome.storage.local.get(["enabled"], function (result) {
    updateListener(result.enabled !== false); // Default to enabled
});
