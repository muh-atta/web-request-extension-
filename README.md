# Media Grabber Chrome Extension

**Media Grabber** is a Chrome extension that allows you to capture and download images and videos (including blob videos) from websites like Instagram, TikTok, and more. It combines **page media** and **network media** and displays them in an easy-to-use popup.

---

## Features

- Capture images (`.jpg`, `.png`, `.webp`, etc.) and videos (`.mp4`, `.webm`) from the page.  
- Capture **blob videos** and convert them to downloadable snapshots.  
- Capture media loaded via network requests (XHR/fetch).  
- Lazy-loaded media detection using MutationObserver.  
- Download media directly from popup.  
- Responsive popup UI with grid layout for easy browsing.

---

## Installation

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the project folder.
5. The extension icon will appear in the Chrome toolbar.

---

## Usage

1. Navigate to a webpage containing media (Instagram, TikTok, etc.).
2. Click the **Media Grabber** extension icon.
3. The popup will show all detected images and videos.
4. Click **Download** on any media item to save it locally.

---

## File Structure






---

## Technical Details

### Content Script (`content.js`)

- Collects images and videos from the page DOM.
- Handles **blob URLs** for videos/images.
- Uses `MutationObserver` to track lazy-loaded content.
- Listens for `getMedia` messages from the popup.

### Popup Script (`popup.js`)

- Sends a message to content script & background script to get all media.
- Combines media arrays and removes duplicates.
- Renders media items with download buttons in the popup.

### Blob Video Handling

```javascript
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
