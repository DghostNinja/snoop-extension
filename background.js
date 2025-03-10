// background.js
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ toggleState: false, redirects: [] });
});

chrome.webRequest.onBeforeRedirect.addListener(
    (details) => {
        // Ensure both the original URL and the redirect URL exist
        if (!details.url || !details.redirectUrl) return;
        
        chrome.storage.local.get("toggleState", (data) => {
            if (data.toggleState) {
                try {
                    // Create a URL object from the original URL
                    const originalUrl = new URL(details.url);
                    
                    // Define common parameters used in open redirect vulnerabilities
                    const commonParams = ["redirect", "url", "next", "return", "goto"];
                    let foundParams = [];
                    
                    // Check if any of these parameters exist in the original URL's query string
                    for (const param of commonParams) {
                        if (originalUrl.searchParams.has(param)) {
                            foundParams.push(param);
                        }
                    }
                    
                    // If no common redirect parameters are found, exit early
                    if (foundParams.length === 0) return;
                    
                    // For each found parameter, process its value
                    foundParams.forEach((param) => {
                        const paramValue = originalUrl.searchParams.get(param);
                        // Ensure the parameter has a non-empty value
                        if (!paramValue) {
                            console.warn(`Parameter '${param}' has no value in URL: ${details.url}`);
                            return;
                        }
                        try {
                            // Construct the redirect URL (handles relative URLs using originalUrl as base)
                            const redirectUrl = new URL(paramValue, originalUrl.origin);
                            
                            // Only log if the redirect URL's hostname differs from the original
                            if (redirectUrl.hostname !== originalUrl.hostname) {
                                chrome.storage.local.get({ redirects: [] }, (result) => {
                                    let redirects = result.redirects || [];
                                    redirects.push({ 
                                        from: details.url, 
                                        param: param, 
                                        to: redirectUrl.href 
                                    });
                                    // Limit stored redirects to 50 entries
                                    if (redirects.length > 50) {
                                        redirects.shift();
                                    }
                                    chrome.storage.local.set({ redirects });
                                    chrome.runtime.sendMessage({ updatePopup: true });
                                });
                            }
                        } catch (e) {
                            console.error(`Invalid URL in parameter '${param}': ${paramValue}`);
                        }
                    });
                } catch (error) {
                    console.error("Error processing redirect:", error);
                }
            }
        });
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);

