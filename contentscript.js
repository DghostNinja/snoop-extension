// contentscript.js

const commonParams = ["redirect", "url", "next", "return", "goto"];
let found = [];

// Function to check a URL for redirect parameters
function checkURL(url, source) {
    try {
        const parsedUrl = new URL(url);
        commonParams.forEach(param => {
            if (parsedUrl.searchParams.has(param)) {
                found.push({
                    link: url,
                    param: param,
                    value: parsedUrl.searchParams.get(param),
                    owner: parsedUrl.hostname,
                    source: source
                });
            }
        });
    } catch (e) {
        console.error("Invalid URL:", url);
    }
}

// 1. **Check current page URL**
checkURL(window.location.href, "Page URL");

// 2. **Check all anchor links**
document.querySelectorAll("a[href]").forEach(anchor => {
    checkURL(anchor.href, "Anchor Link");
});

// 3. **Check form actions (Forms might contain redirect parameters)**
document.querySelectorAll("form[action]").forEach(form => {
    checkURL(form.action, "Form Action");
});

// 4. **Check inline JavaScript and scripts for possible redirect parameters**
document.querySelectorAll("script").forEach(script => {
    if (script.src) {
        checkURL(script.src, "Script Source");
    } else if (script.textContent) {
        commonParams.forEach(param => {
            const regex = new RegExp(`\\b${param}\\b\\s*[=:]\\s*["']([^"']+)["']`, "gi");
            let match;
            while ((match = regex.exec(script.textContent)) !== null) {
                found.push({
                    link: window.location.href,
                    param: param,
                    value: match[1],
                    owner: window.location.hostname,
                    source: "Inline Script"
                });
            }
        });
    }
});

// 5. **Check hidden input fields for potential redirect params**
document.querySelectorAll("input[type='hidden']").forEach(input => {
    if (commonParams.includes(input.name)) {
        found.push({
            link: window.location.href,
            param: input.name,
            value: input.value,
            owner: window.location.hostname,
            source: "Hidden Input Field"
        });
    }
});

// **Store results only if detection is enabled**
chrome.storage.local.get("toggleState", (data) => {
    if (data.toggleState) {
        chrome.storage.local.get({ redirectScanResults: [] }, (storedData) => {
            const merged = storedData.redirectScanResults.concat(found);
            chrome.storage.local.set({ redirectScanResults: merged });
        });
    }
});

