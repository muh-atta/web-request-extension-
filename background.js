let networkMediaUrls = {};

chrome.webRequest.onCompleted.addListener(
    (details) => {
        if (details.statusCode !== 200) return;
        const url = details.url;

        if (url.startsWith("blob:") || url.startsWith("data:")) return;
        if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|mp4|webm)$/i)) {
            if (!networkMediaUrls[details.tabId]) networkMediaUrls[details.tabId] = new Set();
            networkMediaUrls[details.tabId].add(url);
        }
    },
    { urls: ["<all_urls>"] }
);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "getMedia") {
        const tabId = sender.tab?.id;
        sendResponse({ media: Array.from(networkMediaUrls[tabId] || []) });
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});
