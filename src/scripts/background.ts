declare const chrome: any;

chrome.webRequest.onBeforeRequest.addListener(
  () => ({ cancel: true }),
  {
    urls: [
      "*://www.youtube.com/get_video_info?*ad*",
      "*://www.youtube.com/api/stats/ads*",
      "*://googleads.g.doubleclick.net/*",
    ],
  },
  ["blocking"]
);
