document.getElementById("scan").addEventListener("click", function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let currentTab = tabs[0];
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      function: detectRedirects
    });
  });
});

function detectRedirects() {
  let redirectParams = ["redirect", "url", "next", "return", "returnTo", "destination", "goto"];
  let currentUrl = window.location.href;
  
  for (let param of redirectParams) {
    if (new URL(currentUrl).searchParams.has(param)) {
      document.getElementById("result").innerText = "[!!] Open Redirect Found!";
      console.warn(`[!!] Possible Open Redirect: ${currentUrl}`);
    }
  }
}
