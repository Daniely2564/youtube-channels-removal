const videoCard = "ytd-rich-item-renderer";
const recommendCard = "ytd-compact-video-renderer";
const pathname = window.location.pathname;
// Save references to the original methods
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

// Override pushState
history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    window.dispatchEvent(new Event('pathname-changed'));
    return result;
};

// Override replaceState
history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    window.dispatchEvent(new Event('pathname-changed'));
    return result;
};

// Listen for the custom event
window.addEventListener('pathname-changed', () => {
    console.log('Pathname changed to:', window.location.pathname);
});

declare const chrome: any;

let listToRemove: string[] = [];

const storage = {
    set: async (key: string, value: any) => new Promise<void>((resolve) => chrome.storage.local.set({ [key]: value }, resolve)),
    get: async (key: string) => new Promise((resolve) => chrome.storage.local.get([key], (result: any) => resolve(result[key]))),
    remove: (key: string) => new Promise<void>((resolve) => chrome.storage.local.remove(key, resolve)),
}

window.onload = async () => {
    listToRemove = JSON.parse(await storage.get('list-to-remove') as string || "[]");
    console.log({ pathname });
    // switch (pathname) {
    //     case "/":
    handleRoot();
    handleWatch()
    //     break;
    // default:
    //     break;
    // }
}

/**
 * @route /
 * Handles the root page 
 */
function handleRoot() {
    let count = 0;
    const observer = new MutationObserver(() => {
        const videoSections = document.querySelectorAll(videoCard);
        videoSections.forEach((section) => {
            const titleElement = section.querySelector('#video-title-link');
            const channelName = section.querySelector('#channel-name');
            const sponsored = section.querySelector('div[aria-label="Sponsored"]');

            const title = titleElement?.textContent?.trim() || "";

            // e.g. 총몇명\n  \n  \n  \n    총몇명\n  \n\n\n\n\n  Verified
            const channelRaw = channelName?.textContent?.trim() || "";
            const channel = channelRaw.split('\n')[0].trim();

            if (listToRemove.includes(channel)) {
                console.log(`차단한 채널 ${listToRemove.find((f) => f === channel)} 에서 "${title}"를 발견했습니다. 지우는중...`);
                section.remove();
            }

            if (sponsored) {
                count++;
                console.log(`광고를 지웠습니다. 총 ${count} 개를 없애버렸음. 당신의 시간은 소중하니깐 😊.`);
                section.remove();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    // observer.disconnect();
}

function handleWatch() {
    const observer = new MutationObserver(() => {
        const videoSections = document.querySelectorAll(recommendCard);
        videoSections.forEach((section) => {
            const titleElement = section.querySelector("#video-title");
            const channelName = section.querySelector("#channel-name");

            const title = titleElement?.textContent?.trim() || "";

            // e.g. 총몇명\n  \n  \n  \n    총몇명\n  \n\n\n\n\n  Verified
            const channelRaw = channelName?.textContent?.trim() || "";
            const channel = channelRaw.split("\n")[0].trim();

            if (listToRemove.includes(channel)) {
                console.log(
                    `차단한 채널 ${listToRemove.find(
                        (f) => f === channel
                    )} 에서 "${title}"를 발견했습니다. 지우는중...`
                );
                section.remove();
            }
        });

        const ads = document.querySelectorAll("ytd-in-feed-ad-layout-renderer") || [];
        ads.forEach((ad) => {
            ad.remove();
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}