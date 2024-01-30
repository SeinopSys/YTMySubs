(() => {
  const ext = typeof browser !== 'undefined' ? browser : chrome;
  const targetPath = '/feed/subscriptions';
  const subcriptionsAnchorSelector = `a[href="${targetPath}"]`;

  /**
   * Polls for an element up to a specific timeout then simply resolves with null
   * @param {string} selector
   * @returns {Promise<HTMLElement|null>}
   */
  const pollForElement = (selector) => new Promise(resolve => {
    let timeoutInterval = setTimeout(() => {
      if (pollInterval) clearInterval(pollInterval);
      clearTimeout(timeoutInterval);
      timeoutInterval = null;
      resolve(null);
    }, 5e3);
    const intervalFunction = () => {
      const element = document.querySelector(selector);
      if (!element) return;

      clearInterval(pollInterval);
      if (timeoutInterval) clearTimeout(timeoutInterval);
      window.requestAnimationFrame(() => {
        resolve(element);
      });
    };
    let pollInterval = setInterval(intervalFunction, 200);
    intervalFunction();
  });

  const replaceIconWithAppIcon = (selector, parent) => {
    const iconElement = parent.querySelector(selector);
    if (iconElement) {
      iconElement.style.backgroundImage = `url("${ext.runtime.getURL('icons/appicon.svg')}")`;
      iconElement.style.backgroundPosition = `center`;
      iconElement.style.backgroundSize = `contain`;
      Array.from(iconElement.children).forEach(child => {
        child.setAttribute('style', 'opacity: 0 !important');
      });
    }
  };

  const changeText = (selector, parent, to) => {
    const element = parent.querySelector(selector);
    if (element) {
      element.innerText = to;
    }
  };

  // YTMySubs Content Script
  ext.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (typeof request === 'object' && request !== null) {
        if ('redirectToSubscriptions' in request && request.redirectToSubscriptions === true) {
          // Wait for offline content message to ensure route change actually happened
          pollForElement('ytd-background-promo-renderer[icon-name="offline-no-content:OFFLINE_NO_CONTENT"]').then(promoWrapper => {
            if (promoWrapper) {
              // Purely cosmetic page changes, allowed to fail
              try {
                replaceIconWithAppIcon('.ytd-background-promo-renderer', promoWrapper);
                changeText('.promo-title', promoWrapper, 'YTMySubs blocked this request');
                changeText('.promo-body-text', promoWrapper, 'Redirecting you to your subscriptions…');
              } catch (e) {
                console.warn(e);
              }
            }

            window.requestAnimationFrame(function retry() {
              // Actual redirection (history.replaceState does *not* work)
              let anchorElement = document.querySelector(subcriptionsAnchorSelector);
              if (!anchorElement) {
                const guideButton = document.getElementById('guide-button');
                if (guideButton) {
                  guideButton.click();
                  pollForElement(subcriptionsAnchorSelector).then(retry);
                  return;
                }
              }
              if (anchorElement) {
                anchorElement.click();
              }
              else {
                // Fall back to full page reload (hopefully never needs to happen unless page structure changes drastically)
                window.location.replace(targetPath);
              }
            });
          });
          sendResponse(true);
          return;
        }
      }

      sendResponse(false);
    },
  );
})();
