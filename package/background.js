var test = /^(https:\/\/(?:www|m)\.youtube\.com)\/?(\?.+?)?(#.+?)?$/;
chrome.webRequest.onBeforeRequest.addListener(
	function(details){
		if (details.method !== 'GET')
			return;

		var match =  details.url.match(test);
		if (match !== null)
			return {redirectUrl: match[1]+'/feed/subscriptions'+(match[2]||'')+(match[3]||'')};
	},
	{urls: ['https://www.youtube.com/*']},
	["blocking"]
);
