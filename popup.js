document.addEventListener("DOMContentLoaded", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { type: "getMedia" }, async (pageResponse) => {
        if (chrome.runtime.lastError) {
            console.warn("Content script not ready, using network media only.");
            pageResponse = { media: [] };
        }

        chrome.runtime.sendMessage({ type: "getMedia", tabId: tab.id }, async (networkResponse) => {
            const mediaList = document.getElementById("mediaList");
            mediaList.innerHTML = "";

            const pageMedia = pageResponse?.media || [];
            const networkMedia = networkResponse?.media || [];

            const combinedMedia = Array.from(new Set([...pageMedia, ...networkMedia]));

            if (!combinedMedia.length) {
                mediaList.textContent = "No media found.";
                return;
            }

            combinedMedia.forEach(src => {
                const div = document.createElement("div");
                div.className = "mediaItem";

                let mediaEl;
                if (src.match(/\.(mp4|webm)$/i) || src.startsWith("data:video")) {
                    mediaEl = document.createElement("video");
                    mediaEl.src = src;
                    mediaEl.controls = true;
                } else {
                    mediaEl = document.createElement("img");
                    mediaEl.crossOrigin = "anonymous";
                    mediaEl.src = src;
                }

                mediaEl.onerror = () => {
                    const errorText = document.createElement("span");
                    errorText.className = "notFound";
                    errorText.textContent = "Blocked or not loaded";
                    div.appendChild(errorText);
                };

                const btn = document.createElement("button");
                btn.className = "downloadBtn";
                btn.textContent = "Download";
                btn.onclick = async () => {
                    if (src.startsWith("data:")) {
                        const res = await fetch(src);
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        chrome.downloads.download({ url });
                    } else {
                        chrome.downloads.download({ url: src });
                    }
                };

                div.appendChild(mediaEl);
                div.appendChild(btn);
                mediaList.appendChild(div);
            });
        });
    });
});
