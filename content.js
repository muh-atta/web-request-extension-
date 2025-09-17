// let pageMedia = [];

// // Convert blob to dataURL
// function blobToDataURL(blob) {
//     return new Promise(resolve => {
//         const reader = new FileReader();
//         reader.onload = () => resolve(reader.result);
//         reader.readAsDataURL(blob);
//     });
// }



// // Collect images/videos from the page
// async function collectPageMedia() {
//     pageMedia = [];
//     const mediaEls = document.querySelectorAll("img, video");

//     for (const el of mediaEls) {
//         if (!el.src) continue;

//         // Handle blob URLs
//         if (el.src.startsWith("blob:")) {
//             try {
//                 const resp = await fetch(el.src);
//                 const blob = await resp.blob();
//                 const dataURL = await blobToDataURL(blob);
//                 pageMedia.push(dataURL);
//             } catch {
//                 console.warn("Failed to fetch blob media", el.src);
//             }
//         } else {
//             pageMedia.push(el.src);
//         }
//     }
// }

// // Initial collection
// collectPageMedia();

// // Observe DOM changes for lazy-loaded media
// const observer = new MutationObserver(() => collectPageMedia());
// observer.observe(document.body, { childList: true, subtree: true });

// // Listen for messages from popup
// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//     if (msg.type === "getMedia") {
//         sendResponse({ media: Array.from(pageMedia) });
//     }
// });



let pageMedia = [];

function blobToDataURL(blob) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

async function blobVideoToDataURL(videoEl) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement("canvas");
            canvas.width = videoEl.videoWidth;
            canvas.height = videoEl.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("video/webm"));
        } catch (err) {
            reject(err);
        }
    });
}
async function collectPageMedia() {
    pageMedia = [];
    const mediaEls = document.querySelectorAll("img, video");

    for (const el of mediaEls) {
        if (!el.src) continue;

        if (el.tagName === "VIDEO" && el.src.startsWith("blob:")) {
            try {
                const dataURL = await blobVideoToDataURL(el);
                pageMedia.push(dataURL);
            } catch (err) {
                console.warn("Failed to capture blob video frame", el.src);
            }
        } else if (el.src.startsWith("blob:") || el.src.startsWith("data:")) {
            try {
                const resp = await fetch(el.src);
                const blob = await resp.blob();
                const dataURL = await blobToDataURL(blob);
                pageMedia.push(dataURL);
            } catch {
                console.warn("Failed to fetch blob media", el.src);
            }
        } else {
            pageMedia.push(el.src);
        }
    }
}

collectPageMedia();

const observer = new MutationObserver(() => collectPageMedia());
observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "getMedia") {
        sendResponse({ media: Array.from(pageMedia) });
    }
});
