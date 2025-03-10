document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggleButton");
    const redirectList = document.getElementById("redirectList");

    // Load toggle state
    chrome.storage.local.get("toggleState", (data) => {
        toggleButton.checked = data.toggleState || false;
    });

    // Toggle switch logic
    toggleButton.addEventListener("change", () => {
        const newState = toggleButton.checked;
        chrome.storage.local.set({ toggleState: newState });

        if (!newState) {
            chrome.storage.local.set({ redirects: [] });
            redirectList.innerHTML = "";
        }
    });

    // Function to update redirect list
    function updateRedirects() {
        chrome.storage.local.get("redirects", (data) => {
            redirectList.innerHTML = "";
            if (data.redirects) {
                data.redirects.forEach((redirect) => {
                    const li = document.createElement("li");
                    li.textContent = `Redirected: ${redirect.url} → ${redirect.redirectedTo}`;
                    redirectList.appendChild(li);
                });
            }
        });
    }

    // Load existing redirects
    updateRedirects();

    // Listen for updates from background.js
    chrome.runtime.onMessage.addListener((message) => {
        if (message.updatePopup) {
            updateRedirects();
        }
    });
});

