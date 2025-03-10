// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const resultsContainer = document.getElementById("results");
  const toggleSwitch = document.getElementById("toggleSwitch");
  const clearLogsBtn = document.getElementById("clearLogs");

  // Load saved toggle state
  chrome.storage.local.get("toggleState", (data) => {
    toggleSwitch.checked = data.toggleState || false;
  });

  // Toggle detection on/off
  toggleSwitch.addEventListener("change", () => {
    const newState = toggleSwitch.checked;
    chrome.storage.local.set({ toggleState: newState });
  });

  // Clear logs button
  clearLogsBtn.addEventListener("click", () => {
    chrome.storage.local.set({ redirectScanResults: [] }, () => {
      resultsContainer.innerHTML = "";
    });
  });

  // Function to update displayed results
  function updateResults() {
    chrome.storage.local.get("redirectScanResults", (data) => {
      const results = data.redirectScanResults || [];
      resultsContainer.innerHTML = "";
      if (results.length > 0) {
        results.forEach(result => {
          const li = document.createElement("li");
          li.textContent = `Owner: ${result.owner} | Param: ${result.param} | Value: ${result.value} | Link: ${result.link}`;
          resultsContainer.appendChild(li);
        });
      } else {
        resultsContainer.textContent = "No redirect parameters detected.";
      }
    });
  }

  // Initial load of results
  updateResults();

  // Listen for storage changes and update the results list
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.redirectScanResults) {
      updateResults();
    }
  });
});

