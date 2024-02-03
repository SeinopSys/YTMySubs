const isFirefox = typeof browser !== 'undefined';
const ext = isFirefox ? browser : chrome;
const directNavTest = /^(https:\/\/(?:www|m)\.youtube\.com)\/?(\?.+?)?(#.+?)?$/;
const spaApiTest = /\/youtubei\/v1\/browse/;

const matchGetUrl = url => {
  const match = url.match(directNavTest);
  if (match === null) {
    return;
  }

  // Remove pointless funky query string
  const queryString = typeof match[2] === 'string' && match[2] === '?pbjreload=102'
    ? ''
    : match[2] || '';
  return {
    redirectUrl: match[1] + '/feed/subscriptions' + queryString + (match[3] || ''),
  };
};

const browseId = 'FEwhat_to_watch';
const isObjectKey = (src, key) => key in src && typeof src[key] === 'object' && src[key] !== null;
const isArrayKey = (src, key) => key in src && Array.isArray(src[key]);
const isOldHomePageNavigation = (requestBody) => 'browseId' in requestBody && requestBody.browseId === browseId;
const isNewHomePageNavigation = (requestBody) => {
  return isObjectKey(requestBody, 'contents')
    && isObjectKey(requestBody.contents, 'twoColumnBrowseResultsRenderer')
    && isArrayKey(requestBody.contents.twoColumnBrowseResultsRenderer, 'tabs')
    && isObjectKey(requestBody.contents.twoColumnBrowseResultsRenderer.tabs, 0)
    && requestBody.contents.twoColumnBrowseResultsRenderer.tabs[0].tabIdentifier === browseId;
};

// Blocking webRequets to capture navigation attempts
ext.webRequest.onBeforeRequest.addListener(
  details => {
    if (details.method === 'GET') {
      const returnValue = matchGetUrl(details.url);
      if (returnValue) return returnValue;
    }
  },
  { urls: ['https://www.youtube.com/*', 'https://m.youtube.com/*'] },
  ['blocking', 'requestBody'],
);

// Tab update listener
ext.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) {
    return;
  }

  // If tab URL changed to home page replace it with subscriptions
  const returnValue = matchGetUrl(changeInfo.url);
  if (returnValue && returnValue.redirectUrl) {
    const updateOptions = { url: returnValue.redirectUrl };
    if (isFirefox) {
      // Only supported in Firefox
      updateOptions.loadReplace = true;
    }
    ext.tabs.update(tabId, updateOptions);
  }
});
