const videoCard = "ytd-rich-item-renderer";
const recommendCard = "ytd-compact-video-renderer";
const cardsFromSearchResult = "ytd-video-renderer";
const channelFromSearch = "ytd-channel-renderer"

let navgiateHomeSchedule: ReturnType<typeof setInterval> | undefined = undefined;
let loadingToGoHome = false;

function navigateToHome(msg: string) {
    if (navgiateHomeSchedule || loadingToGoHome) {
        return;
    }
    const home = "https://www.youtube.com/";
    loadingToGoHome = true;
    console.log(msg);

    navgiateHomeSchedule = setInterval(() => {
        if (window.location.href === home) {
            clearInterval(navgiateHomeSchedule);
            navgiateHomeSchedule = undefined;
            loadingToGoHome = false;
            return;
        }
        window.location.href = home;
    }, 500);

}

declare const chrome: any;

let listToRemove: string[] = [];

const storage = {
    set: async (key: string, value: any) => new Promise<void>((resolve) => chrome.storage.local.set({ [key]: value }, resolve)),
    get: async (key: string) => new Promise((resolve) => chrome.storage.local.get([key], (result: any) => resolve(result[key]))),
    remove: (key: string) => new Promise<void>((resolve) => chrome.storage.local.remove(key, resolve)),
}

window.onload = async () => {
    listToRemove = JSON.parse(await storage.get('list-to-remove') as string || "[]");
    const enabled = await storage.get('enabled') === 'true'
    if (enabled) {
        // switch (pathname) {
        //     case "/":
        handleRoot();
        handleWatch()
        handleSearchResult();
        //     break;
        // default:
        //     break;
        // }
    }
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

/**
 * @route /watch?v=${id}
 */
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


        const videoWatchingOwnerRaw = document.querySelector("#upload-info > #channel-name")?.textContent || "";
        const videoWatchingOwner = videoWatchingOwnerRaw.trim().split("\n")[0].trim();

        if (listToRemove.includes(videoWatchingOwner)) {
            const msg = `차단한 채널 ${listToRemove.find((f) => f === videoWatchingOwner)} 에서 영상을 시청중이시군요. 홈으로 돌아갑니다...`;
            navigateToHome(msg);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function handleSearchResult() {
    const observer = new MutationObserver(() => {
        const videoSections = document.querySelectorAll(cardsFromSearchResult);
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

        const channels = document.querySelectorAll(channelFromSearch);
        channels.forEach((channel) => {
            const channelTitle = sanitizeChannelName(channel.querySelector('#channel-title')?.textContent?.trim() || '');
            if (listToRemove.includes(channelTitle)) {
                console.log(`차단한 채널 ${channelTitle}을 검색결과에서 발견했습니다. 지우는중...`);
                channel.remove();
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function sanitizeChannelName(name: string) {
    return name.trim().split("\n")[0].trim();
}