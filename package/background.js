import { arrayBufferToData } from './array-buffer-to-data.js';

var directNavTest = /^(https:\/\/(?:www|m)\.youtube\.com)\/?(\?.+?)?(#.+?)?$/;
var spaApiTest = /\/youtubei\/v1\/browse/;
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    switch (details.method) {
	    case 'GET': {
		    // Direct navigation
		    const match = details.url.match(directNavTest);
		    if (match !== null) {
		      // Remove pointless funky query string
		      const queryString = typeof match[2] === 'string' && match[2] === '?pbjreload=102'
		        ? ''
		        : match[2] || '';
		      return {
		        redirectUrl: match[1] + '/feed/subscriptions' + queryString + (match[3] || '')
		      };
		    }
	    } break;
	    case 'POST': {
		    const match = details.url.match(spaApiTest);
		    if (match !== null) {
		      let requestBody = {};
		      try {
		        // Try to decode request body
		        requestBody = arrayBufferToData.toJSON(details.requestBody.raw[0].bytes) || {};
		      } catch (e) {
		        // Ignore error
		      }

			    // Cancel any requests that contain the home page browseId
			    if ('browseId' in requestBody && requestBody.browseId === 'FEwhat_to_watch')
			      // By cancelling this request the frontend falls back to a full page reload
			      // which we redirect in the GET branch of this switch
			      return { cancel: true };
		    }
	    } break;
    }
  },
  { urls: ['https://www.youtube.com/*', 'https://m.youtube.com/*'] },
  ['blocking', 'requestBody'],
);
