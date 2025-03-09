document.addEventListener("DOMContentLoaded", function () {
    const statusElement = document.getElementById("status");
    const toggleButton = document.getElementById("toggle");

    // Load saved state
    chrome.storage.local.get(["enabled"], function (result) {
        if (result.enabled === false) {
            statusElement.textContent = "Disabled";
            statusElement.style.color = "red";
        } else {
            statusElement.textContent = "Active";
            statusElement.style.color = "green";
        }
    });

    // Toggle button functionality
    toggleButton.addEventListener("click", function () {
        chrome.storage.local.get(["enabled"], function (result) {
            const newState = !result.enabled;
            chrome.storage.local.set({ enabled: newState }, function () {
                statusElement.textContent = newState ? "Active" : "Disabled";
                statusElement.style.color = newState ? "green" : "red";
            });

            // Send message to background.js to enable/disable detection
            chrome.runtime.sendMessage({ action: newState ? "enable" : "disable" });
        });
    });
});
