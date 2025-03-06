const videoCard = "ytd-rich-item-renderer";
const recommendCard = "ytd-compact-video-renderer";
const cardsFromSearchResult = "ytd-video-renderer";
const channelFromSearch = "ytd-channel-renderer";

let loadingToGoHome = false;
let loadingToNavigateToSearchQuery = false;
const defaultHome =
  "https://www.youtube.com/results?search_query=%EC%8A%88%EC%B9%B4%EC%9B%94%EB%93%9C";

const removeAds = () => {
  const adSelectors = [
    "ytd-ad-slot-renderer",
    ".ytp-ad-module",
    ".video-ads",
    ".ytp-ad-player-overlay",
    "ytd-companion-slot-renderer",
    "ytd-promoted-sparkles-text-search-renderer",
  ];

  adSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((ad) => ad.remove());
  });

  // Skip video ads
  const skipButton = document.querySelector(".ytp-ad-skip-button");
  if (skipButton) {
    (skipButton as any).click?.();
  }
};

function navigateToHome() {
  if (loadingToGoHome || window.location.href === defaultHome) {
    return;
  }

  loadingToGoHome = true;
  window.location.href = defaultHome;
  loadingToGoHome = false;
}

function navigateToSearchQuery() {
  if (loadingToNavigateToSearchQuery || window.location.href === defaultHome) {
    return;
  }
  loadingToNavigateToSearchQuery = true;
  window.location.href = defaultHome;
  loadingToNavigateToSearchQuery = false;
}

function mutationObserver(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.body, { childList: true, subtree: true });
}

declare const chrome: any;

let listToRemove: string[] = [];

const storage = {
  set: async (key: string, value: any) =>
    new Promise<void>((resolve) =>
      chrome.storage.local.set({ [key]: value }, resolve)
    ),
  get: async (key: string) =>
    new Promise((resolve) =>
      chrome.storage.local.get([key], (result: any) => resolve(result[key]))
    ),
  remove: (key: string) =>
    new Promise<void>((resolve) => chrome.storage.local.remove(key, resolve)),
};

window.onload = async () => {
  listToRemove = JSON.parse(
    ((await storage.get("list-to-remove")) as string) || "[]"
  );
  const enabled = (await storage.get("enabled")) === "true";
  if (enabled) {
    mutationObserver(() => {
      if (window.location.href === "https://www.youtube.com/") {
        navigateToSearchQuery();
      }
      handleRoot();
      handleWatch();
      handleSearchResult();
      removeAds();
    });
  }
};

/**
 * @route /
 * Handles the root page
 */
function handleRoot() {
  let count = 0;
  const videoSections = document.querySelectorAll(videoCard);
  videoSections.forEach((section) => {
    const titleElement = section.querySelector("#video-title-link");
    const channelName = section.querySelector("#channel-name");
    const sponsored = section.querySelector('div[aria-label="Sponsored"]');

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

    if (sponsored) {
      count++;
      console.log(
        `광고를 지웠습니다. 총 ${count} 개를 없애버렸음. 당신의 시간은 소중하니깐 😊.`
      );
      section.remove();
    }
  });
}

/**
 * @route /watch?v=${id}
 */
function handleWatch() {
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

  const videoWatchingOwnerRaw =
    document.querySelector("#upload-info > #channel-name")?.textContent || "";
  const videoWatchingOwner = videoWatchingOwnerRaw.trim().split("\n")[0].trim();

  if (listToRemove.includes(videoWatchingOwner)) {
    navigateToHome();
  }
}

function handleSearchResult() {
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
    const channelTitle = sanitizeChannelName(
      channel.querySelector("#channel-title")?.textContent?.trim() || ""
    );
    if (listToRemove.includes(channelTitle)) {
      console.log(
        `차단한 채널 ${channelTitle}을 검색결과에서 발견했습니다. 지우는중...`
      );
      channel.remove();
    }
  });
}
function sanitizeChannelName(name: string) {
  return name.trim().split("\n")[0].trim();
}
